/**
 * Jest setup — runs after each test file is loaded.
 *
 * Mocks platform-only APIs so unit tests can import store / util code
 * without booting the full RN runtime.
 */

import '@testing-library/jest-native/extend-expect';

// AsyncStorage — most stores hit this on boot
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-router — screens may import navigation helpers
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: jest.fn(),
  Stack: ({ children }: { children: React.ReactNode }) => children,
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

// expo-font — components reference loaded fonts but don't need real ones in unit tests
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn().mockResolvedValue(undefined),
}));

// Silence noisy reanimated warnings during tests
// eslint-disable-next-line @typescript-eslint/no-require-imports
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
