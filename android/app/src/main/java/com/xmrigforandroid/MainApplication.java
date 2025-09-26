package com.xmrigforandroid;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

// import com.facebook.react.bridge.JSIModulePackage;  // Disabled - missing in React Native 0.76+
// import com.swmansion.reanimated.ReanimatedJSIModulePackage;  // Disabled - dependency not available

import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return com.tradinganarchy.compute.BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // packages.add(new XMRigForAndroidPackage()); // Temporarily disabled
          //packages.add(new RNCWebViewPackage());
          //  packages.add(new SplashScreenReactPackage());
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());

          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

      // @Override
      // protected JSIModulePackage getJSIModulePackage() {
      //     return new ReanimatedJSIModulePackage();
      // }  // Disabled - JSIModulePackage not available in React Native 0.76+
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}

