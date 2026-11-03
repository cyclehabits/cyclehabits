import OneSignal from 'react-onesignal';

let initialized = false;

export async function initOneSignal(firebaseUid: string): Promise<void> {
  if (initialized) {
    return;
  }
  initialized = true;

  await OneSignal.init({
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID as string,
    serviceWorkerPath: '/OneSignalSDKWorker.js',
  });

  await OneSignal.login(firebaseUid);
}

export async function requestPushPermission(): Promise<boolean> {
  return OneSignal.Notifications.requestPermission();
}