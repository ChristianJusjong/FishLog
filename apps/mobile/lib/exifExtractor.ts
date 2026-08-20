/**
 * EXIF Photo Metadata Extractor & Historical Weather Fetcher
 * Udlæser automatisk GPS, dato og tid fra kamerarullens billeder og henter det historiske vejr på fangstdagen.
 */

export interface ExifCatchMetadata {
  latitude?: number;
  longitude?: number;
  capturedAt?: Date;
  historicalWeather?: {
    temperature: number;
    windSpeed: number; // m/s
    pressure: number;
    weatherCode?: number;
  };
}

/**
 * Konverterer EXIF GPS koordinater (f.eks. [55, 40, 12.3] eller decimaler) til standard decimal grader.
 */
export function parseExifCoordinates(
  lat: number | number[] | undefined,
  latRef: string | undefined,
  lng: number | number[] | undefined,
  lngRef: string | undefined
): { latitude: number; longitude: number } | null {
  if (lat === undefined || lng === undefined) return null;

  let finalLat = typeof lat === 'number' ? lat : (lat[0] + lat[1] / 60 + lat[2] / 3600);
  let finalLng = typeof lng === 'number' ? lng : (lng[0] + lng[1] / 60 + lng[2] / 3600);

  if (latRef === 'S' || latRef === 's') finalLat = -finalLat;
  if (lngRef === 'W' || lngRef === 'w') finalLng = -finalLng;

  if (isNaN(finalLat) || isNaN(finalLng)) return null;

  return {
    latitude: +finalLat.toFixed(5),
    longitude: +finalLng.toFixed(5),
  };
}

/**
 * Parser EXIF DateTimeOriginal (format "YYYY:MM:DD HH:MM:SS" el. standard ISO).
 */
export function parseExifDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;

  try {
    // Check format YYYY:MM:DD HH:MM:SS
    if (/^\d{4}:\d{2}:\d{2}/.test(dateStr)) {
      const parts = dateStr.split(' ');
      const dateParts = parts[0].split(':');
      const timeParts = parts[1] ? parts[1].split(':') : ['12', '00', '00'];

      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      const seconds = parseInt(timeParts[2], 10);

      const parsed = new Date(year, month, day, hours, minutes, seconds);
      if (!isNaN(parsed.getTime())) return parsed;
    }

    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
}

/**
 * Henter historisk vejr via Open-Meteo for den specifikke fangstdag og koordinat.
 */
export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  date: Date
): Promise<ExifCatchMetadata['historicalWeather'] | undefined> {
  try {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const hour = date.getHours();

    const isPast = (Date.now() - date.getTime()) > (24 * 60 * 60 * 1000);

    const baseUrl = isPast
      ? `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,wind_speed_10m,surface_pressure,weather_code&timezone=auto`
      : `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,wind_speed_10m,surface_pressure,weather_code&timezone=auto`;

    const res = await fetch(baseUrl);
    if (!res.ok) return undefined;

    const data = await res.json();
    if (data?.hourly?.temperature_2m) {
      const targetHourIndex = Math.min(hour, data.hourly.temperature_2m.length - 1);

      return {
        temperature: Math.round(data.hourly.temperature_2m[targetHourIndex] || 12),
        windSpeed: Math.round((data.hourly.wind_speed_10m[targetHourIndex] || 18) / 3.6), // km/h to m/s
        pressure: Math.round(data.hourly.surface_pressure[targetHourIndex] || 1013),
        weatherCode: data.hourly.weather_code[targetHourIndex] || 0,
      };
    }
  } catch (e) {
    console.error('Failed to fetch historical weather:', e);
  }
  return undefined;
}

/**
 * Behandler EXIF data fra ImagePicker og returnerer samlet fangstmetadata.
 */
export async function extractCatchMetadataFromImage(asset: any): Promise<ExifCatchMetadata> {
  const exif = asset?.exif || {};

  // Extract coords
  const coords = parseExifCoordinates(
    exif.GPSLatitude || exif.latitude,
    exif.GPSLatitudeRef,
    exif.GPSLongitude || exif.longitude,
    exif.GPSLongitudeRef
  );

  // Extract date
  const capturedAt = parseExifDate(
    exif.DateTimeOriginal || exif.DateTimeDigitized || exif.DateTime
  ) || undefined;

  let historicalWeather = undefined;
  if (coords && capturedAt) {
    historicalWeather = await fetchHistoricalWeather(coords.latitude, coords.longitude, capturedAt);
  }

  return {
    latitude: coords?.latitude,
    longitude: coords?.longitude,
    capturedAt,
    historicalWeather,
  };
}
