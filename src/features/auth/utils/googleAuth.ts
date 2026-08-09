import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { Env } from '@constants/env';

let configured = false;

function ensureConfigured() {
  if (configured) return;
  // `webClientId` is required even on Android/iOS — it's the audience the
  // idToken is issued for, which is what cinema-hall-api's
  // verifyGoogleToken() checks server-side. iosClientId is optional and
  // only used to also request an iOS-specific token.
  GoogleSignin.configure({
    webClientId: Env.GOOGLE_WEB_CLIENT_ID,
    iosClientId: Env.GOOGLE_IOS_CLIENT_ID || undefined,
    offlineAccess: false,
  });
  configured = true;
}

export interface GoogleSignInResult {
  cancelled: boolean;
  idToken?: string;
  error?: string;
}

/** Runs the native Google account picker and returns the ID token to send to /api/customer/google-login. */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  ensureConfigured();
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return { cancelled: true };
    }
    if (!response.data.idToken) {
      return { cancelled: false, error: 'Google did not return an ID token. Please try again.' };
    }
    return { cancelled: false, idToken: response.data.idToken };
  } catch (err) {
    if (isErrorWithCode(err)) {
      if (err.code === statusCodes.SIGN_IN_CANCELLED) return { cancelled: true };
      if (err.code === statusCodes.IN_PROGRESS) {
        return { cancelled: false, error: 'A sign-in is already in progress.' };
      }
      if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return { cancelled: false, error: 'Google Play Services is not available on this device.' };
      }
    }
    return { cancelled: false, error: 'Google sign-in failed. Please try again.' };
  }
}
