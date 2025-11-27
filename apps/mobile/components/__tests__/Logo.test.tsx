import React from 'react';
import { render } from '@testing-library/react-native';
import { Logo, LogoIcon } from '../Logo';

describe('Logo Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Logo />);
    expect(getByText('FishLog')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = render(<Logo size={64} />);
    expect(root).toBeTruthy();
  });

  it('renders without text when showText is false', () => {
    const { queryByText } = render(<Logo showText={false} />);
    expect(queryByText('FishLog')).toBeNull();
  });

  it('renders with light variant', () => {
    const { getByText } = render(<Logo variant="light" />);
    expect(getByText('FishLog')).toBeTruthy();
  });

  it('renders with dark variant', () => {
    const { getByText } = render(<Logo variant="dark" />);
    expect(getByText('FishLog')).toBeTruthy();
  });

  it('renders with color variant (default)', () => {
    const { getByText } = render(<Logo variant="color" />);
    expect(getByText('FishLog')).toBeTruthy();
  });

  describe('LogoIcon Component', () => {
    it('renders without text', () => {
      const { queryByText } = render(<LogoIcon />);
      expect(queryByText('FishLog')).toBeNull();
    });

    it('renders with custom size', () => {
      const { root } = render(<LogoIcon size={32} />);
      expect(root).toBeTruthy();
    });

    it('renders with different variants', () => {
      const lightVariant = render(<LogoIcon variant="light" />);
      expect(lightVariant.root).toBeTruthy();

      const darkVariant = render(<LogoIcon variant="dark" />);
      expect(darkVariant.root).toBeTruthy();
    });
  });
});
