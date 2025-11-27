import React from 'react';
import { render } from '@testing-library/react-native';
import XPProgressBar from '../XPProgressBar';

// Mock the ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  useDynamicStyles: (createStyles: any) =>
    createStyles({
      surface: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      border: '#E0E0E0',
      primary: '#F97316',
    }),
}));

const mockRank = {
  title: 'Beginner',
  icon: '🎣',
  color: '#3B82F6',
};

describe('XPProgressBar Component', () => {
  it('renders correctly with basic props', () => {
    const { getByText } = render(
      <XPProgressBar
        level={5}
        currentLevelXP={300}
        xpForNextLevel={500}
        rank={mockRank}
      />
    );

    expect(getByText('5')).toBeTruthy();
    expect(getByText('🎣')).toBeTruthy();
    expect(getByText('Beginner')).toBeTruthy();
  });

  it('displays correct XP progress', () => {
    const { getByText } = render(
      <XPProgressBar
        level={10}
        currentLevelXP={750}
        xpForNextLevel={1000}
        rank={mockRank}
      />
    );

    // Numbers are formatted with Danish locale (periods instead of commas)
    expect(getByText('750 / 1.000 XP')).toBeTruthy();
  });

  it('calculates and displays percentage correctly', () => {
    const { getByText } = render(
      <XPProgressBar
        level={3}
        currentLevelXP={250}
        xpForNextLevel={500}
        rank={mockRank}
      />
    );

    // 250/500 = 50%
    expect(getByText('50%')).toBeTruthy();
  });

  it('displays next level information', () => {
    const { getByText } = render(
      <XPProgressBar
        level={7}
        currentLevelXP={400}
        xpForNextLevel={600}
        rank={mockRank}
      />
    );

    expect(getByText('Næste: Level 8')).toBeTruthy();
  });

  describe('Compact Mode', () => {
    it('renders in compact mode', () => {
      const { getByText, queryByText } = render(
        <XPProgressBar
          level={5}
          currentLevelXP={300}
          xpForNextLevel={500}
          rank={mockRank}
          compact={true}
        />
      );

      expect(getByText('5')).toBeTruthy();
      expect(getByText('🎣 Beginner')).toBeTruthy();
      expect(getByText('300 / 500 XP')).toBeTruthy();

      // Should not show "Næste: Level X" in compact mode
      expect(queryByText(/Næste: Level/)).toBeNull();
    });
  });

  it('handles large XP numbers with formatting', () => {
    const { getByText } = render(
      <XPProgressBar
        level={50}
        currentLevelXP={15000}
        xpForNextLevel={20000}
        rank={{
          title: 'Expert',
          icon: '🏆',
          color: '#FBBF24',
        }}
      />
    );

    // Numbers are formatted with Danish locale (periods instead of commas)
    expect(getByText('15.000 / 20.000 XP')).toBeTruthy();
  });

  it('renders with different rank colors', () => {
    const expertRank = {
      title: 'Expert',
      icon: '🏆',
      color: '#FBBF24',
    };

    const { getByText } = render(
      <XPProgressBar
        level={25}
        currentLevelXP={5000}
        xpForNextLevel={7500}
        rank={expertRank}
      />
    );

    expect(getByText('Expert')).toBeTruthy();
    expect(getByText('🏆')).toBeTruthy();
  });

  it('handles edge case: 0 XP', () => {
    const { getByText } = render(
      <XPProgressBar
        level={1}
        currentLevelXP={0}
        xpForNextLevel={100}
        rank={mockRank}
      />
    );

    expect(getByText('0 / 100 XP')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
  });

  it('handles edge case: full XP (100%)', () => {
    const { getByText } = render(
      <XPProgressBar
        level={5}
        currentLevelXP={500}
        xpForNextLevel={500}
        rank={mockRank}
      />
    );

    expect(getByText('500 / 500 XP')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy();
  });
});
