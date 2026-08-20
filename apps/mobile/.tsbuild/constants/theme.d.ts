/**
 * Hook App - Premium Design System
 * Consolidated theme with consistent spacing, colors, typography, and components
 */
import { TextStyle, ViewStyle } from 'react-native';
import { COLORS, DARK_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS, GLASS, ANIMATION, ICON_SIZES, CARD_STYLES, INPUT_STYLES, BADGE_STYLES, AVATAR_SIZES, FAB } from './branding';
export { COLORS, DARK_COLORS, TYPOGRAPHY, SPACING, RADIUS, SHADOWS, GRADIENTS, GLASS, ANIMATION, ICON_SIZES, CARD_STYLES as PREMIUM_CARD_STYLES, INPUT_STYLES as PREMIUM_INPUT_STYLES, BADGE_STYLES as PREMIUM_BADGE_STYLES, AVATAR_SIZES as PREMIUM_AVATAR_SIZES, FAB as FAB_CONFIG, };
/**
 * Premium Card Style - Used across all screens
 */
export declare const CARD_STYLE: ViewStyle;
/**
 * Premium Card Elevated Style
 */
export declare const CARD_ELEVATED: ViewStyle;
/**
 * Screen Container Style
 */
export declare const SCREEN_CONTAINER: ViewStyle;
/**
 * Content Container with Padding
 */
export declare const CONTENT_CONTAINER: ViewStyle;
/**
 * Premium Header Style
 */
export declare const HEADER_STYLE: ViewStyle;
/**
 * Premium Button Styles - Primary, Secondary, Accent, Outline, Ghost, Glass
 */
export declare const BUTTON_STYLES: {
    primary: {
        container: {
            shadowColor: "#0A2540";
            shadowOffset: {
                readonly width: 0;
                readonly height: 2;
            };
            shadowOpacity: 0.06;
            shadowRadius: 4;
            elevation: 2;
            backgroundColor: "#0A2540";
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#FFFFFF";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    accent: {
        container: {
            shadowColor: "#F5A623";
            shadowOffset: {
                readonly width: 0;
                readonly height: 0;
            };
            shadowOpacity: 0.3;
            shadowRadius: 12;
            elevation: 8;
            backgroundColor: "#F5A623";
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#0A2540";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    secondary: {
        container: {
            shadowColor: "#0A2540";
            shadowOffset: {
                readonly width: 0;
                readonly height: 2;
            };
            shadowOpacity: 0.06;
            shadowRadius: 4;
            elevation: 2;
            backgroundColor: "#0EA5A5";
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#FFFFFF";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    outline: {
        container: {
            backgroundColor: string;
            borderWidth: number;
            borderColor: "#0A2540";
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#0A2540";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    outlineAccent: {
        container: {
            backgroundColor: string;
            borderWidth: number;
            borderColor: "#F5A623";
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#F5A623";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    ghost: {
        container: {
            backgroundColor: string;
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#0A2540";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    glass: {
        container: {
            backgroundColor: string;
            borderWidth: number;
            borderColor: string;
            borderRadius: 12;
            paddingVertical: 12;
            paddingHorizontal: 24;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            color: "#FFFFFF";
            fontSize: 15;
            fontWeight: "600";
            lineHeight: 20;
            letterSpacing: 0.25;
        };
    };
    small: {
        container: {
            backgroundColor: "#0A2540";
            borderRadius: 8;
            paddingVertical: 8;
            paddingHorizontal: 16;
            alignItems: "center";
            justifyContent: "center";
            minHeight: number;
        };
        text: {
            fontSize: 13;
            fontWeight: "600";
            color: "#FFFFFF";
        };
    };
};
/**
 * Premium Input Field Style
 * Note: fontSize and color should be applied separately as TextStyle on TextInput
 */
export declare const INPUT_STYLE: ViewStyle;
/**
 * Input Text Style (for TextInput styling)
 */
export declare const INPUT_TEXT_STYLE: TextStyle;
/**
 * Input Label Style
 */
export declare const LABEL_STYLE: TextStyle;
/**
 * Section Header Style
 */
export declare const SECTION_HEADER: TextStyle;
/**
 * Premium Divider Style
 */
export declare const DIVIDER: ViewStyle;
/**
 * Avatar Styles
 */
export declare const AVATAR_STYLES: {
    xs: {
        width: number;
        height: number;
        borderRadius: number;
    };
    small: {
        width: number;
        height: number;
        borderRadius: number;
    };
    medium: {
        width: number;
        height: number;
        borderRadius: number;
    };
    large: {
        width: number;
        height: number;
        borderRadius: number;
    };
    xlarge: {
        width: number;
        height: number;
        borderRadius: number;
    };
    xxlarge: {
        width: number;
        height: number;
        borderRadius: number;
    };
};
/**
 * Premium Badge/Chip Style
 */
export declare const BADGE_STYLE: ViewStyle;
/**
 * Premium Tab Bar Style
 */
export declare const TAB_BAR_STYLE: ViewStyle;
/**
 * Modal Backdrop Style
 */
export declare const MODAL_BACKDROP: ViewStyle;
/**
 * Premium Modal Container Style
 */
export declare const MODAL_CONTAINER: ViewStyle;
/**
 * Premium Bottom Sheet Style
 */
export declare const BOTTOM_SHEET: ViewStyle;
/**
 * Empty State Style
 */
export declare const EMPTY_STATE: ViewStyle;
/**
 * Loading Container Style
 */
export declare const LOADING_CONTAINER: ViewStyle;
/**
 * Premium List Item Style
 */
export declare const LIST_ITEM: ViewStyle;
/**
 * Premium Stat Card
 */
export declare const STAT_CARD: ViewStyle;
/**
 * Helper function to create consistent margins
 */
export declare const margins: {
    top: (size: keyof typeof SPACING) => {
        marginTop: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    bottom: (size: keyof typeof SPACING) => {
        marginBottom: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    left: (size: keyof typeof SPACING) => {
        marginLeft: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    right: (size: keyof typeof SPACING) => {
        marginRight: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    horizontal: (size: keyof typeof SPACING) => {
        marginLeft: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
        marginRight: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    vertical: (size: keyof typeof SPACING) => {
        marginTop: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
        marginBottom: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    all: (size: keyof typeof SPACING) => {
        margin: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
};
/**
 * Helper function to create consistent padding
 */
export declare const paddings: {
    top: (size: keyof typeof SPACING) => {
        paddingTop: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    bottom: (size: keyof typeof SPACING) => {
        paddingBottom: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    left: (size: keyof typeof SPACING) => {
        paddingLeft: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    right: (size: keyof typeof SPACING) => {
        paddingRight: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    horizontal: (size: keyof typeof SPACING) => {
        paddingLeft: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
        paddingRight: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    vertical: (size: keyof typeof SPACING) => {
        paddingTop: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
        paddingBottom: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
    all: (size: keyof typeof SPACING) => {
        padding: 2 | 16 | 20 | 24 | 48 | 12 | 32 | 4 | 8 | 40 | 64 | 80;
    };
};
/**
 * Floating Action Button (FAB) Constants
 * Premium positioned above bottom navigation
 */
export declare const FAB_CONSTANTS: {
    BOTTOM_POSITION: number;
    SIZE: number;
    ICON_SIZE: number;
};
/**
 * Premium FAB Style - Floating Action Button
 */
export declare const FAB_STYLE: ViewStyle;
/**
 * Premium Header Gradient Config
 */
export declare const HEADER_GRADIENT: {
    colors: readonly ["#0A2540", "#1A3A5C"];
    start: {
        readonly x: 0;
        readonly y: 0;
    };
    end: {
        readonly x: 1;
        readonly y: 1;
    };
};
/**
 * Premium Accent Gradient Config
 */
export declare const ACCENT_GRADIENT: {
    colors: readonly ["#F5A623", "#FFD93D"];
    start: {
        readonly x: 0;
        readonly y: 0;
    };
    end: {
        readonly x: 1;
        readonly y: 1;
    };
};
export { FAB_CONSTANTS as FAB };
//# sourceMappingURL=theme.d.ts.map