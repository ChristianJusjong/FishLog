import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { weatherTelemetryService } from '../services/weather-telemetry';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Helper function to get season name in Danish
function getSeason(date: Date): string {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return 'forår';
  if (month >= 6 && month <= 8) return 'sommer';
  if (month >= 9 && month <= 11) return 'efterår';
  return 'vinter';
}

// Helper function to get time of day in Danish
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return 'tidlig morgen';
  if (hour >= 10 && hour < 12) return 'formiddag';
  if (hour >= 12 && hour < 17) return 'eftermiddag';
  if (hour >= 17 && hour < 21) return 'aften';
  return 'nat';
}

function getGeminiClient(userApiKey?: string): GoogleGenerativeAI {
  const apiKey = userApiKey || GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey === 'your_groq_api_key_here') {
    throw new Error('Google Gemini API key is required. Please add your Gemini API key in your profile settings or server configuration.');
  }
  return new GoogleGenerativeAI(apiKey);
}

function getFallbackRecommendations(species: string, latitude: number, longitude: number): any {
  const normSpecies = species.toLowerCase();
  
  const base = {
    species,
    model_used: 'fallback-rulesengine',
  };

  if (normSpecies.includes('gedde') || normSpecies.includes('pike')) {
    return {
      ...base,
      success_probability: 0.75,
      best_time: 'Morgen og sen eftermiddag (svagt lys)',
      baits: [
        { name: 'Skalle / Roach', type: 'Naturligt agn', confidence: 0.9, reason: 'Gedden foretrækker fed agnfisk i denne sæson.' }
      ],
      lures: [
        { name: 'Savage Gear Shad', type: 'Soft Shad', color: 'Grøn/Guld (Pike)', size: '15-20cm', confidence: 0.85, reason: 'Naturtro bevægelse trigger geddens hugrefleks.' },
        { name: 'Spoon / Blink', type: 'Blink', color: 'Sølv/Kobber', size: '12cm', confidence: 0.8, reason: 'Giver kraftige vibrationer og reflekterer lyset godt.' }
      ],
      techniques: [
        { name: 'Spin fiskeri', description: 'Varieret indspinning med pludselige spinstop.', confidence: 0.85, tips: ['Gedder hugger ofte i spinstoppet.', 'Brug altid stålforfang!'] }
      ],
      nearby_spots: [
        { latitude: latitude + 0.002, longitude: longitude - 0.001, distance_km: 0.4, success_rate: 0.7, recent_catches: 3, reason: 'Masser af siv og lavvandede vige med skjul.' }
      ],
      weather_impact: 'Det nuværende skydække reducerer refleksioner i vandet, hvilket øger chancerne.',
      seasonal_notes: 'Efter gydningen (forår) er gedden meget aggressiv og søgt føde på lavt vand.',
      confidence_score: 0.8
    };
  } else if (normSpecies.includes('aborre') || normSpecies.includes('perch')) {
    return {
      ...base,
      success_probability: 0.8,
      best_time: 'Midt på dagen (højt sollys)',
      baits: [
        { name: 'Regnorm', type: 'Naturligt agn', confidence: 0.95, reason: 'Klassisk og uimodståeligt agn til aborre under alle forhold.' }
      ],
      lures: [
        { name: 'Jighead / Jig', type: 'Jig', color: 'Motorolie/Chartreuse', size: '7-10cm', confidence: 0.85, reason: 'Jigs danser forførende langs bunden.' },
        { name: 'Spinner', type: 'Spinner', color: 'Kobber med prikker', size: 'Maks 10g', confidence: 0.8, reason: 'Vibrationerne tiltrækker nysgerrige aborrer.' }
      ],
      techniques: [
        { name: 'Jigfiskeri', description: 'Små hop langs bunden.', confidence: 0.9, tips: ['Hold linen stram under faldet.', 'Fisk tæt på strukturer som sten og broer.'] }
      ],
      nearby_spots: [
        { latitude: latitude - 0.001, longitude: longitude + 0.002, distance_km: 0.3, success_rate: 0.75, recent_catches: 8, reason: 'Stensætning og skrænter hvor aborren søger skjul i stimer.' }
      ],
      weather_impact: 'Moderat vind skaber strøm i vandet, hvilket aktiverer aborrens jagtadfærd.',
      seasonal_notes: 'Sommer og det tidlige efterår er absolut højsæson for aborrefiskeri.',
      confidence_score: 0.85
    };
  } else if (normSpecies.includes('ørred') || normSpecies.includes('trout') || normSpecies.includes('havørred')) {
    return {
      ...base,
      success_probability: 0.65,
      best_time: 'Tidlig morgen og skumring',
      baits: [
        { name: 'Børsteorm', type: 'Naturligt agn', confidence: 0.85, reason: 'Yndlingsføde for havørreder i de kystnære områder.' }
      ],
      lures: [
        { name: 'Gennemløber blink', type: 'Blink', color: 'Hvid/Grøn eller Hvid/Lyserød', size: '15-20g', confidence: 0.85, reason: 'Imiterer tobis eller hundestejler perfekt.' },
        { name: 'Flue', type: 'Flue', color: 'Pattegrisen (Pink)', size: 'krog 4-8', confidence: 0.8, reason: 'Meget effektiv kystflue, der ligner en reje.' }
      ],
      techniques: [
        { name: 'Aktivt spinfiskeri', description: 'Hurtig indspinning med hyppige spin-stop på 1-2 sekunder.', confidence: 0.85, tips: ['Spin-stop er afgørende - havørreden hugger ofte her.', 'Affisk vandet i vifteform.'] }
      ],
      nearby_spots: [
        { latitude: latitude + 0.005, longitude: longitude + 0.004, distance_km: 0.7, success_rate: 0.6, recent_catches: 2, reason: 'Badekar og "blandt bund" med sten og tang (karbade).' }
      ],
      weather_impact: 'Let krusning på overfladen maskerer din tilstedeværelse og gør ørreden modigere.',
      seasonal_notes: 'Forår og efterår er bedst på kysten. Sommerfiskeri foregår bedst om natten.',
      confidence_score: 0.75
    };
  } else {
    // Default fallback
    return {
      ...base,
      success_probability: 0.7,
      best_time: 'Tidlig morgen og aften',
      baits: [
        { name: 'Regnorm eller Brød', type: 'Naturligt agn', confidence: 0.8, reason: 'Universelt spiseligt for de fleste ferskvands- og saltvandsfisk.' }
      ],
      lures: [
        { name: 'Klassisk Spinnestang / Spinner', type: 'Spinner', color: 'Sølv/Rød', size: '8-12g', confidence: 0.75, reason: 'Enkel og alsidig agn der tiltrækker mange rovfisk.' }
      ],
      techniques: [
        { name: 'Varieret spinfiskeri', description: 'Indspinning i forskellige dybder.', confidence: 0.8, tips: ['Afprøv forskellige dybder for at finde fisken.', 'Hold øje med aktivitet på overfladen.'] }
      ],
      nearby_spots: [
        { latitude: latitude + 0.001, longitude: longitude + 0.001, distance_km: 0.2, success_rate: 0.65, recent_catches: 4, reason: 'Varieret bundstruktur og dybdekurver.' }
      ],
      weather_impact: 'De nuværende vejrforhold er rimelige til en alsidig fisketur.',
      seasonal_notes: 'Generelt aktivt fiskeri. Tilpas hastigheden efter vandtemperaturen.',
      confidence_score: 0.7
    };
  }
}

export async function aiRoutes(fastify: FastifyInstance) {
  // Get AI fishing recommendations
  fastify.post(
    '/ai/recommendations',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['species', 'latitude', 'longitude'],
          properties: {
            species: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            timestamp: { type: 'string' },
            water_temp: { type: 'number' },
            wind_speed: { type: 'number' },
            depth: { type: 'number' },
            bottom_type: { type: 'string' },
            air_temp: { type: 'number' },
            cloud_cover: { type: 'number' },
            precipitation: { type: 'number' },
            pressure: { type: 'number' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const payload = request.body as {
          species: string;
          latitude: number;
          longitude: number;
          timestamp?: string;
          water_temp?: number;
          wind_speed?: number;
          depth?: number;
          bottom_type?: string;
          air_temp?: number;
          cloud_cover?: number;
          precipitation?: number;
          pressure?: number;
        };

        fastify.log.info(`Generating Google Gemini recommendations for ${payload.species}`);

        // Get user's Gemini/Google API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user?.userId || '' },
          select: { geminiApiKey: true, groqApiKey: true },
        });

        const userApiKey = user?.geminiApiKey || user?.groqApiKey || undefined;

        // Parse timestamp to get season and time of day
        const timestamp = payload.timestamp ? new Date(payload.timestamp) : new Date();
        const season = getSeason(timestamp);
        const timeOfDay = getTimeOfDay(timestamp);

        // Fetch real-time meteorological metrics if missing
        let currentPressure = payload.pressure;
        let currentWind = payload.wind_speed;
        let currentAirTemp = payload.air_temp;
        let currentWaterTemp = payload.water_temp;

        if (!currentPressure || !currentWind || !currentAirTemp) {
          try {
            const apiWeather = await weatherTelemetryService.fetchWeatherData(payload.latitude, payload.longitude);
            if (apiWeather.pressureHpa && !currentPressure) currentPressure = apiWeather.pressureHpa;
            if (apiWeather.windSpeedMps && !currentWind) currentWind = apiWeather.windSpeedMps;
            if (apiWeather.airTemp && !currentAirTemp) currentAirTemp = apiWeather.airTemp;
            if (apiWeather.waterTemp && !currentWaterTemp) currentWaterTemp = apiWeather.waterTemp;
          } catch (e) {
            fastify.log.warn(e, 'Failed to fetch background weather for AI prompt');
          }
        }

        // Fetch empirical telemetry foundation from AiCatchTelemetry dataset
        const telemetryStats = await weatherTelemetryService.getSpeciesTelemetryStats(payload.species);
        const telemetryContext = telemetryStats ? `
Empirisk fangsttelemetri fra FishLog AI Databasen:
- Baseret på ${telemetryStats.sampleSize} verificerede fangster af ${payload.species}
- Gennemsnitligt barometertryk ved succesfulde fangster: ${telemetryStats.avgPressure || '1013'} hPa
- Gennemsnitlig vandtemperatur ved fangst: ${telemetryStats.avgWaterTemp !== null ? telemetryStats.avgWaterTemp + '°C' : 'Varierende'}
- Mest givende tidspunkt på døgnet: ${telemetryStats.bestTimeOfDay}
- Mest effektive fangstteknik: ${telemetryStats.bestTechnique || 'Spin'}
Brug disse empiriske telemetridata til at kalibrere dine forudsigelser og sandsynligheder med maksimal præcision.` : '';

        // Build prompt for Gemini with specialized Danish angling expertise
        const prompt = `Du er Danmarks førende lystfiskeriekspert, havbiolog og kystguide.
Giv professionelle, hyper-præcise taktiske anbefalinger for arten "${payload.species}" på koordinaterne ${payload.latitude}, ${payload.longitude} i sæsonen "${season}" på tidspunktet "${timeOfDay}".

Vejrforhold: Barometertryk ${currentPressure || '1013'} hPa, Vind ${currentWind || 'ukendt'} m/s, lufttemperatur ${currentAirTemp || 'ukendt'}°C.
Vandforhold: Dybde ${payload.depth || 'ukendt'}m, vandtemperatur ${currentWaterTemp || 'ukendt'}°C, bundtype ${payload.bottom_type || 'blandet/leopardbund'}.
${telemetryContext}

Taktiske retningslinjer for Danmark:
- Havørred på kysten: Analysér leopardbund, revlesystemer, badekar, strømrender og tangskove. I foråret: børsteormesværmning, tobistræk og tanglopper. I sommernatten: skumfluer, overfladeagn og hurtig indspinning. I vinteren: lavvandede fjorde, kobber/pink farver og langsom indspinning med spinstop.
- Gedde & Aborre i sø/å: Sivkanter, skrænter, åkandebælter, dybe huller i koldt vejr. Gedder: store shads med spinstop. Aborre: jigs, dropshot og spinner rigs.
- Farvevalg efter sigt: Klart vand + sol = naturlige farver/kobber/sølv. Grumset vand / overskyet = UV, hvid/grøn, pink, orange (Glimmer/Fluo).

Du SKAL returnere svaret KUN som valid JSON (uden markdown code blocks) med følgende struktur:
{
  "success_probability": 0.75,
  "best_time": "kort beskrivelse af bedste tidspunkt på dagen",
  "baits": [
    {
      "name": "navn på agn",
      "type": "type agn (f.eks. Naturlig)",
      "confidence": 0.9,
      "reason": "begrundelse på dansk"
    }
  ],
  "lures": [
    {
      "name": "navn på wobbler/blink",
      "type": "type (f.eks. Spoon, Soft Shad)",
      "color": "farveanbefaling",
      "size": "størrelse",
      "confidence": 0.85,
      "reason": "begrundelse på dansk"
    }
  ],
  "techniques": [
    {
      "name": "teknik navn",
      "description": "beskrivelse på dansk",
      "confidence": 0.85,
      "tips": ["tip 1", "tip 2"]
    }
  ],
  "nearby_spots": [
    {
      "latitude": ${payload.latitude + 0.002},
      "longitude": ${payload.longitude - 0.001},
      "distance_km": 0.4,
      "success_rate": 0.7,
      "recent_catches": 3,
      "reason": "beskrivelse af spottet"
    }
  ],
  "weather_impact": "beskrivelse af vejrets påvirkning på dansk",
  "seasonal_notes": "sæsonmæssige noter på dansk",
  "confidence_score": 0.8
}`;

        let responseData;
        try {
          const genAI = getGeminiClient(userApiKey);
          const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          });

          const result = await model.generateContent(prompt);
          const rawText = result.response.text();
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleanJson);

          responseData = {
            species: payload.species,
            success_probability: typeof parsed.success_probability === 'number' ? parsed.success_probability : 0.7,
            best_time: parsed.best_time || 'Tidlig morgen og aften',
            baits: Array.isArray(parsed.baits) ? parsed.baits : [],
            lures: Array.isArray(parsed.lures) ? parsed.lures : [],
            techniques: Array.isArray(parsed.techniques) ? parsed.techniques : [],
            nearby_spots: Array.isArray(parsed.nearby_spots) ? parsed.nearby_spots : [],
            weather_impact: parsed.weather_impact || 'Stabil vandtemperatur og moderat vind giver gode betingelser.',
            seasonal_notes: parsed.seasonal_notes || 'Sæsonen er generelt gunstig.',
            confidence_score: typeof parsed.confidence_score === 'number' ? parsed.confidence_score : 0.8,
            model_used: GEMINI_MODEL,
          };
        } catch (geminiError) {
          fastify.log.warn(geminiError, 'Failed to fetch recommendations from Google Gemini, using rule-based fallback');
          responseData = getFallbackRecommendations(payload.species, payload.latitude, payload.longitude);
        }

        return responseData;
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to generate AI recommendations',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Get AI fishing advice for a specific location using Google Gemini
  fastify.post(
    '/ai/fishing-advice',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['location', 'weather'],
          properties: {
            location: {
              type: 'object',
              properties: {
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            weather: {
              type: 'object',
              properties: {
                temperature: { type: 'number' },
                windSpeed: { type: 'number' },
                weatherCode: { type: 'number' },
              },
            },
            nearbyCatchStats: {
              type: 'object',
              nullable: true,
              properties: {
                totalCatches: { type: 'number' },
                commonSpecies: { type: 'array', items: { type: 'string' } },
                avgWeight: { type: 'number' },
              },
            },
            season: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { location, weather, nearbyCatchStats, season } = request.body as {
          location: { latitude: number; longitude: number };
          weather: { temperature: number; windSpeed: number; weatherCode: number };
          nearbyCatchStats?: { totalCatches: number; commonSpecies: string[]; avgWeight: number } | null;
          season: string;
        };

        // Get user's Gemini API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user?.userId || '' },
          select: { geminiApiKey: true, groqApiKey: true },
        });

        const userApiKey = user?.geminiApiKey || user?.groqApiKey || undefined;

        // Build context for AI - request bullet point format for quick overview
        let context = `Du er en dansk fiskeriekspert. Giv KORTE og KONKRETE fakta i punktform (bullet points) på dansk.

VIGTIGT FORMAT:
- Brug kun korte sætninger med emoji-ikoner
- Maks 2-3 ord per punkt hvor muligt
- Ingen lange forklaringer eller brødtekst
- Brug bullet points (•) for hvert punkt

INFORMATION:
📍 Placering: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
🌡️ Temperatur: ${weather.temperature}°C
💨 Vind: ${weather.windSpeed} m/s
📅 Sæson: ${season}
`;

        if (nearbyCatchStats && nearbyCatchStats.totalCatches > 0) {
          context += `\n📊 LOKALE DATA:\n`;
          context += `• ${nearbyCatchStats.totalCatches} fangster i området\n`;
          if (nearbyCatchStats.commonSpecies.length > 0) {
            context += `• Arter: ${nearbyCatchStats.commonSpecies.slice(0, 5).join(', ')}\n`;
          }
          context += `• Gns. vægt: ${Math.round(nearbyCatchStats.avgWeight)}g\n`;
        }

        context += `
GIV RÅD I DETTE FORMAT (brug emoji + kort tekst):

🐟 ARTER I OMRÅDET:
• [art 1]
• [art 2]
• [art 3]

⏰ BEDSTE TIDSPUNKT:
• [tidspunkt]

🎣 AGN & TEKNIK:
• [agn 1]
• [agn 2]
• [teknik]

📏 DYBDE:
• [dybde anbefaling]

💡 TIPS:
• [tip 1]
• [tip 2]

Hold det KORT og KONKRET. Maks 3-4 punkter per sektion.`;

        let adviceText = '';
        try {
          const genAI = getGeminiClient(userApiKey);
          const model = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          });

          const result = await model.generateContent(context);
          adviceText = result.response.text() || 'Ingen råd tilgængelige.';
          return { advice: adviceText, isFallback: false };
        } catch (geminiError: any) {
          fastify.log.error(geminiError, 'Google Gemini API error');

          let fallbackAdvice = `📍 VEJRFORHOLD:\n`;
          fallbackAdvice += `• Temperatur: ${weather.temperature}°C\n`;
          fallbackAdvice += `• Vind: ${weather.windSpeed} m/s\n\n`;

          fallbackAdvice += `⏰ BEDSTE TIDSPUNKT:\n`;
          fallbackAdvice += `• Morgen (solopgang)\n`;
          fallbackAdvice += `• Aften (solnedgang)\n\n`;

          fallbackAdvice += `💡 GENERELLE TIPS:\n`;
          if (weather.temperature < 10) {
            fallbackAdvice += `• Fisk dybere\n• Langsom teknik\n`;
          } else if (weather.temperature > 20) {
            fallbackAdvice += `• Fisk skyggefulde områder\n• Tidlig morgen bedst\n`;
          } else {
            fallbackAdvice += `• Prøv midtvands\n• Variér agn\n`;
          }

          if (weather.windSpeed > 10) {
            fallbackAdvice += `• Find læ\n`;
          } else if (weather.windSpeed < 5) {
            fallbackAdvice += `• Godt til fluefiskeri\n`;
          }

          if (nearbyCatchStats && nearbyCatchStats.totalCatches > 0) {
            fallbackAdvice += `\n📊 LOKALE DATA:\n`;
            fallbackAdvice += `• ${nearbyCatchStats.totalCatches} fangster\n`;
            if (nearbyCatchStats.commonSpecies.length > 0) {
              fallbackAdvice += `• Arter: ${nearbyCatchStats.commonSpecies.slice(0, 3).join(', ')}\n`;
            }
            fallbackAdvice += `• Gns. vægt: ${Math.round(nearbyCatchStats.avgWeight)}g\n`;
          }

          return { advice: fallbackAdvice, isFallback: true };
        }
      } catch (error) {
        fastify.log.error(error, 'Unexpected error in fishing advice endpoint');
        reply.code(500);
        return {
          advice: '❌ Der opstod en uventet fejl. Prøv venligst igen senere.\n\n' +
                  '💡 I mellemtiden kan du:\n' +
                  '• Tjekke tidligere fangster i området\n' +
                  '• Se på vejrudsigten for de kommende dage\n' +
                  '• Dele dine fangster med venner',
          error: 'Failed to generate fishing advice',
          message: error instanceof Error ? error.message : 'Unknown error',
          isFallback: true
        };
      }
    }
  );

  // Identify fish species from image using Google Gemini Vision
  fastify.post(
    '/ai/identify-species',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['imageUrl'],
          properties: {
            imageUrl: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { imageUrl } = request.body as { imageUrl: string };

        fastify.log.info('Identifying fish species from image using Google Gemini Vision');

        // Get user's Gemini API key from profile
        const user = await prisma.user.findUnique({
          where: { id: request.user?.userId || '' },
          select: { geminiApiKey: true, groqApiKey: true },
        });

        const userApiKey = user?.geminiApiKey || user?.groqApiKey || undefined;
        const genAI = getGeminiClient(userApiKey);

        // Build vision prompt for species identification
        const visionPrompt = `Analyser dette billede af en fisk og identificer arten på dansk.

VIGTIGE INSTRUKTIONER:
1. Identificer fiskens art baseret på:
   - Kropsform og proportioner
   - Finneplacering og størrelse
   - Farvemønster og markeringer
   - Skæltype og mundens placering

2. Almindelige danske fiskearter:
   Gedde, Aborre, Sandart, Havørred, Bækørred, Regnbueørred, Laks, Karpe, Brasen, Skalle, Torsk, Makrel, Rødspætte, Skrubbe, Pighvar, Hornfisk, Sild.

3. Svar KUN med JSON (uden markdown formatering) med følgende struktur:
{
  "species": "Dansk artsnavn (f.eks. Gedde)",
  "scientific_name": "Latinsk navn (f.eks. Esox lucius)",
  "confidence": "high" eller "medium" eller "low",
  "estimated_length_cm": 45,
  "estimated_weight_kg": 1.2,
  "features": ["kendetegn 1", "kendetegn 2"]
}`;

        // Prepare image part
        let imagePart: { inlineData: { data: string; mimeType: string } };

        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            imagePart = {
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            };
          } else {
            throw new Error('Invalid base64 image format');
          }
        } else {
          // If URL is an HTTP/HTTPS link, fetch it
          const res = await fetch(imageUrl);
          const arrayBuffer = await res.arrayBuffer();
          const base64Data = Buffer.from(arrayBuffer).toString('base64');
          const mimeType = res.headers.get('content-type') || 'image/jpeg';
          imagePart = {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          };
        }

        const model = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const result = await model.generateContent([visionPrompt, imagePart]);
        const responseText = result.response.text();
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          species: parsed.species || 'Kunne ikke identificere',
          scientific_name: parsed.scientific_name || null,
          confidence: parsed.confidence || 'medium',
          estimated_length_cm: parsed.estimated_length_cm || null,
          estimated_weight_kg: parsed.estimated_weight_kg || null,
          features: parsed.features || [],
          model: GEMINI_MODEL,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.code(500);
        return {
          error: 'Failed to identify species',
          message: error instanceof Error ? error.message : 'Unknown error',
          species: null,
        };
      }
    }
  );

  // Health check for Google Gemini service
  fastify.get(
    '/ai/health',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      try {
        if (!GEMINI_API_KEY) {
          reply.code(503);
          return {
            status: 'unhealthy',
            ai_service: 'Google Gemini API key not configured on server',
          };
        }

        const genAI = getGeminiClient();
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
        const result = await model.generateContent('Svar med ordet: OK');
        const text = result.response.text();

        return {
          status: text ? 'healthy' : 'degraded',
          ai_service: 'Google Gemini',
          model: GEMINI_MODEL,
        };
      } catch (error) {
        reply.code(503);
        return {
          status: 'unhealthy',
          ai_service: 'Google Gemini unreachable',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
