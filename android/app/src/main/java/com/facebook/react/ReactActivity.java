package com.facebook.react;

import android.app.Activity;
import android.os.Bundle;

public class ReactActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
    
    protected String getMainComponentName() {
        return "";
    }
}