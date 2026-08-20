import React from 'react';
import { COLORS, GRADIENTS, SHADOWS, GLASS, SPACING, RADIUS, TYPOGRAPHY, ANIMATION } from '@/constants/branding';
export type Theme = 'light' | 'dark';
type ThemeColors = typeof COLORS & {
    cardBackground: string;
    inputBackground: string;
    divider: string;
    shimmer: string;
};
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    colors: ThemeColors;
    isDark: boolean;
    gradients: typeof GRADIENTS;
    shadows: typeof SHADOWS;
    glass: typeof GLASS;
    spacing: typeof SPACING;
    radius: typeof RADIUS;
    typography: typeof TYPOGRAPHY;
    animation: typeof ANIMATION;
}
export declare const useTheme: () => ThemeContextType;
export declare const useDynamicStyles: <T extends object>(styleFactory: (colors: ThemeColors, isDark: boolean) => T) => T;
export declare const ThemeProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useColors: () => ThemeColors;
export declare const useIsDark: () => boolean;
export declare const useShadows: () => {
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
export declare const useGradients: () => {
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
export declare const useSpacing: () => {
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
export declare const useRadius: () => {
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
export {};
//# sourceMappingURL=ThemeContext.d.ts.map