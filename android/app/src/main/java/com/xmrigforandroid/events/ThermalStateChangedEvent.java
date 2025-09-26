package com.xmrigforandroid.events;

import com.xmrigforandroid.thermal.ThermalManager.ThermalState;

/**
 * Event fired when thermal state changes
 */
public class ThermalStateChangedEvent {
    public final ThermalState oldState;
    public final ThermalState newState;
    public final float temperature;
    public final long timestamp;
    
    public ThermalStateChangedEvent(ThermalState oldState, ThermalState newState, float temperature) {
        this.oldState = oldState;
        this.newState = newState;
        this.temperature = temperature;
        this.timestamp = System.currentTimeMillis();
    }
}