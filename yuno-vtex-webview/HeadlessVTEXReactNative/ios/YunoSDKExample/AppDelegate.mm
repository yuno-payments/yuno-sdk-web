#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "YunoSDKExample-Swift.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Set up React Native module name and initial props
  self.moduleName = @"YunoSDKExample";
  self.initialProps = @{};

  // Boot straight into the React Native root view. RCTAppDelegate creates and
  // shows the window hosting `moduleName`. The Yuno SDK is initialized from JS
  // once preflight returns the public API key (see useVtexWalletCheckout).
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)navigateToReactNativeWithCountryCode:(NSString *)countryCode configJson:(NSString *)configJson
{
  // Create initial props with the configuration
  NSDictionary *initialProps = @{
    @"countryCode": countryCode ?: @"",
    @"configJson": configJson ?: @""
  };
  
  // Create React Native root view using RCTAppDelegate's rootViewFactory
  UIView *rootView = [self.rootViewFactory viewWithModuleName:self.moduleName
                                            initialProperties:initialProps
                                                launchOptions:nil];
  
  if (rootView == nil) {
    NSLog(@"Error: Could not create React Native root view");
    return;
  }
  
  rootView.backgroundColor = [UIColor whiteColor];
  
  // Create a UIViewController to host the React Native view
  UIViewController *reactViewController = [[UIViewController alloc] init];
  reactViewController.view = rootView;
  
  // Navigate to React Native
  UINavigationController *navController = (UINavigationController *)self.window.rootViewController;
  [navController pushViewController:reactViewController animated:YES];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
