import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import Index from '../index';
import { useRouter } from 'expo-router';

// Mock the AuthContext
const mockUseAuth = jest.fn();
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock the ThemeContext
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#FFFFFF',
      primary: '#F97316',
      primaryLight: '#FED7AA',
      textSecondary: '#6B7280',
    },
  }),
}));

describe('Index Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading screen', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    const { getByText } = render(<Index />);

    expect(getByText('Hook')).toBeTruthy();
    expect(getByText('Indlæser...')).toBeTruthy();
  });

  it('navigates to feed when user is logged in', async () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    mockUseAuth.mockReturnValue({
      user: { id: '123', name: 'Test User' },
      loading: false,
    });

    render(<Index />);

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/feed');
      },
      { timeout: 1000 }
    );
  });

  it('navigates to login when user is not logged in', async () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    });

    render(<Index />);

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      },
      { timeout: 1000 }
    );
  });

  it('does not navigate while loading', () => {
    const mockReplace = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    });

    render(<Index />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
