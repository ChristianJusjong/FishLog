import React from 'react';
import { render } from '@testing-library/react-native';
import { Logo, LogoIcon } from '../Logo';

describe('Logo Component', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<Logo />);
    expect(getByText('HOOK')).toBeTruthy();
  });

  it('renders with custom size', () => {
    const { root } = render(<Logo size={64} />);
    expect(root).toBeTruthy();
  });

  it('renders without text when showText is false', () => {
    const { queryByText } = render(<Logo showText={false} />);
    expect(queryByText('HOOK')).toBeNull();
  });

  it('renders with light variant', () => {
    const { getByText } = render(<Logo variant="light" />);
    expect(getByText('HOOK')).toBeTruthy();
  });

  it('renders with dark variant', () => {
    const { getByText } = render(<Logo variant="dark" />);
    expect(getByText('HOOK')).toBeTruthy();
  });

  it('renders with color variant (default)', () => {
    const { getByText } = render(<Logo variant="color" />);
    expect(getByText('HOOK')).toBeTruthy();
  });

  it('renders with horizontal layout', () => {
    const { getByText } = render(<Logo layout="horizontal" />);
    expect(getByText('HOOK')).toBeTruthy();
  });

  describe('LogoIcon Component', () => {
    it('renders without text', () => {
      const { queryByText } = render(<LogoIcon />);
      expect(queryByText('HOOK')).toBeNull();
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

