import React from 'react';
interface MapPickerProps {
    latitude: number | null;
    longitude: number | null;
    onLocationSelect: (lat: number, lng: number) => void;
    readOnly?: boolean;
}
declare global {
    interface Window {
        L: any;
    }
}
export default function MapPicker({ latitude, longitude, onLocationSelect, readOnly }: MapPickerProps): React.JSX.Element;
export {};
//# sourceMappingURL=MapPicker.d.ts.map