package com.xmrigforandroid;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;

import com.xmrigforandroid.data.serialization.XMRigFork;
import com.xmrigforandroid.events.MinerStartEvent;
import com.xmrigforandroid.events.MinerStopEvent;
import com.xmrigforandroid.events.StdoutEvent;
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
    
    // Action constants for notification buttons and intent handling
    public static final String ACTION_STOP_MINING = "com.xmrigforandroid.STOP_MINING";
    public static final String ACTION_PAUSE_MINING = "com.xmrigforandroid.PAUSE_MINING";
    public static final String ACTION_RESUME_MINING = "com.xmrigforandroid.RESUME_MINING";
    
    // Mining state enum for better state management
    private enum MiningState {
        IDLE, STARTING, RUNNING, PAUSED, STOPPED
    }
    
    private Notification.Builder notificationbuilder;
    private Process process;
    private OutputReaderThread outputHandler;
    private PowerManager.WakeLock wakeLock; // PHASE1: Fix wake lock as instance variable
    private MiningState currentState = MiningState.IDLE;

    private final String ansiRegex = "\\e\\[[\\d;]*[^\\d;]";
    private final Pattern ansiRegexPattern = Pattern.compile(ansiRegex);

    @Override
    public void onCreate() {
        super.onCreate();

        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, 
                getPendingIntentFlags());

        // PHASE1: Setup notification with dynamic content and action buttons
        notificationbuilder = new Notification.Builder(this, NOTIFICATION_CHANNEL_ID)
                .setContentTitle("Mining Idle")
                .setContentText("XMRig for Android Service")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .setTicker("XMRig for Android Service")
                .setOngoing(true)
                .setOnlyAlertOnce(true);

        // Add action buttons
        addNotificationActions();

        NotificationManager notificationManager = (NotificationManager) getApplication()
                .getSystemService(Context.NOTIFICATION_SERVICE);
        
        // PHASE1: Set channel importance to LOW to avoid sound
        NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL_ID,
                NOTIFICATION_CHANNEL_NAME, NotificationManager.IMPORTANCE_LOW);
        notificationManager.createNotificationChannel(channel);

        notificationManager.notify(NOTIFICATION_ID, notificationbuilder.build());
        this.startForeground(NOTIFICATION_ID, notificationbuilder.build());
    }
    
    // PHASE1: Helper method for PendingIntent flags with API compatibility
    private int getPendingIntentFlags() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        } else {
            return PendingIntent.FLAG_UPDATE_CURRENT;
        }
    }
    
    // PHASE1: Add notification action buttons based on current state
    private void addNotificationActions() {
        notificationbuilder.mActions.clear(); // Clear existing actions
        
        if (currentState == MiningState.RUNNING) {
            // Add Pause and Stop actions when mining is active
            Intent pauseIntent = new Intent(this, MiningService.class);
            pauseIntent.setAction(ACTION_PAUSE_MINING);
            PendingIntent pausePendingIntent = PendingIntent.getService(this, 1, pauseIntent, 
                    getPendingIntentFlags());
            notificationbuilder.addAction(new Notification.Action.Builder(
                    null, "Pause", pausePendingIntent).build());
        } else if (currentState == MiningState.PAUSED) {
            // Add Resume action when mining is paused
            Intent resumeIntent = new Intent(this, MiningService.class);
            resumeIntent.setAction(ACTION_RESUME_MINING);
            PendingIntent resumePendingIntent = PendingIntent.getService(this, 2, resumeIntent, 
                    getPendingIntentFlags());
            notificationbuilder.addAction(new Notification.Action.Builder(
                    null, "Resume", resumePendingIntent).build());
        }
        
        // Always add Stop action
        Intent stopIntent = new Intent(this, MiningService.class);
        stopIntent.setAction(ACTION_STOP_MINING);
        PendingIntent stopPendingIntent = PendingIntent.getService(this, 3, stopIntent, 
                getPendingIntentFlags());
        notificationbuilder.addAction(new Notification.Action.Builder(
                null, "Stop", stopPendingIntent).build());
    }

    // PHASE1: Handle intent actions for pause/resume/stop operations
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            Log.i(LOG_TAG, "Received action: " + action);
            
            switch (action) {
                case ACTION_PAUSE_MINING:
                    pauseMining();
                    break;
                case ACTION_RESUME_MINING:
                    resumeMining();
                    break;
                case ACTION_STOP_MINING:
                    stopMining();
                    break;
            }
        }
        return START_STICKY;
    }
    
    // PHASE1: Pause mining operation
    private void pauseMining() {
        if (currentState == MiningState.RUNNING) {
            // TODO PHASE2: Implement actual pause of XMRig process when native interface supports it
            // For now, simulate by reducing update frequency and marking as paused
            currentState = MiningState.PAUSED;
            updateNotificationState();
            Log.i(LOG_TAG, "Mining paused (simulated - TODO: implement native pause)");
        }
    }
    
    // PHASE1: Resume mining operation
    private void resumeMining() {
        if (currentState == MiningState.PAUSED) {
            // TODO PHASE2: Implement actual resume of XMRig process when native interface supports it
            currentState = MiningState.RUNNING;
            updateNotificationState();
            Log.i(LOG_TAG, "Mining resumed (simulated - TODO: implement native resume)");
        }
    }
    
    // PHASE1: Update notification based on current state
    private void updateNotificationState() {
        String title;
        switch (currentState) {
            case RUNNING:
                title = "Mining Active";
                break;
            case PAUSED:
                title = "Mining Paused";
                break;
            case STOPPED:
                title = "Mining Stopped";
                break;
            case STARTING:
                title = "Mining Starting";
                break;
            default:
                title = "Mining Idle";
                break;
        }
        
        notificationbuilder.setContentTitle(title);
        addNotificationActions();
        
        NotificationManager notificationManager = (NotificationManager) getApplication()
                .getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, notificationbuilder.build());
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
        // PHASE1: Ensure wake lock is properly released before destroying service
        stopMining();
        releaseWakeLock();
        super.onDestroy();
    }

    public void stopMining() {
        currentState = MiningState.STOPPED;
        updateNotificationState();
        
        if (outputHandler != null) {
            outputHandler.interrupt();
            outputHandler = null;
        }
        if (process != null) {
            process.destroy();
            process = null;
            Log.i(LOG_TAG, "stopped");
        }
        
        // PHASE1: Release wake lock when stopping mining
        releaseWakeLock();
    }
    
    // PHASE1: Helper method to safely release wake lock
    private void releaseWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            wakeLock = null;
            Log.i(LOG_TAG, "Wake lock released");
        }
    }
    
    // PHASE1: Helper method to acquire wake lock (only if background mining is allowed)
    private void acquireWakeLock() {
        // TODO PHASE2: Check allowBackgroundMining setting from React Native context
        // For now, always acquire for backward compatibility
        if (wakeLock == null) {
            PowerManager powerManager = (PowerManager) getSystemService(POWER_SERVICE);
            wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,
                    "XMRigForAndroid::MinerWakeLock");
        }
        
        if (!wakeLock.isHeld()) {
            wakeLock.acquire();
            Log.i(LOG_TAG, "Wake lock acquired");
        }
    }

    public void startMining(String configPath, String xmrigFork) {
        // PHASE1: Use instance wake lock with proper lifecycle management
        acquireWakeLock();
        
        currentState = MiningState.STARTING;
        updateNotificationState();

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

            // PHASE1: Update state to running when successfully started
            currentState = MiningState.RUNNING;
            updateNotificationState();
            EventBus.getDefault().post(new MinerStartEvent());

        } catch (Exception e) {
            Log.e(LOG_TAG, "exception:", e);
            process = null;
            currentState = MiningState.STOPPED;
            updateNotificationState();
            // PHASE1: Release wake lock on exception
            releaseWakeLock();
        }
    }

    public void updateNotification(String str) {
        Matcher matcher = ansiRegexPattern.matcher(str);
        String cleanStr = matcher.replaceAll("");
        
        // PHASE1: Parse hashrate from XMRig output for dynamic notification content
        String displayText = parseHashrateFromOutput(cleanStr);
        
        // PHASE1: Add donation percentage if > 0 (placeholder for now)
        String donationText = getDonationDisplayText();
        if (!donationText.isEmpty()) {
            displayText += " – " + donationText;
        }
        
        notificationbuilder.setContentText(displayText);
        
        NotificationManager notificationManager = (NotificationManager) getApplication()
                .getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(NOTIFICATION_ID, notificationbuilder.build());
    }
    
    // PHASE1: Parse hashrate from XMRig output line
    private String parseHashrateFromOutput(String line) {
        // Look for XMRig speed pattern (e.g., "speed 10s/60s/15m 1234.5 0.0 0.0 H/s")
        if (line.contains("speed") && line.contains("H/s")) {
            try {
                String[] parts = line.split("\\s+");
                for (int i = 0; i < parts.length - 1; i++) {
                    if (parts[i+1].equals("H/s") && !parts[i].equals("0.0")) {
                        return parts[i] + " H/s";
                    }
                }
            } catch (Exception e) {
                Log.w(LOG_TAG, "Failed to parse hashrate from: " + line);
            }
        }
        
        // Fallback to showing the last output line (sanitized)
        if (line.trim().length() > 0) {
            return line.length() > 50 ? line.substring(0, 47) + "..." : line;
        }
        
        return "Starting...";
    }
    
    // PHASE1: Get donation display text (placeholder implementation)
    private String getDonationDisplayText() {
        // TODO PHASE2: Integrate with React Native settings context to get actual donation percentage
        // For now, return placeholder text when donation > 0
        int donationPercent = 5; // Placeholder - should come from settings
        
        if (donationPercent > 0) {
            return "Charity " + donationPercent + "%";
        }
        
        return "";
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
}