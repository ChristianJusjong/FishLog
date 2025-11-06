declare module 'exif-parser' {
  interface ExifResult {
    tags?: {
      GPSLatitude?: number;
      GPSLongitude?: number;
      GPSAltitude?: number;
      DateTimeOriginal?: number;
      DateTime?: number;
      Make?: string;
      Model?: string;
      ISO?: number;
      FocalLength?: number;
      ExposureTime?: number;
      FNumber?: number;
      [key: string]: any;
    };
    imageSize?: {
      width?: number;
      height?: number;
    };
  }

  interface ExifParser {
    parse(): ExifResult;
  }

  export function create(buffer: Buffer): ExifParser;
}
