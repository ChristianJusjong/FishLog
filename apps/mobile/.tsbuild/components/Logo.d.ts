import React from 'react';
interface LogoProps {
    size?: number;
    variant?: 'light' | 'dark' | 'color';
    showText?: boolean;
}
export declare function Logo({ size, variant, showText }: LogoProps): React.JSX.Element;
export declare function LogoIcon({ size, variant }: Omit<LogoProps, 'showText'>): React.JSX.Element;
export {};
//# sourceMappingURL=Logo.d.ts.map