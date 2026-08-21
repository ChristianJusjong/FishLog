import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const BIOMETRIC_ENABLED_KEY = '@hook_biometrics_enabled_v1';

export async function isBiometricSupported(): Promise<boolean> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export async function getBiometricTypeName(): Promise<string> {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'FaceID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'TouchID / Fingeraftryk';
    }
    return 'Biometri';
  } catch {
    return 'Biometri';
  }
}

export async function isBiometricsEnabledByUser(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricsEnabledByUser(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
}

export async function authenticateWithBiometrics(
  promptMessage = 'Lås Hook op med FaceID / Fingeraftryk'
): Promise<boolean> {
  try {
    const supported = await isBiometricSupported();
    if (!supported) return false;

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Annuller',
      disableDeviceFallback: false,
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
