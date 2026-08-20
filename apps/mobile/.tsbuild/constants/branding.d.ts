/**
 * Hook - Premium Fishing Tech Experience
 *
 * Design Philosophy: "Where Nature Meets Technology"
 * A sophisticated fusion of ocean depths, dawn horizons, and cutting-edge tech.
 *
 * Color Story:
 * - Deep Ocean (Primary): The mysterious depths where trophy fish await
 * - Golden Amber (Accent): The warm glow of sunrise on the water, the thrill of a catch
 * - Midnight Teal: The calm before the bite, technological precision
 * - Pearl White: Morning mist on the lake, clean interfaces
 */
export declare const BRANDING: {
    readonly appName: "Hook";
    readonly tagline: "Din digitale fiskebog";
    readonly description: "Log dine fangster, del oplevelser, og bliv en bedre fisker";
};
/**
 * Premium Color Palette - Ocean Tech Theme
 * Sophisticated colors that combine nature's beauty with modern technology
 */
export declare const COLORS: {
    readonly primary: "#0A2540";
    readonly primaryLight: "#1A3A5C";
    readonly primaryDark: "#051628";
    readonly primaryMuted: "#1E4976";
    readonly accent: "#F5A623";
    readonly accentLight: "#FFD93D";
    readonly accentDark: "#D4880F";
    readonly accentGlow: "rgba(245, 166, 35, 0.3)";
    readonly secondary: "#0EA5A5";
    readonly secondaryLight: "#14D9D9";
    readonly secondaryDark: "#0A7878";
    readonly secondaryMuted: "#0D9090";
    readonly background: "#F8FAFC";
    readonly backgroundLight: "#FFFFFF";
    readonly backgroundDark: "#0A2540";
    readonly backgroundElevated: "#FFFFFF";
    readonly surface: "#FFFFFF";
    readonly surfaceVariant: "#F1F5F9";
    readonly surfaceHover: "#E8EEF4";
    readonly surfaceActive: "#DDE5ED";
    readonly surfaceGlass: "rgba(255, 255, 255, 0.85)";
    readonly text: "#0A2540";
    readonly textPrimary: "#0A2540";
    readonly textSecondary: "#4A6382";
    readonly textTertiary: "#7A94B0";
    readonly textMuted: "#94A3B8";
    readonly textInverse: "#FFFFFF";
    readonly textAccent: "#F5A623";
    readonly iconDefault: "#7A94B0";
    readonly iconActive: "#F5A623";
    readonly iconPrimary: "#0A2540";
    readonly iconSecondary: "#0EA5A5";
    readonly white: "#FFFFFF";
    readonly black: "#000000";
    readonly gray50: "#F8FAFC";
    readonly gray100: "#F1F5F9";
    readonly gray200: "#E2E8F0";
    readonly gray300: "#CBD5E1";
    readonly gray400: "#94A3B8";
    readonly gray500: "#64748B";
    readonly gray600: "#475569";
    readonly gray700: "#334155";
    readonly gray800: "#1E293B";
    readonly gray900: "#0F172A";
    readonly ocean: "#0A2540";
    readonly oceanLight: "#1E4976";
    readonly wave: "#0EA5A5";
    readonly foam: "#E0F7FA";
    readonly sand: "#F5DEB3";
    readonly dawn: "#FF8A65";
    readonly dusk: "#7C4DFF";
    readonly kelp: "#2E7D32";
    readonly coral: "#FF7043";
    readonly forest: "#1B4332";
    readonly water: "#1E88E5";
    readonly success: "#10B981";
    readonly successLight: "#D1FAE5";
    readonly successDark: "#059669";
    readonly warning: "#F59E0B";
    readonly warningLight: "#FEF3C7";
    readonly warningDark: "#D97706";
    readonly error: "#EF4444";
    readonly errorLight: "#FEE2E2";
    readonly errorDark: "#DC2626";
    readonly info: "#0EA5A5";
    readonly infoLight: "#CCFBF1";
    readonly infoDark: "#0D9488";
    readonly border: "#E2E8F0";
    readonly borderLight: "#F1F5F9";
    readonly borderDark: "#CBD5E1";
    readonly borderFocus: "#0EA5A5";
    readonly borderAccent: "#F5A623";
    readonly overlay: string;
    readonly gradientPrimary: readonly ["#0A2540", "#1A3A5C"];
    readonly gradientAccent: readonly ["#F5A623", "#FFD93D"];
    readonly gradientOcean: readonly ["#0A2540", "#0EA5A5"];
    readonly gradientDawn: readonly ["#0A2540", "#FF8A65", "#FFD93D"];
    readonly gradientCard: readonly ["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"];
};
/**
 * Dark Mode - Immersive Night Fishing Theme
 * Deep, rich colors for low-light conditions
 */
export declare const DARK_COLORS: {
    readonly primary: "#1E4976";
    readonly primaryLight: "#2D6BA8";
    readonly primaryDark: "#0A2540";
    readonly primaryMuted: "#3D7AB8";
    readonly accent: "#FFD93D";
    readonly accentLight: "#FFE566";
    readonly accentDark: "#F5A623";
    readonly accentGlow: "rgba(255, 217, 61, 0.3)";
    readonly secondary: "#14D9D9";
    readonly secondaryLight: "#5EEAD4";
    readonly secondaryDark: "#0EA5A5";
    readonly secondaryMuted: "#2DD4BF";
    readonly background: "#030D18";
    readonly backgroundLight: "#071A2E";
    readonly backgroundDark: "#010509";
    readonly backgroundElevated: "#0A1F38";
    readonly surface: "#0A1F38";
    readonly surfaceVariant: "#0F2A48";
    readonly surfaceHover: "#143558";
    readonly surfaceActive: "#1A4068";
    readonly surfaceGlass: "rgba(10, 31, 56, 0.85)";
    readonly text: "#F1F5F9";
    readonly textPrimary: "#F1F5F9";
    readonly textSecondary: "#94A3B8";
    readonly textTertiary: "#64748B";
    readonly textMuted: "#475569";
    readonly textInverse: "#0A2540";
    readonly textAccent: "#FFD93D";
    readonly iconDefault: "#64748B";
    readonly iconActive: "#FFD93D";
    readonly iconPrimary: "#F1F5F9";
    readonly iconSecondary: "#14D9D9";
    readonly white: "#FFFFFF";
    readonly black: "#000000";
    readonly gray50: "#0F172A";
    readonly gray100: "#1E293B";
    readonly gray200: "#334155";
    readonly gray300: "#475569";
    readonly gray400: "#64748B";
    readonly gray500: "#94A3B8";
    readonly gray600: "#CBD5E1";
    readonly gray700: "#E2E8F0";
    readonly gray800: "#F1F5F9";
    readonly gray900: "#F8FAFC";
    readonly ocean: "#1E4976";
    readonly oceanLight: "#3D7AB8";
    readonly wave: "#14D9D9";
    readonly foam: "#134E4A";
    readonly sand: "#C4A77D";
    readonly dawn: "#FF9E80";
    readonly dusk: "#9575CD";
    readonly kelp: "#4CAF50";
    readonly coral: "#FF8A65";
    readonly forest: "#2D5A3D";
    readonly water: "#42A5F5";
    readonly success: "#34D399";
    readonly successLight: "#065F46";
    readonly successDark: "#10B981";
    readonly warning: "#FBBF24";
    readonly warningLight: "#78350F";
    readonly warningDark: "#F59E0B";
    readonly error: "#F87171";
    readonly errorLight: "#7F1D1D";
    readonly errorDark: "#EF4444";
    readonly info: "#22D3EE";
    readonly infoLight: "#164E63";
    readonly infoDark: "#06B6D4";
    readonly border: "#1E293B";
    readonly borderLight: "#0F172A";
    readonly borderDark: "#334155";
    readonly borderFocus: "#14D9D9";
    readonly borderAccent: "#FFD93D";
    readonly overlay: string;
    readonly gradientPrimary: readonly ["#030D18", "#0A2540"];
    readonly gradientAccent: readonly ["#F5A623", "#FFD93D"];
    readonly gradientOcean: readonly ["#030D18", "#0EA5A5"];
    readonly gradientDawn: readonly ["#030D18", "#FF8A65", "#FFD93D"];
    readonly gradientCard: readonly ["rgba(10,31,56,0.9)", "rgba(10,31,56,0.7)"];
};
/**
 * Premium Typography System
 * Refined hierarchy with elegant spacing
 */
export declare const TYPOGRAPHY: {
    readonly fontFamily: {
        readonly regular: "System";
        readonly medium: "System";
        readonly semibold: "System";
        readonly bold: "System";
    };
    readonly fontSize: {
        readonly xs: 11;
        readonly sm: 13;
        readonly base: 15;
        readonly md: 16;
        readonly lg: 18;
        readonly xl: 20;
        readonly '2xl': 24;
        readonly '3xl': 28;
        readonly '4xl': 34;
        readonly '5xl': 42;
        readonly '6xl': 52;
    };
    readonly fontWeight: {
        readonly light: "300";
        readonly regular: "400";
        readonly medium: "500";
        readonly semibold: "600";
        readonly bold: "700";
        readonly black: "800";
    };
    readonly letterSpacing: {
        readonly tighter: -0.5;
        readonly tight: -0.25;
        readonly normal: 0;
        readonly wide: 0.25;
        readonly wider: 0.5;
        readonly widest: 1;
        readonly caps: 1.5;
    };
    readonly lineHeight: {
        readonly none: 1;
        readonly tight: 1.2;
        readonly snug: 1.375;
        readonly normal: 1.5;
        readonly relaxed: 1.625;
        readonly loose: 2;
    };
    readonly styles: {
        readonly display: {
            readonly fontSize: 42;
            readonly fontWeight: "700";
            readonly lineHeight: 48;
            readonly letterSpacing: -0.5;
            readonly color: "#0A2540";
        };
        readonly h1: {
            readonly fontSize: 28;
            readonly fontWeight: "700";
            readonly lineHeight: 34;
            readonly letterSpacing: -0.25;
            readonly color: "#0A2540";
        };
        readonly h1Dark: {
            readonly fontSize: 28;
            readonly fontWeight: "700";
            readonly lineHeight: 34;
            readonly letterSpacing: -0.25;
            readonly color: "#F1F5F9";
        };
        readonly h2: {
            readonly fontSize: 22;
            readonly fontWeight: "600";
            readonly lineHeight: 28;
            readonly letterSpacing: -0.15;
            readonly color: "#0A2540";
        };
        readonly h2Dark: {
            readonly fontSize: 22;
            readonly fontWeight: "600";
            readonly lineHeight: 28;
            readonly letterSpacing: -0.15;
            readonly color: "#F1F5F9";
        };
        readonly h3: {
            readonly fontSize: 18;
            readonly fontWeight: "600";
            readonly lineHeight: 24;
            readonly color: "#0A2540";
        };
        readonly h3Dark: {
            readonly fontSize: 18;
            readonly fontWeight: "600";
            readonly lineHeight: 24;
            readonly color: "#F1F5F9";
        };
        readonly h4: {
            readonly fontSize: 16;
            readonly fontWeight: "600";
            readonly lineHeight: 22;
            readonly color: "#0A2540";
        };
        readonly body: {
            readonly fontSize: 15;
            readonly fontWeight: "400";
            readonly lineHeight: 22;
            readonly color: "#0A2540";
        };
        readonly bodyLarge: {
            readonly fontSize: 17;
            readonly fontWeight: "400";
            readonly lineHeight: 26;
            readonly color: "#0A2540";
        };
        readonly small: {
            readonly fontSize: 13;
            readonly fontWeight: "400";
            readonly lineHeight: 18;
            readonly color: "#4A6382";
        };
        readonly caption: {
            readonly fontSize: 11;
            readonly fontWeight: "500";
            readonly lineHeight: 14;
            readonly letterSpacing: 0.25;
            readonly color: "#7A94B0";
        };
        readonly tiny: {
            readonly fontSize: 10;
            readonly fontWeight: "600";
            readonly lineHeight: 12;
            readonly color: "#7A94B0";
        };
        readonly label: {
            readonly fontSize: 11;
            readonly fontWeight: "600";
            readonly lineHeight: 14;
            readonly letterSpacing: 1;
            readonly textTransform: "uppercase";
            readonly color: "#7A94B0";
        };
        readonly button: {
            readonly fontSize: 15;
            readonly fontWeight: "600";
            readonly lineHeight: 20;
            readonly letterSpacing: 0.25;
            readonly color: "#FFFFFF";
        };
        readonly buttonLarge: {
            readonly fontSize: 17;
            readonly fontWeight: "600";
            readonly lineHeight: 22;
            readonly letterSpacing: 0.25;
            readonly color: "#FFFFFF";
        };
        readonly tabLabel: {
            readonly fontSize: 10;
            readonly fontWeight: "600";
            readonly lineHeight: 12;
            readonly letterSpacing: 0.25;
            readonly color: "#7A94B0";
        };
        readonly tabLabelActive: {
            readonly fontSize: 10;
            readonly fontWeight: "700";
            readonly lineHeight: 12;
            readonly letterSpacing: 0.25;
            readonly color: "#F5A623";
        };
        readonly statValue: {
            readonly fontSize: 28;
            readonly fontWeight: "700";
            readonly lineHeight: 32;
            readonly letterSpacing: -0.5;
            readonly color: "#0A2540";
        };
        readonly statLabel: {
            readonly fontSize: 11;
            readonly fontWeight: "500";
            readonly lineHeight: 14;
            readonly letterSpacing: 0.5;
            readonly color: "#7A94B0";
        };
    };
};
/**
 * Premium Spacing System
 * Based on 4px grid with additional fine-tuning values
 */
export declare const SPACING: {
    readonly xxs: 2;
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 12;
    readonly base: 16;
    readonly lg: 20;
    readonly xl: 24;
    readonly '2xl': 32;
    readonly '3xl': 40;
    readonly '4xl': 48;
    readonly '5xl': 64;
    readonly '6xl': 80;
};
/**
 * Premium Border Radius
 * Smooth, modern curves
 */
export declare const RADIUS: {
    readonly none: 0;
    readonly xs: 4;
    readonly sm: 6;
    readonly md: 8;
    readonly base: 10;
    readonly lg: 12;
    readonly xl: 16;
    readonly '2xl': 20;
    readonly '3xl': 24;
    readonly '4xl': 32;
    readonly full: 9999;
};
/**
 * Premium Shadow System
 * Layered, sophisticated shadows with subtle color
 */
export declare const SHADOWS: {
    readonly none: {
        readonly shadowColor: "transparent";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 0;
        };
        readonly shadowOpacity: 0;
        readonly shadowRadius: 0;
        readonly elevation: 0;
    };
    readonly xs: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 1;
        };
        readonly shadowOpacity: 0.04;
        readonly shadowRadius: 2;
        readonly elevation: 1;
    };
    readonly sm: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.06;
        readonly shadowRadius: 4;
        readonly elevation: 2;
    };
    readonly md: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 4;
        };
        readonly shadowOpacity: 0.08;
        readonly shadowRadius: 8;
        readonly elevation: 4;
    };
    readonly lg: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.1;
        readonly shadowRadius: 16;
        readonly elevation: 8;
    };
    readonly xl: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 12;
        };
        readonly shadowOpacity: 0.12;
        readonly shadowRadius: 24;
        readonly elevation: 12;
    };
    readonly '2xl': {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 16;
        };
        readonly shadowOpacity: 0.15;
        readonly shadowRadius: 32;
        readonly elevation: 16;
    };
    readonly glow: {
        readonly shadowColor: "#F5A623";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 0;
        };
        readonly shadowOpacity: 0.3;
        readonly shadowRadius: 12;
        readonly elevation: 8;
    };
    readonly glowTeal: {
        readonly shadowColor: "#0EA5A5";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 0;
        };
        readonly shadowOpacity: 0.25;
        readonly shadowRadius: 12;
        readonly elevation: 8;
    };
    readonly card: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 4;
        };
        readonly shadowOpacity: 0.08;
        readonly shadowRadius: 12;
        readonly elevation: 4;
    };
    readonly cardHover: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.12;
        readonly shadowRadius: 20;
        readonly elevation: 8;
    };
    readonly inner: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.06;
        readonly shadowRadius: 4;
        readonly elevation: 0;
    };
};
/**
 * Glassmorphism Styles
 * Modern glass effect for premium UI
 */
export declare const GLASS: {
    readonly light: {
        readonly backgroundColor: "rgba(255, 255, 255, 0.7)";
        readonly backdropFilter: "blur(20px)";
        readonly borderColor: "rgba(255, 255, 255, 0.3)";
        readonly borderWidth: 1;
    };
    readonly dark: {
        readonly backgroundColor: "rgba(10, 37, 64, 0.7)";
        readonly backdropFilter: "blur(20px)";
        readonly borderColor: "rgba(255, 255, 255, 0.1)";
        readonly borderWidth: 1;
    };
    readonly subtle: {
        readonly backgroundColor: "rgba(255, 255, 255, 0.85)";
        readonly backdropFilter: "blur(12px)";
        readonly borderColor: "rgba(255, 255, 255, 0.2)";
        readonly borderWidth: 1;
    };
    readonly accent: {
        readonly backgroundColor: "rgba(245, 166, 35, 0.15)";
        readonly backdropFilter: "blur(16px)";
        readonly borderColor: "rgba(245, 166, 35, 0.3)";
        readonly borderWidth: 1;
    };
};
/**
 * Premium Gradient Configurations
 * For LinearGradient components
 */
export declare const GRADIENTS: {
    readonly ocean: {
        readonly colors: readonly ["#0A2540", "#1A3A5C"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 1;
        };
    };
    readonly oceanDeep: {
        readonly colors: readonly ["#051628", "#0A2540", "#1E4976"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 0;
            readonly y: 1;
        };
    };
    readonly dawn: {
        readonly colors: readonly ["#0A2540", "#1E4976", "#FF8A65", "#FFD93D"];
        readonly start: {
            readonly x: 0;
            readonly y: 1;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 0;
        };
    };
    readonly sunrise: {
        readonly colors: readonly ["#FFD93D", "#FF8A65", "#FF7043"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 1;
        };
    };
    readonly gold: {
        readonly colors: readonly ["#F5A623", "#FFD93D"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 1;
        };
    };
    readonly goldShimmer: {
        readonly colors: readonly ["#D4880F", "#F5A623", "#FFD93D", "#F5A623"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 1;
        };
    };
    readonly teal: {
        readonly colors: readonly ["#0A7878", "#0EA5A5", "#14D9D9"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 1;
        };
    };
    readonly cardLight: {
        readonly colors: readonly ["rgba(255,255,255,1)", "rgba(248,250,252,1)"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 0;
            readonly y: 1;
        };
    };
    readonly cardDark: {
        readonly colors: readonly ["rgba(15,42,72,1)", "rgba(10,31,56,1)"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 0;
            readonly y: 1;
        };
    };
    readonly shimmer: {
        readonly colors: readonly ["transparent", "rgba(255,255,255,0.3)", "transparent"];
        readonly start: {
            readonly x: 0;
            readonly y: 0;
        };
        readonly end: {
            readonly x: 1;
            readonly y: 0;
        };
    };
};
/**
 * Logo Variants
 */
export declare const LOGO_VARIANTS: {
    readonly light: "light";
    readonly dark: "dark";
    readonly color: "color";
    readonly gold: "gold";
};
/**
 * Breakpoints (for responsive design)
 */
export declare const BREAKPOINTS: {
    readonly xs: 0;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
};
/**
 * Z-Index Layers
 */
export declare const Z_INDEX: {
    readonly hide: -1;
    readonly base: 0;
    readonly raised: 10;
    readonly dropdown: 1000;
    readonly sticky: 1100;
    readonly fixed: 1200;
    readonly modalBackdrop: 1300;
    readonly modal: 1400;
    readonly popover: 1500;
    readonly tooltip: 1600;
    readonly toast: 1700;
};
/**
 * Animation Configuration
 * Smooth, premium feel
 */
export declare const ANIMATION: {
    readonly instant: 100;
    readonly fast: 150;
    readonly normal: 250;
    readonly slow: 400;
    readonly slower: 600;
    readonly spring: {
        readonly gentle: {
            readonly damping: 20;
            readonly stiffness: 100;
        };
        readonly bouncy: {
            readonly damping: 10;
            readonly stiffness: 200;
        };
        readonly stiff: {
            readonly damping: 25;
            readonly stiffness: 300;
        };
        readonly soft: {
            readonly damping: 15;
            readonly stiffness: 80;
        };
    };
    readonly easing: {
        readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
        readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
        readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
        readonly bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)";
    };
};
/**
 * Icon Sizes
 */
export declare const ICON_SIZES: {
    readonly xs: 14;
    readonly sm: 18;
    readonly md: 22;
    readonly base: 24;
    readonly lg: 28;
    readonly xl: 32;
    readonly '2xl': 40;
    readonly '3xl': 48;
};
/**
 * Premium Button Variants
 */
export declare const BUTTON_VARIANTS: {
    readonly primary: {
        readonly backgroundColor: "#0A2540";
        readonly color: "#FFFFFF";
        readonly borderRadius: 12;
    };
    readonly accent: {
        readonly backgroundColor: "#F5A623";
        readonly color: "#0A2540";
        readonly borderRadius: 12;
    };
    readonly secondary: {
        readonly backgroundColor: "#0EA5A5";
        readonly color: "#FFFFFF";
        readonly borderRadius: 12;
    };
    readonly outline: {
        readonly backgroundColor: "transparent";
        readonly borderColor: "#0A2540";
        readonly borderWidth: 1.5;
        readonly color: "#0A2540";
        readonly borderRadius: 12;
    };
    readonly outlineAccent: {
        readonly backgroundColor: "transparent";
        readonly borderColor: "#F5A623";
        readonly borderWidth: 1.5;
        readonly color: "#F5A623";
        readonly borderRadius: 12;
    };
    readonly ghost: {
        readonly backgroundColor: "transparent";
        readonly color: "#0A2540";
        readonly borderRadius: 12;
    };
    readonly glass: {
        readonly backgroundColor: "rgba(255, 255, 255, 0.15)";
        readonly color: "#FFFFFF";
        readonly borderRadius: 12;
        readonly borderColor: "rgba(255, 255, 255, 0.2)";
        readonly borderWidth: 1;
    };
};
/**
 * Premium FAB (Floating Action Button)
 */
export declare const FAB: {
    readonly shadowColor: "#F5A623";
    readonly shadowOffset: {
        readonly width: 0;
        readonly height: 0;
    };
    readonly shadowOpacity: 0.3;
    readonly shadowRadius: 12;
    readonly elevation: 8;
    readonly size: 60;
    readonly iconSize: 26;
    readonly backgroundColor: "#F5A623";
    readonly color: "#0A2540";
    readonly borderRadius: 32;
};
/**
 * Premium Card Styles
 */
export declare const CARD_STYLES: {
    readonly default: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 4;
        };
        readonly shadowOpacity: 0.08;
        readonly shadowRadius: 12;
        readonly elevation: 4;
        readonly backgroundColor: "#FFFFFF";
        readonly borderRadius: 16;
        readonly padding: 20;
    };
    readonly elevated: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.1;
        readonly shadowRadius: 16;
        readonly elevation: 8;
        readonly backgroundColor: "#FFFFFF";
        readonly borderRadius: 16;
        readonly padding: 20;
    };
    readonly outlined: {
        readonly backgroundColor: "#FFFFFF";
        readonly borderRadius: 16;
        readonly padding: 20;
        readonly borderWidth: 1;
        readonly borderColor: "#E2E8F0";
    };
    readonly glass: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 2;
        };
        readonly shadowOpacity: 0.06;
        readonly shadowRadius: 4;
        readonly elevation: 2;
        readonly backgroundColor: "rgba(255, 255, 255, 0.85)";
        readonly borderRadius: 16;
        readonly padding: 20;
        readonly borderWidth: 1;
        readonly borderColor: "rgba(255, 255, 255, 0.2)";
    };
    readonly premium: {
        readonly shadowColor: "#0A2540";
        readonly shadowOffset: {
            readonly width: 0;
            readonly height: 8;
        };
        readonly shadowOpacity: 0.12;
        readonly shadowRadius: 20;
        readonly elevation: 8;
        readonly backgroundColor: "#FFFFFF";
        readonly borderRadius: 20;
        readonly padding: 24;
        readonly borderWidth: 1;
        readonly borderColor: "#F1F5F9";
    };
};
/**
 * Premium Input Styles
 */
export declare const INPUT_STYLES: {
    readonly default: {
        readonly backgroundColor: "#F8FAFC";
        readonly borderRadius: 12;
        readonly borderWidth: 1;
        readonly borderColor: "#E2E8F0";
        readonly paddingHorizontal: 16;
        readonly paddingVertical: 12;
        readonly fontSize: 15;
        readonly color: "#0A2540";
    };
    readonly focused: {
        readonly borderColor: "#0EA5A5";
        readonly borderWidth: 2;
    };
    readonly error: {
        readonly borderColor: "#EF4444";
        readonly borderWidth: 2;
    };
};
/**
 * Avatar Sizes
 */
export declare const AVATAR_SIZES: {
    readonly xs: {
        readonly size: 24;
        readonly borderRadius: 12;
    };
    readonly sm: {
        readonly size: 32;
        readonly borderRadius: 16;
    };
    readonly md: {
        readonly size: 40;
        readonly borderRadius: 20;
    };
    readonly base: {
        readonly size: 48;
        readonly borderRadius: 24;
    };
    readonly lg: {
        readonly size: 64;
        readonly borderRadius: 32;
    };
    readonly xl: {
        readonly size: 80;
        readonly borderRadius: 40;
    };
    readonly '2xl': {
        readonly size: 120;
        readonly borderRadius: 60;
    };
};
/**
 * Badge Styles
 */
export declare const BADGE_STYLES: {
    readonly default: {
        readonly backgroundColor: "#E2E8F0";
        readonly color: "#4A6382";
        readonly borderRadius: 9999;
        readonly paddingHorizontal: 8;
        readonly paddingVertical: 2;
        readonly fontSize: 11;
        readonly fontWeight: "600";
    };
    readonly primary: {
        readonly backgroundColor: "#1A3A5C";
        readonly color: "#FFFFFF";
    };
    readonly accent: {
        readonly backgroundColor: "#F5A623";
        readonly color: "#0A2540";
    };
    readonly success: {
        readonly backgroundColor: "#D1FAE5";
        readonly color: "#059669";
    };
    readonly warning: {
        readonly backgroundColor: "#FEF3C7";
        readonly color: "#D97706";
    };
    readonly error: {
        readonly backgroundColor: "#FEE2E2";
        readonly color: "#DC2626";
    };
};
/**
 * Status Indicator Colors
 */
export declare const STATUS_COLORS: {
    readonly online: "#10B981";
    readonly offline: "#94A3B8";
    readonly busy: "#EF4444";
    readonly away: "#F59E0B";
    readonly active: "#F5A623";
};
//# sourceMappingURL=branding.d.ts.map