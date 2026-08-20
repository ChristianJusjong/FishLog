import { AccessibilityProps } from 'react-native';
export declare function a11y(label: string, hint?: string, role?: AccessibilityProps['accessibilityRole']): AccessibilityProps;
export declare function buttonA11y(label: string, hint?: string): AccessibilityProps;
export declare function linkA11y(label: string, hint?: string): AccessibilityProps;
export declare function imageA11y(description: string): AccessibilityProps;
export declare function headerA11y(title: string): AccessibilityProps;
export declare function inputA11y(label: string, hint?: string): AccessibilityProps;
export declare function tabA11y(label: string, isSelected: boolean, position: number, total: number): AccessibilityProps;
export declare function listItemA11y(label: string, position?: number, total?: number): AccessibilityProps;
export declare function catchCardA11y(species: string, weight?: number, length?: number, location?: string): AccessibilityProps;
export declare function loadingA11y(context?: string): AccessibilityProps;
//# sourceMappingURL=accessibility.d.ts.map