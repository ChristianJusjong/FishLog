import { AccessibilityProps } from 'react-native';

// Helper to create accessibility props
export function a11y(
  label: string,
  hint?: string,
  role?: AccessibilityProps['accessibilityRole']
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
    accessibilityRole: role,
  };
}

// Common button accessibility
export function buttonA11y(label: string, hint?: string): AccessibilityProps {
  return a11y(label, hint, 'button');
}

// Link accessibility
export function linkA11y(label: string, hint?: string): AccessibilityProps {
  return a11y(label, hint, 'link');
}

// Image accessibility
export function imageA11y(description: string): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: description,
    accessibilityRole: 'image',
  };
}

// Header accessibility
export function headerA11y(title: string): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: title,
    accessibilityRole: 'header',
  };
}

// Text input accessibility
export function inputA11y(label: string, hint?: string): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}

// Tab accessibility
export function tabA11y(
  label: string, 
  isSelected: boolean,
  position: number,
  total: number
): AccessibilityProps {
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'tab',
    accessibilityState: { selected: isSelected },
    accessibilityHint: 'Fane ' + position + ' af ' + total,
  };
}

// List item accessibility
export function listItemA11y(
  label: string,
  position?: number,
  total?: number
): AccessibilityProps {
  const hint = position && total ? 'Element ' + position + ' af ' + total : undefined;
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
  };
}

// Catch card accessibility helper
export function catchCardA11y(
  species: string,
  weight?: number,
  length?: number,
  location?: string
): AccessibilityProps {
  let label = species || 'Ukendt fisk';
  if (weight) label += ', ' + weight + ' kg';
  if (length) label += ', ' + length + ' cm';
  if (location) label += ', fanget ved ' + location;
  
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'button',
    accessibilityHint: 'Tryk for at se detaljer',
  };
}

// Loading state accessibility
export function loadingA11y(context?: string): AccessibilityProps {
  const label = context ? 'Indlaeser ' + context : 'Indlaeser';
  return {
    accessible: true,
    accessibilityLabel: label,
    accessibilityRole: 'progressbar',
    accessibilityState: { busy: true },
  };
}
