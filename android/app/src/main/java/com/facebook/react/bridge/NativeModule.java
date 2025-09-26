package com.facebook.react.bridge;

public interface NativeModule {
    String getName();
    void initialize();
    boolean canOverrideExistingModule();
}