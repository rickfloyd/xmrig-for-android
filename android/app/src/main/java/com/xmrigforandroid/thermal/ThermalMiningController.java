package com.xmrigforandroid.thermal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.xmrigforandroid.events.ThermalStateChangedEvent;
import com.xmrigforandroid.events.TemperatureUpdateEvent;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

/**
 * Thermal-aware mining controller that adjusts mining performance
 * based on device temperature to prevent overheating
 */
public class ThermalMiningController {
    private static final String LOG_TAG = "ThermalMiningCtrl";
    
    private Context context;
    private int originalThreadCount = -1;
    private int currentThreadCount = -1;
    private boolean isMiningActive = false;
    private boolean thermalPaused = false;
    
    // Performance adjustment factors
    private static final float PERFORMANCE_NORMAL = 1.0f;
    private static final float PERFORMANCE_HOT = 0.75f;
    private static final float PERFORMANCE_CRITICAL = 0.5f;
    private static final float PERFORMANCE_EMERGENCY = 0.0f;
    
    private ThermalBroadcastReceiver thermalReceiver;
    
    public ThermalMiningController(Context context) {
        this.context = context;
        
        // Register for EventBus notifications
        if (!EventBus.getDefault().isRegistered(this)) {
            EventBus.getDefault().register(this);
        }
        
        // Register for thermal broadcast intents
        registerThermalReceiver();
        
        Log.i(LOG_TAG, "ThermalMiningController initialized");
    }
    
    private void registerThermalReceiver() {
        thermalReceiver = new ThermalBroadcastReceiver();
        IntentFilter filter = new IntentFilter();
        filter.addAction("com.xmrigforandroid.THERMAL_THROTTLE");
        filter.addAction("com.xmrigforandroid.THERMAL_RESTORE");
        filter.addAction("com.xmrigforandroid.THERMAL_EMERGENCY");
        context.registerReceiver(thermalReceiver, filter);
    }
    
    public void setMiningActive(boolean active) {
        this.isMiningActive = active;
        if (active && originalThreadCount == -1) {
            // Store original thread count when mining starts
            originalThreadCount = getCurrentThreadCount();
            currentThreadCount = originalThreadCount;
            Log.i(LOG_TAG, "Stored original thread count: " + originalThreadCount);
        }
    }
    
    private int getCurrentThreadCount() {
        // This would typically read from mining configuration
        // For now, return a default based on CPU cores
        return Math.max(1, Runtime.getRuntime().availableProcessors() - 1);
    }
    
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onTemperatureUpdate(TemperatureUpdateEvent event) {
        // Log temperature updates for monitoring
        Log.d(LOG_TAG, String.format("Temperature: %.1f°C (CPU: %.1f°C, Battery: %.1f°C) - State: %s", 
            event.overallTemperature, event.cpuTemperature, event.batteryTemperature, event.thermalState));
    }
    
    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onThermalStateChanged(ThermalStateChangedEvent event) {
        Log.i(LOG_TAG, String.format("Thermal state changed: %s -> %s at %.1f°C", 
            event.oldState, event.newState, event.temperature));
        
        if (!isMiningActive) {
            Log.d(LOG_TAG, "Mining not active, ignoring thermal state change");
            return;
        }
        
        handleThermalStateChange(event.newState, event.temperature);
    }
    
    private void handleThermalStateChange(ThermalManager.ThermalState newState, float temperature) {
        switch (newState) {
            case NORMAL:
                if (thermalPaused) {
                    resumeMining();
                } else {
                    restorePerformance(PERFORMANCE_NORMAL);
                }
                break;
                
            case WARM:
                // No action needed yet, just monitoring
                break;
                
            case HOT:
                adjustPerformance(PERFORMANCE_HOT, "HOT");
                break;
                
            case CRITICAL:
                adjustPerformance(PERFORMANCE_CRITICAL, "CRITICAL");
                break;
                
            case EMERGENCY:
                emergencyPause(temperature);
                break;
        }
    }
    
    private void adjustPerformance(float performanceFactor, String reason) {
        if (originalThreadCount <= 0) return;
        
        int targetThreads = Math.max(1, (int)(originalThreadCount * performanceFactor));
        
        if (targetThreads != currentThreadCount) {
            Log.w(LOG_TAG, String.format("%s thermal throttling: %d -> %d threads (%.0f%% performance)", 
                reason, currentThreadCount, targetThreads, performanceFactor * 100));
            
            applyThreadCountChange(targetThreads);
            currentThreadCount = targetThreads;
        }
    }
    
    private void restorePerformance(float performanceFactor) {
        if (originalThreadCount <= 0) return;
        
        int targetThreads = (int)(originalThreadCount * performanceFactor);
        
        if (targetThreads != currentThreadCount) {
            Log.i(LOG_TAG, String.format("Restoring performance: %d -> %d threads", 
                currentThreadCount, targetThreads));
            
            applyThreadCountChange(targetThreads);
            currentThreadCount = targetThreads;
        }
    }
    
    private void emergencyPause(float temperature) {
        Log.e(LOG_TAG, String.format("EMERGENCY: Pausing mining due to dangerous temperature: %.1f°C", temperature));
        
        thermalPaused = true;
        Intent pauseIntent = new Intent("com.xmrigforandroid.MINING_PAUSE");
        pauseIntent.putExtra("reason", "thermal_emergency");
        pauseIntent.putExtra("temperature", temperature);
        context.sendBroadcast(pauseIntent);
        
        // Show notification to user
        showTemperatureWarning(temperature);
    }
    
    private void resumeMining() {
        if (thermalPaused) {
            Log.i(LOG_TAG, "Temperature normalized - resuming mining");
            
            thermalPaused = false;
            Intent resumeIntent = new Intent("com.xmrigforandroid.MINING_RESUME");
            resumeIntent.putExtra("reason", "thermal_recovery");
            context.sendBroadcast(resumeIntent);
            
            // Restore original performance
            restorePerformance(PERFORMANCE_NORMAL);
        }
    }
    
    private void applyThreadCountChange(int newThreadCount) {
        // Send intent to mining service to change thread count
        Intent intent = new Intent("com.xmrigforandroid.SET_THREAD_COUNT");
        intent.putExtra("thread_count", newThreadCount);
        intent.putExtra("reason", "thermal_management");
        context.sendBroadcast(intent);
    }
    
    private void showTemperatureWarning(float temperature) {
        Intent intent = new Intent("com.xmrigforandroid.SHOW_TEMPERATURE_WARNING");
        intent.putExtra("temperature", temperature);
        intent.putExtra("message", String.format("Device temperature too high: %.1f°C\nMining paused for safety", temperature));
        context.sendBroadcast(intent);
    }
    
    public void cleanup() {
        if (EventBus.getDefault().isRegistered(this)) {
            EventBus.getDefault().unregister(this);
        }
        
        if (thermalReceiver != null) {
            context.unregisterReceiver(thermalReceiver);
        }
        
        Log.i(LOG_TAG, "ThermalMiningController cleaned up");
    }
    
    /**
     * Broadcast receiver for thermal management intents
     */
    private class ThermalBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (action == null) return;
            
            switch (action) {
                case "com.xmrigforandroid.THERMAL_THROTTLE":
                    float performanceFactor = intent.getFloatExtra("performance_factor", 1.0f);
                    String thermalState = intent.getStringExtra("thermal_state");
                    Log.i(LOG_TAG, String.format("Received thermal throttle: %.0f%% performance (%s)", 
                        performanceFactor * 100, thermalState));
                    adjustPerformanceDirectly(performanceFactor, thermalState);
                    break;
                    
                case "com.xmrigforandroid.THERMAL_RESTORE":
                    Log.i(LOG_TAG, "Received thermal restore command");
                    restorePerformance(PERFORMANCE_NORMAL);
                    break;
                    
                case "com.xmrigforandroid.THERMAL_EMERGENCY":
                    float temp = intent.getFloatExtra("temperature", 0.0f);
                    Log.e(LOG_TAG, "Received thermal emergency at " + temp + "°C");
                    emergencyPause(temp);
                    break;
            }
        }
        
        private void adjustPerformanceDirectly(float performanceFactor, String reason) {
            if (originalThreadCount <= 0) return;
            
            int targetThreads = Math.max(1, (int)(originalThreadCount * performanceFactor));
            
            Log.w(LOG_TAG, String.format("Direct performance adjustment (%s): %d -> %d threads", 
                reason, currentThreadCount, targetThreads));
            
            applyThreadCountChange(targetThreads);
            currentThreadCount = targetThreads;
        }
    }
}