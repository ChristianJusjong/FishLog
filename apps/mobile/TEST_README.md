# FishLog Mobile App - Testing Documentation

## Overview

This document describes the testing setup for the Hook (FishLog) mobile Expo app.

## Test Infrastructure

### Dependencies
- **jest**: Testing framework
- **jest-expo**: Expo-specific Jest preset
- **@testing-library/react-native**: React Native testing utilities
- **react-test-renderer**: React component rendering for tests
- **@types/jest**: TypeScript definitions for Jest

### Configuration Files

#### `jest.config.js`
Main Jest configuration with:
- `jest-expo` preset for Expo support
- Transform ignore patterns for node_modules
- Module name mapping for @ alias
- Coverage collection settings

#### `jest.setup.js`
Test environment setup including:
- AsyncStorage mock
- expo-router mock
- expo-splash-screen mock
- expo-font mock
- expo-notifications mock
- react-native-svg mock
- Console warning suppression

#### `jest.polyfills.js`
Polyfills for Expo SDK 54 compatibility:
- structuredClone polyfill
- __ExpoImportMetaRegistry mock
- Expo winter runtime compatibility

## Running Tests

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Tests are organized in `__tests__` directories co-located with the code they test:

```
apps/mobile/
├── app/
│   └── __tests__/
│       └── index.test.tsx
└── components/
    └── __tests__/
        ├── Logo.test.tsx
        └── XPProgressBar.test.tsx
```

## Example Tests

### Component Tests

#### Logo Component (`components/__tests__/Logo.test.tsx`)
Tests for the Logo component covering:
- ✅ Default rendering with text
- ✅ Custom size prop
- ✅ showText prop (hiding text)
- ✅ Different variants (light, dark, color)
- ✅ LogoIcon component (Logo without text)

**Total: 9 tests**

#### XPProgressBar Component (`components/__tests__/XPProgressBar.test.tsx`)
Tests for the XP progress bar component covering:
- ✅ Basic rendering with props
- ✅ XP progress display
- ✅ Percentage calculation
- ✅ Next level information
- ✅ Compact mode
- ✅ Large number formatting (Danish locale)
- ✅ Different rank colors
- ✅ Edge cases (0 XP, 100% XP)

**Total: 9 tests**

### Screen Tests

#### Index Screen (`app/__tests__/index.test.tsx`)
Tests for the main index/splash screen covering:
- ✅ Loading state rendering
- ✅ Navigation to feed when logged in
- ✅ Navigation to login when not logged in
- ✅ No navigation during loading

**Total: 4 tests**

## Test Results

```
Test Suites: 3 passed, 3 total
Tests:       22 passed, 22 total
Snapshots:   0 total
```

### Coverage (Components Tested)
- **Logo.tsx**: 100% coverage
- **XPProgressBar.tsx**: 100% coverage
- **index.tsx**: 100% coverage

## Writing New Tests

### Basic Test Template

```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import YourComponent from '../YourComponent';

// Mock contexts if needed
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: { /* mock colors */ },
  }),
}));

describe('YourComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<YourComponent />);
    expect(getByText('Expected Text')).toBeTruthy();
  });
});
```

### Common Mocks

#### Theme Context
```typescript
jest.mock('@/contexts/ThemeContext', () => ({
  useDynamicStyles: (createStyles: any) =>
    createStyles({
      surface: '#FFFFFF',
      text: '#000000',
      // ... other theme values
    }),
}));
```

#### Auth Context
```typescript
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '123', name: 'Test User' },
    loading: false,
  }),
}));
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Check that all dependencies are installed and mocks are properly configured in `jest.setup.js`

2. **Expo winter runtime errors**: These are handled by the polyfills in `jest.polyfills.js`. If you encounter new ones, add appropriate mocks.

3. **Number formatting**: The app uses Danish locale (periods instead of commas for thousands separator). Tests should expect `1.000` not `1,000`.

4. **Using `container`**: The newer version of @testing-library/react-native renamed `container` to `root`. Use `root` in your tests.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the user sees and interacts with
2. **Use Testing Library queries**: Prefer `getByText`, `getByRole`, etc. over manual traversal
3. **Mock external dependencies**: Always mock network calls, storage, and navigation
4. **Keep tests simple**: One concept per test
5. **Use descriptive test names**: Clearly describe what is being tested

## Future Improvements

Potential areas for expansion:
- Integration tests for complex user flows
- Snapshot tests for UI consistency
- API integration tests with MSW (Mock Service Worker)
- E2E tests with Detox or Maestro
- Visual regression tests
- Performance tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Expo Testing Guide](https://docs.expo.dev/develop/unit-testing/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
