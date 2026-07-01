package com.yunosdkexample

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.defaults.DefaultReactHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.yunosdkreactnative.YunoSdkModule

/**
 * Main Application class for the Yuno SDK Example app.
 * 
 * Configured for React Native 0.82+ with New Architecture (Bridgeless mode).
 * TurboModule interop is enabled to support legacy native modules.
 */
class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> = PackageList(this).packages

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        // React Native 0.82+ requires New Architecture
        override val isNewArchEnabled: Boolean = true
        override val isHermesEnabled: Boolean = true
    }

    /**
     * ReactHost for bridgeless mode (New Architecture).
     * This is required for React Native 0.82+ where bridgeless is mandatory.
     */
    override val reactHost: ReactHost
        get() = DefaultReactHost.getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        
        // Initialize SoLoader with merged SO mapping for New Architecture
        // This is required for RN 0.82+ to properly load native libraries
        SoLoader.init(this, OpenSourceMergedSoMapping)
        
        // Load New Architecture entry point
        // This configures TurboModules, Fabric, and bridgeless mode
        load()

        // Initialize the Yuno SDK here (documented Android pattern) so the SDK's
        // environment is set BEFORE YunoActivity.onCreate calls registerYunoCallbacks.
        // The publishable key is app config; the runtime preflight call still creates
        // a fresh checkoutSession on every purchase.
        YunoSdkModule.initialize(
            applicationContext,
            getString(R.string.yuno_public_api_key),
            getString(R.string.yuno_language),
            false,
        )
    }
}
