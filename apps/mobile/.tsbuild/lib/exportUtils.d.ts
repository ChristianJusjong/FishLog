export interface Catch {
    id: string;
    species?: string;
    lengthCm?: number;
    weightKg?: number;
    bait?: string;
    lure?: string;
    rig?: string;
    technique?: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    createdAt: string;
    visibility?: string;
}
export interface Statistics {
    totalCatches: number;
    speciesBreakdown: {
        species: string;
        count: number;
    }[];
    averageLength?: number;
    averageWeight?: number;
    personalBests: {
        species: string;
        length?: number;
        weight?: number;
    }[];
    timeline?: {
        period: string;
        count: number;
    }[];
}
/**
 * Export catches to PDF
 */
export declare function exportCatchesToPDF(catches: Catch[], title?: string): Promise<void>;
/**
 * Export statistics to PDF
 */
export declare function exportStatisticsToPDF(stats: Statistics, title?: string): Promise<void>;
/**
 * Export catches to CSV
 */
export declare function exportCatchesToCSV(catches: Catch[]): Promise<void>;
//# sourceMappingURL=exportUtils.d.ts.map