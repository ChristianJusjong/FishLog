import exifParser from 'exif-parser';
import crypto from 'crypto';
import sharp from 'sharp';

export interface ExifData {
  timestamp?: string;
  gps?: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
  };
  device?: {
    make?: string;
    model?: string;
  };
  camera?: {
    iso?: number;
    focalLength?: number;
    exposureTime?: number;
    fNumber?: number;
  };
  dimensions?: {
    width?: number;
    height?: number;
  };
}

/**
 * Extract EXIF data from image buffer
 */
export async function extractExifData(buffer: Buffer): Promise<ExifData> {
  try {
    // Get image metadata using sharp
    const metadata = await sharp(buffer).metadata();

    const exifData: ExifData = {
      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
    };

    // Try to parse EXIF data
    try {
      const parser = exifParser.create(buffer);
      const result = parser.parse();

      // Extract timestamp
      if (result.tags?.DateTimeOriginal) {
        exifData.timestamp = new Date(result.tags.DateTimeOriginal * 1000).toISOString();
      } else if (result.tags?.DateTime) {
        exifData.timestamp = new Date(result.tags.DateTime * 1000).toISOString();
      }

      // Extract GPS data
      if (result.tags?.GPSLatitude && result.tags?.GPSLongitude) {
        exifData.gps = {
          latitude: result.tags.GPSLatitude,
          longitude: result.tags.GPSLongitude,
          altitude: result.tags.GPSAltitude,
        };
      }

      // Extract device information
      if (result.tags?.Make || result.tags?.Model) {
        exifData.device = {
          make: result.tags.Make,
          model: result.tags.Model,
        };
      }

      // Extract camera settings
      if (result.tags?.ISO || result.tags?.FocalLength || result.tags?.ExposureTime || result.tags?.FNumber) {
        exifData.camera = {
          iso: result.tags.ISO,
          focalLength: result.tags.FocalLength,
          exposureTime: result.tags.ExposureTime,
          fNumber: result.tags.FNumber,
        };
      }
    } catch (exifError) {
      // EXIF parsing failed - this is ok, not all images have EXIF data
      console.log('No EXIF data found in image');
    }

    return exifData;
  } catch (error) {
    console.error('Error extracting EXIF data:', error);
    return {};
  }
}

/**
 * Calculate SHA-256 hash of image buffer
 */
export function calculateImageHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Validate EXIF GPS coordinates against claimed coordinates
 * Returns true if within acceptable threshold (100 meters)
 */
export function validateGpsCoordinates(
  exifGps: { latitude: number; longitude: number } | undefined,
  claimedGps: { latitude: number; longitude: number }
): {
  isValid: boolean;
  distance?: number;
  warning?: string;
} {
  if (!exifGps) {
    return {
      isValid: false,
      warning: 'No GPS data found in image EXIF',
    };
  }

  // Calculate distance using Haversine formula
  const R = 6371e3; // Earth radius in meters
  const φ1 = (exifGps.latitude * Math.PI) / 180;
  const φ2 = (claimedGps.latitude * Math.PI) / 180;
  const Δφ = ((claimedGps.latitude - exifGps.latitude) * Math.PI) / 180;
  const Δλ = ((claimedGps.longitude - exifGps.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  const threshold = 100; // 100 meters
  const isValid = distance <= threshold;

  return {
    isValid,
    distance: Math.round(distance),
    warning: isValid
      ? undefined
      : `GPS coordinates differ by ${Math.round(distance)}m from EXIF data`,
  };
}

/**
 * Validate EXIF timestamp against claimed timestamp
 * Returns true if within acceptable threshold (5 minutes)
 */
export function validateTimestamp(
  exifTimestamp: string | undefined,
  claimedTimestamp: Date
): {
  isValid: boolean;
  difference?: number;
  warning?: string;
} {
  if (!exifTimestamp) {
    return {
      isValid: false,
      warning: 'No timestamp found in image EXIF',
    };
  }

  const exifDate = new Date(exifTimestamp);
  const difference = Math.abs(claimedTimestamp.getTime() - exifDate.getTime());
  const differenceMinutes = Math.floor(difference / 1000 / 60);

  const threshold = 5 * 60 * 1000; // 5 minutes in milliseconds
  const isValid = difference <= threshold;

  return {
    isValid,
    difference: differenceMinutes,
    warning: isValid
      ? undefined
      : `Timestamp differs by ${differenceMinutes} minutes from EXIF data`,
  };
}
