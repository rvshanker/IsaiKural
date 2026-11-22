import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.isaikural.app',
  appName: 'இசையில் திருக்குறள்',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#1D4234',
    limitsNavigationsToAppBoundDomains: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: '#1D4234',
      showSpinner: false,
    },
    LocalNotifications: {
      iconColor: '#1D4234',
    },
  },
};

export default config;
