// react-native-config reads its values from a native module at import time
// (`NativeModules.RNCConfig`), which doesn't exist under Jest. Tests that
// touch @constants/env (directly or transitively, e.g. via httpClient)
// need this manual mock so the import doesn't throw.
module.exports = {
  API_BASE_URL: 'http://localhost:5000',
  GOOGLE_WEB_CLIENT_ID: '',
  GOOGLE_IOS_CLIENT_ID: '',
  ENABLE_CLEARTEXT: 'true',
  USE_MOCKS: 'false',
};
