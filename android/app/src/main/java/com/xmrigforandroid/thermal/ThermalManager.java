package com.xmrigforandroid.thermal;

import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.BatteryManager;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

import com.xmrigforandroid.events.ThermalStateChangedEvent;
import com.xmrigforandroid.events.TemperatureUpdateEvent;

import org.greenrobot.eventbus.EventBus;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

/**
 * Advanced Thermal Management System for XMRig Mining
 * Monitors multiple temperature sources and implements smart cooling strategies
 */
public class ThermalManager extends Service implements SensorEventListener {
    private static final String LOG_TAG = "ThermalManager";
    
    // Temperature thresholds (Celsius)
    public static final float TEMP_NORMAL = 35.0f;          // Normal operation
    public static final float TEMP_WARM = 40.0f;            // Start monitoring closely
    public static final float TEMP_HOT = 45.0f;             // Begin throttling
    public static final float TEMP_CRITICAL = 50.0f;        // Emergency cooling
    public static final float TEMP_SHUTDOWN = 55.0f;        // Force stop mining
    
    // Cooling strategies
    public enum ThermalState {
        NORMAL,     // Full performance
        WARM,       // Monitor closely
        HOT,        // Reduce threads by 25%
        CRITICAL,   // Reduce threads by 50%, lower frequency
        EMERGENCY   // Stop mining completely
    }
    
    public enum CoolingStrategy {
        REDUCE_THREADS,
        LOWER_FREQUENCY,
        PAUSE_MINING,
        REDUCE_VOLTAGE,
        INCREASE_FAN_SPEED
    }
    
    private SensorManager sensorManager;
    private Sensor temperatureSensor;
    private Sensor humiditySensor;
    private Timer temperatureTimer;
    private Handler mainHandler;
    
    private ThermalState currentThermalState = ThermalState.NORMAL;
    private float currentTemperature = 0.0f;
    private float batteryTemperature = 0.0f;
    private float cpuTemperature = 0.0f;
    private int originalThreadCount = -1;
    
    // Temperature history for trend analysis
    private List<Float> temperatureHistory = new ArrayList<>();
    private static final int MAX_HISTORY_SIZE = 20;
    
    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(LOG_TAG, "ThermalManager starting...");
        
        mainHandler = new Handler(Looper.getMainLooper());
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        
        // Initialize temperature sensors
        initializeTemperatureSensors();
        
        // Register for battery temperature updates
        registerBatteryTemperatureReceiver();
        
        // Start temperature monitoring timer
        startTemperatureMonitoring();
        
        Log.i(LOG_TAG, "ThermalManager initialized successfully");
    }
    
    private void initializeTemperatureSensors() {
        // Try to get ambient temperature sensor
        temperatureSensor = sensorManager.getDefaultSensor(Sensor.TYPE_AMBIENT_TEMPERATURE);
        if (temperatureSensor != null) {
            sensorManager.registerListener(this, temperatureSensor, SensorManager.SENSOR_DELAY_NORMAL);
            Log.i(LOG_TAG, "Ambient temperature sensor registered");
        } else {
            Log.w(LOG_TAG, "No ambient temperature sensor available");
        }
        
        // Register humidity sensor for better thermal analysis
        humiditySensor = sensorManager.getDefaultSensor(Sensor.TYPE_RELATIVE_HUMIDITY);
        if (humiditySensor != null) {
            sensorManager.registerListener(this, humiditySensor, SensorManager.SENSOR_DELAY_NORMAL);
            Log.i(LOG_TAG, "Humidity sensor registered");
        }
    }
    
    private void registerBatteryTemperatureReceiver() {
        IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        BroadcastReceiver batteryReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                int temperature = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0);
                batteryTemperature = temperature / 10.0f; // Convert from tenths of degree
                updateOverallTemperature();
            }
        };
        registerReceiver(batteryReceiver, filter);
        Log.i(LOG_TAG, "Battery temperature receiver registered");
    }
    
    private void startTemperatureMonitoring() {
        temperatureTimer = new Timer("TemperatureMonitor");
        temperatureTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                readCpuTemperature();
                updateOverallTemperature();
                analyzeThermalTrend();
            }
        }, 0, 2000); // Check every 2 seconds
    }
    
    private void readCpuTemperature() {
        // Try multiple CPU temperature sources
        String[] tempPaths = {
            "/sys/class/thermal/thermal_zone0/temp",
            "/sys/class/thermal/thermal_zone1/temp",
            "/sys/devices/system/cpu/cpu0/cpufreq/cpu_temp",
            "/sys/devices/system/cpu/cpufreq/cpu_temp",
            "/sys/class/hwmon/hwmon0/temp1_input"
        };
        
        for (String path : tempPaths) {
            float temp = readTemperatureFromFile(path);
            if (temp > 0) {
                cpuTemperature = temp;
                break;
            }
        }
    }
    
    private float readTemperatureFromFile(String path) {
        try {
            File tempFile = new File(path);
            if (!tempFile.exists()) return -1;
            
            BufferedReader reader = new BufferedReader(new FileReader(tempFile));
            String line = reader.readLine();
            reader.close();
            
            if (line != null) {
                float temp = Float.parseFloat(line.trim());
                // Most files report in millidegrees, some in degrees
                if (temp > 1000) {
                    temp = temp / 1000.0f;
                }
                return temp;
            }
        } catch (IOException | NumberFormatException e) {
            // Ignore - try next source
        }
        return -1;
    }
    
    private void updateOverallTemperature() {
        // Use the highest available temperature
        currentTemperature = Math.max(Math.max(cpuTemperature, batteryTemperature), 
                                    currentTemperature);
        
        // Add to history for trend analysis
        temperatureHistory.add(currentTemperature);
        if (temperatureHistory.size() > MAX_HISTORY_SIZE) {
            temperatureHistory.remove(0);
        }
        
        // Check thermal state
        ThermalState newState = calculateThermalState();
        if (newState != currentThermalState) {
            handleThermalStateChange(newState);
        }
        
        // Broadcast temperature update
        EventBus.getDefault().post(new TemperatureUpdateEvent(
            currentTemperature, batteryTemperature, cpuTemperature, newState));
    }
    
    private ThermalState calculateThermalState() {
        if (currentTemperature >= TEMP_SHUTDOWN) {
            return ThermalState.EMERGENCY;
        } else if (currentTemperature >= TEMP_CRITICAL) {
            return ThermalState.CRITICAL;
        } else if (currentTemperature >= TEMP_HOT) {
            return ThermalState.HOT;
        } else if (currentTemperature >= TEMP_WARM) {
            return ThermalState.WARM;
        } else {
            return ThermalState.NORMAL;
        }
    }
    
    private void handleThermalStateChange(ThermalState newState) {
        Log.i(LOG_TAG, String.format("Thermal state changed: %s -> %s (%.1f°C)", 
            currentThermalState, newState, currentTemperature));
        
        ThermalState oldState = currentThermalState;
        currentThermalState = newState;
        
        // Apply cooling strategy based on new state
        applyCoolingStrategy(newState, oldState);
        
        // Broadcast state change
        EventBus.getDefault().post(new ThermalStateChangedEvent(oldState, newState, currentTemperature));
    }
    
    private void applyCoolingStrategy(ThermalState newState, ThermalState oldState) {
        switch (newState) {
            case NORMAL:
                if (oldState != ThermalState.NORMAL) {
                    restoreNormalOperation();
                }
                break;
                
            case WARM:
                // Just monitor more closely, no action needed yet
                Log.i(LOG_TAG, "Temperature warming up - monitoring closely");
                break;
                
            case HOT:
                reducePerformance(0.75f); // 25% reduction
                Log.w(LOG_TAG, "HOT: Reducing mining performance by 25%");
                break;
                
            case CRITICAL:
                reducePerformance(0.5f); // 50% reduction
                Log.w(LOG_TAG, "CRITICAL: Reducing mining performance by 50%");
                break;
                
            case EMERGENCY:
                emergencyStop();
                Log.e(LOG_TAG, "EMERGENCY: Stopping mining due to high temperature!");
                break;
        }
    }
    
    private void reducePerformance(float performanceFactor) {
        Intent intent = new Intent("com.xmrigforandroid.THERMAL_THROTTLE");
        intent.putExtra("performance_factor", performanceFactor);
        intent.putExtra("thermal_state", currentThermalState.name());
        sendBroadcast(intent);
    }
    
    private void restoreNormalOperation() {
        Intent intent = new Intent("com.xmrigforandroid.THERMAL_RESTORE");
        sendBroadcast(intent);
        Log.i(LOG_TAG, "Temperature normalized - restoring full performance");
    }
    
    private void emergencyStop() {
        Intent intent = new Intent("com.xmrigforandroid.THERMAL_EMERGENCY");
        intent.putExtra("temperature", currentTemperature);
        sendBroadcast(intent);
    }
    
    private void analyzeThermalTrend() {
        if (temperatureHistory.size() < 5) return;
        
        // Calculate temperature trend over last 10 seconds
        float recentAvg = 0;
        float oldAvg = 0;
        int halfSize = temperatureHistory.size() / 2;
        
        for (int i = 0; i < halfSize; i++) {
            oldAvg += temperatureHistory.get(i);
        }
        for (int i = halfSize; i < temperatureHistory.size(); i++) {
            recentAvg += temperatureHistory.get(i);
        }
        
        oldAvg /= halfSize;
        recentAvg /= (temperatureHistory.size() - halfSize);
        
        float trend = recentAvg - oldAvg;
        
        // Predictive throttling - if temperature is rising quickly, throttle early
        if (trend > 2.0f && currentThermalState == ThermalState.NORMAL) {
            Log.w(LOG_TAG, String.format("Rapid temperature rise detected (%.1f°C/10s) - early throttling", trend));
            handleThermalStateChange(ThermalState.HOT);
        }
    }
    
    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_AMBIENT_TEMPERATURE) {
            float ambientTemp = event.values[0];
            // Use ambient temperature if it's higher than current reading
            if (ambientTemp > currentTemperature) {
                currentTemperature = ambientTemp;
                updateOverallTemperature();
            }
        }
    }
    
    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Not used
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        
        if (temperatureTimer != null) {
            temperatureTimer.cancel();
        }
        
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        
        Log.i(LOG_TAG, "ThermalManager stopped");
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null; // Not a bound service
    }
    
    // Public methods for external access
    public static class ThermalInfo {
        public final float currentTemp;
        public final float batteryTemp;
        public final float cpuTemp;
        public final ThermalState state;
        
        public ThermalInfo(float current, float battery, float cpu, ThermalState state) {
            this.currentTemp = current;
            this.batteryTemp = battery;
            this.cpuTemp = cpu;
            this.state = state;
        }
    }
}