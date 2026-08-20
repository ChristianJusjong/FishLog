import React from 'react';
export interface PageMenuItem {
    icon: string;
    label: string;
    route?: string;
    onPress?: () => void;
    color?: string;
}
interface PageFloatingMenuProps {
    items: PageMenuItem[];
    buttonColor?: string;
    iconColor?: string;
}
export default function PageFloatingMenu({ items, buttonColor, // Orange - different from right nav (green)
iconColor, }: PageFloatingMenuProps): React.JSX.Element;
export {};
//# sourceMappingURL=PageFloatingMenu.d.ts.map