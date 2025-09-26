package com.facebook.react;

import android.app.Application;

public abstract class ReactNativeHost {
    protected Application mApplication;
    
    public ReactNativeHost(Application application) {
        mApplication = application;
    }
    
    protected abstract boolean getUseDeveloperSupport();
    
    protected abstract java.util.List<ReactPackage> getPackages();
    
    protected abstract String getJSMainModuleName();
}