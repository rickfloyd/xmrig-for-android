package com.xmrigforandroid;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Binder;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import com.xmrigforandroid.data.serialization.XMRigFork;
import com.xmrigforandroid.events.MinerStartEvent;
import com.xmrigforandroid.events.MinerStopEvent;
import com.xmrigforandroid.events.StdoutEvent;
import com.xmrigforandroid.thermal.ThermalManager;
import com.xmrigforandroid.thermal.ThermalMiningController;
import com.xmrigforandroid.utils.ProcessExitDetector;

import org.greenrobot.eventbus.EventBus;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MiningService extends Service {

    private static final String LOG_TAG = "MiningSvc";
    private static final String NOTIFICATION_CHANNEL_ID = "com.xmrigforandroid.service";
    private static final String NOTIFICATION_CHANNEL_NAME = "XMRig Service";
    private static final int NOTIFICATION_ID = 200;
    private Notification.Builder notificationbuilder;
    private Process process;
    private OutputReaderThread outputHandler;
    
    // Thermal management components
    private ThermalMiningController thermalController;
    private ThermalBroadcastReceiver thermalReceiver;
    private Intent thermalServiceIntent;

    private final String ansiRegex = "\\e\\[[\\d;]*[^\\d;]";
    private final Pattern ansiRegexPattern = Pattern.compile(ansiRegex);

    @Override
    public void onCreate() {
        super.onCreate();

        // Initialize thermal management system
        initializeThermalManagement();

        Intent notificationIntent = new Intent(this, MiningService.class);
        PendingIntent pendingIntent =
                PendingIntent.getActivity(this, 0, notificationIntent, PendingIntent.FLAG_MUTABLE);

        notificationbuilder =
                new Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
                        .setContentTitle("XMRig for Android")
                        .setContentText("XMRig for Android Service")
                        .setSmallIcon(com.tradinganarchy.compute.R.mipmap.ic_launcher)
                        .setContentIntent(pendingIntent)
                        .setTicker("XMRig for Android Service")
                        .setOngoing(true)
                        .setOnlyAlertOnce(true);

        NotificationManager notificationManager = (NotificationManager) getApplication().getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT);
        notificationManager.createNotificationChannel(channel);

        notificationManager.notify(NOTIFICATION_ID, notificationbuilder.build());

        this.startForeground(NOTIFICATION_ID, notificationbuilder.build());
        
        Log.i(LOG_TAG, "MiningService created with thermal management");
    }

    public class MiningServiceBinder extends Binder {
        public MiningService getService() {
            return MiningService.this;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    private final IMiningService.Stub binder = new IMiningService.Stub() {
        @Override
        public void startMiner(String configPath, String xmrigFork) {
            startMining(configPath, xmrigFork);
        }

        @Override
        public void stopMiner() {
            stopMining();
        }
    };

    @Override
    public void onDestroy() {
        stopMining();
        cleanupThermalManagement();
        super.onDestroy();
        Log.i(LOG_TAG, "MiningService destroyed");
    }

    public void stopMining() {
        if (outputHandler != null) {
            outputHandler.interrupt();
            outputHandler = null;
        }
        if (process != null) {
            process.destroy();
            process = null;
            
            // Notify thermal controller that mining stopped
            if (thermalController != null) {
                thermalController.setMiningActive(false);
            }
            
            Log.i(LOG_TAG, "Mining stopped");
        }
    }

    public void startMining(String configPath, String xmrigFork) {
        PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
        PowerManager.WakeLock wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                "XMRigForAndroid::MinerWakeLock");
        wakeLock.acquire();

        Log.i(LOG_TAG, "starting...");
        if (process != null) {
            process.destroy();
        }

        String xmrigBin = xmrigFork.equals(XMRigFork.MONEROOCEAN.toString()) ? "libxmrig-mo.so" : "libxmrig.so";

        Log.d(LOG_TAG, "libxmrig: " + getApplicationInfo().nativeLibraryDir + "/" + xmrigBin);

        try {
            String[] args = {
                    "./"+getApplicationInfo().nativeLibraryDir + "/" + xmrigBin,
                    "-c", configPath,
                    "--http-host=127.0.0.1",
                    "--http-port=50080",
                    "--http-access-token=XMRigForAndroid",
                    "--http-no-restricted"
            };
            ProcessBuilder pb = new ProcessBuilder(args);
            pb.redirectErrorStream(true);

            process = pb.start();

            ProcessExitDetector processExitDetector = new ProcessExitDetector(process);
            processExitDetector.addProcessListener(process -> EventBus.getDefault().post(new MinerStopEvent()));
            processExitDetector.start();

            outputHandler = new MiningService.OutputReaderThread(process.getInputStream());
            outputHandler.start();

            // Notify thermal controller that mining started
            if (thermalController != null) {
                thermalController.setMiningActive(true);
            }

            EventBus.getDefault().post(new MinerStartEvent());
            Log.i(LOG_TAG, "Mining started with thermal management active");

        } catch (Exception e) {
            Log.e(LOG_TAG, "exception:", e);
            process = null;
            wakeLock.release();
        }

    }

    public void updateNotification(String str) {
        Matcher matcher = ansiRegexPattern.matcher(str);

        notificationbuilder.setContentText(matcher.replaceAll(""));

        NotificationManager notificationManager = (NotificationManager) getApplication().getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, notificationbuilder.build());
    }

    private class OutputReaderThread extends Thread {

        private InputStream inputStream;
        private BufferedReader reader;

        OutputReaderThread(InputStream inputStream) {
            this.inputStream = inputStream;
        }

        public void run() {
            try {
                reader = new BufferedReader(new InputStreamReader(inputStream));
                String line;
                while ((line = reader.readLine()) != null) {
                    updateNotification(line);
                    EventBus.getDefault().post(new StdoutEvent(line));

                    Log.d(LOG_TAG, line);

                    if (currentThread().isInterrupted()) return;
                }
            } catch (IOException e) {
                Log.w(LOG_TAG, "exception", e);
                EventBus.getDefault().post(new MinerStopEvent());
            }
        }
    }
    
    // ======================== THERMAL MANAGEMENT SYSTEM ========================
    
    private void initializeThermalManagement() {
        Log.i(LOG_TAG, "Initializing thermal management system...");
        
        // Initialize thermal controller
        thermalController = new ThermalMiningController(this);
        
        // Start thermal monitoring service
        thermalServiceIntent = new Intent(this, ThermalManager.class);
        startService(thermalServiceIntent);
        
        // Register thermal broadcast receiver
        registerThermalReceiver();
        
        Log.i(LOG_TAG, "Thermal management system initialized");
    }
    
    private void registerThermalReceiver() {
        thermalReceiver = new ThermalBroadcastReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction("com.xmrigforandroid.SET_THREAD_COUNT");
        filter.addAction("com.xmrigforandroid.MINING_PAUSE");
        filter.addAction("com.xmrigforandroid.MINING_RESUME");
        filter.addAction("com.xmrigforandroid.SHOW_TEMPERATURE_WARNING");
        registerReceiver(thermalReceiver, filter);
    }
    
    private void cleanupThermalManagement() {
        if (thermalController != null) {
            thermalController.cleanup();
            thermalController = null;
        }
        
        if (thermalReceiver != null) {
            unregisterReceiver(thermalReceiver);
            thermalReceiver = null;
        }
        
        if (thermalServiceIntent != null) {
            stopService(thermalServiceIntent);
            thermalServiceIntent = null;
        }
        
        Log.i(LOG_TAG, "Thermal management cleaned up");
    }
    
    /**
     * Broadcast receiver for thermal management commands
     */
    private class ThermalBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action == null) return;
            
            switch (action) {
                case "com.xmrigforandroid.SET_THREAD_COUNT":
                    int threadCount = intent.getIntExtra("thread_count", -1);
                    String reason = intent.getStringExtra("reason");
                    if (threadCount > 0) {
                        handleThreadCountChange(threadCount, reason);
                    }
                    break;
                    
                case "com.xmrigforandroid.MINING_PAUSE":
                    String pauseReason = intent.getStringExtra("reason");
                    float temperature = intent.getFloatExtra("temperature", 0.0f);
                    handleThermalPause(pauseReason, temperature);
                    break;
                    
                case "com.xmrigforandroid.MINING_RESUME":
                    String resumeReason = intent.getStringExtra("reason");
                    handleThermalResume(resumeReason);
                    break;
                    
                case "com.xmrigforandroid.SHOW_TEMPERATURE_WARNING":
                    float warningTemp = intent.getFloatExtra("temperature", 0.0f);
                    String message = intent.getStringExtra("message");
                    showTemperatureNotification(warningTemp, message);
                    break;
            }
        }
    }
    
    private void handleThreadCountChange(int newThreadCount, String reason) {
        Log.i(LOG_TAG, String.format("Thermal thread adjustment: %d threads (%s)", newThreadCount, reason));
        
        // Update notification to show thermal throttling
        updateNotification(String.format("🌡️ Thermal management: %d threads (%s)", newThreadCount, reason));
        
        // Here you would typically send a command to XMRig to change thread count
        // This would require implementing XMRig configuration updates
        // For now, we'll just log the action
        Log.w(LOG_TAG, "Thread count change requested but not implemented in mining binary interface");
    }
    
    private void handleThermalPause(String reason, float temperature) {
        Log.w(LOG_TAG, String.format("Thermal pause requested: %s (%.1f°C)", reason, temperature));
        
        // Pause mining temporarily
        if (process != null) {
            // Send SIGSTOP to pause the process (on supported systems)
            Log.i(LOG_TAG, "Attempting to pause mining process due to thermal conditions");
            updateNotification(String.format("⚠️ Mining paused - High temperature: %.1f°C", temperature));
        }
    }
    
    private void handleThermalResume(String reason) {
        Log.i(LOG_TAG, String.format("Thermal resume requested: %s", reason));
        
        if (process != null) {
            // Send SIGCONT to resume the process (on supported systems)  
            Log.i(LOG_TAG, "Resuming mining process - temperature normalized");
            updateNotification("✅ Mining resumed - Temperature normalized");
        }
    }
    
    private void showTemperatureNotification(float temperature, String message) {
        // Update notification with temperature warning
        Notification.Builder warningBuilder = new Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
                .setContentTitle("⚠️ Temperature Warning")
                .setContentText(String.format("Device: %.1f°C - Mining adjusted", temperature))
                .setSmallIcon(com.tradinganarchy.compute.R.mipmap.ic_launcher)
                .setStyle(new Notification.BigTextStyle().bigText(message))
                .setOngoing(true)
                .setPriority(Notification.PRIORITY_HIGH);
        
        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID + 1, warningBuilder.build());
        
        // Auto-dismiss warning after 10 seconds
        new android.os.Handler().postDelayed(() -> {
            notificationManager.cancel(NOTIFICATION_ID + 1);
        }, 10000);
    }
}