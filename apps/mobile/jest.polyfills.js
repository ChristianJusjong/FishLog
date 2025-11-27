// Polyfill structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock the Expo winter runtime to prevent import errors
global.__ExpoImportMetaRegistry = {
  get: () => undefined,
  set: () => {},
  delete: () => {},
  clear: () => {},
  has: () => false,
};

// Set environment variables
process.env.EXPO_USE_WINTER = 'false';
