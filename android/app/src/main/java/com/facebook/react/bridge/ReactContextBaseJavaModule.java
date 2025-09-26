package com.facebook.react.bridge;

public abstract class ReactContextBaseJavaModule implements NativeModule {
    protected ReactApplicationContext mReactContext;
    
    public ReactContextBaseJavaModule(ReactApplicationContext reactContext) {
        mReactContext = reactContext;
    }
    
    @Override
    public String getName() {
        return getClass().getSimpleName();
    }
    
    @Override
    public void initialize() {}
    
    @Override
    public boolean canOverrideExistingModule() {
        return false;
    }
    
    protected ReactApplicationContext getReactApplicationContext() {
        return mReactContext;
    }
}