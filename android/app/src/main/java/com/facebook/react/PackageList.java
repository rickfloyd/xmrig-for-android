package com.facebook.react;

import java.util.ArrayList;
import java.util.List;

public class PackageList {
    // Application context stored for future use
    @SuppressWarnings("unused")
    private Object application;
    
    public PackageList(Object application) {
        this.application = application;
    }
    
    public List<ReactPackage> getPackages() {
        return new ArrayList<>();
    }
}