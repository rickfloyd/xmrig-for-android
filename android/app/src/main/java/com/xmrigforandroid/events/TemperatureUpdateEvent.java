package com.xmrigforandroid.events;

import com.xmrigforandroid.thermal.ThermalManager.ThermalState;

/**
 * Event fired with regular temperature updates
 */
public class TemperatureUpdateEvent {
    public final float overallTemperature;
    public final float batteryTemperature;
    public final float cpuTemperature;
    public final ThermalState thermalState;
    public final long timestamp;
    
    public TemperatureUpdateEvent(float overall, float battery, float cpu, ThermalState state) {
        this.overallTemperature = overall;
        this.batteryTemperature = battery;
        this.cpuTemperature = cpu;
        this.thermalState = state;
        this.timestamp = System.currentTimeMillis();
    }
}