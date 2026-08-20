/**
 * Spot-Specifik AI Tips & Taktik Motor (AI Spot Tactics Engine)
 * Genererer præcise agnvalg, fiskemetoder og taktikker baseret på lokation, årstid og vejret.
 */

import { FishingLocation, getSpeciesName } from './fishingLocations';
import { calculateTideAndBite, TideData } from './tideEngine';

export interface SpotTactics {
  recommendedLures: {
    name: string;
    type: 'Blink/Wobler' | 'Flue' | 'Jig/Gummi' | 'Naturlig Agn' | 'Spinner';
    color: string;
    weightSize: string;
    targetSpecies: string;
    reason: string;
  }[];
  fishingTechniques: {
    technique: string;
    depthLevel: string;
    retrievalSpeed: string;
    proTip: string;
  }[];
  seasonalAdvice: string;
  weatherAdvice: string;
  tideAdvice?: string;
  overallScore: number; // 0 - 100%
  goldenHour: string;
}

export function generateSpotTactics(
  spot: FishingLocation,
  weather?: { temperature?: number; windSpeed?: number; windDirection?: string; pressure?: number },
  date: Date = new Date()
): SpotTactics {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const season = month >= 2 && month <= 4 ? 'forår' :
                 month >= 5 && month <= 7 ? 'sommer' :
                 month >= 8 && month <= 10 ? 'efterår' : 'vinter';

  const temp = weather?.temperature ?? 12;
  const wind = weather?.windSpeed ?? 5;
  const pressure = weather?.pressure ?? 1013;
  const tide = calculateTideAndBite(spot.latitude, spot.longitude, date, pressure);

  const primarySpeciesId = spot.species[0] || (spot.waterType === 'saltvand' ? 'havorred' : 'gedde');
  const primarySpeciesName = getSpeciesName(primarySpeciesId);

  const recommendedLures: SpotTactics['recommendedLures'] = [];
  const fishingTechniques: SpotTactics['fishingTechniques'] = [];

  // Tailor lures and techniques based on water type and primary species
  if (spot.waterType === 'saltvand' || primarySpeciesId === 'havorred') {
    // Sea Trout / Saltwater Coast
    if (season === 'vinter' || temp < 6) {
      recommendedLures.push(
        {
          name: 'Savage Gear Sandeel 16g',
          type: 'Blink/Wobler',
          color: 'Pink / UV Hvid',
          weightSize: '16-19g',
          targetSpecies: 'Havørred',
          reason: 'I koldt vand udløser stærke pink/hvide UV-farver hugrefleksen hos træge ørreder.',
        },
        {
          name: 'Polar Magnus Flue',
          type: 'Flue',
          color: 'Pink / Hvid m. kuglekædeøjne',
          weightSize: 'Krog str. 6-8',
          targetSpecies: 'Havørred',
          reason: 'Klassisk vinterflue til fiskeri i lavvandede bugter og vige med blød bund.',
        }
      );
      fishingTechniques.push({
        technique: 'Langsomt spinnefiskeri m. lange spinstop',
        depthLevel: '0.5 - 1.5 meter (kystnært og badekar)',
        retrievalSpeed: 'Meget rolig indspinning',
        proTip: 'Lav 2-3 sekunders spinstop, hvor blinket roterer og synker – 80% af huggene falder her.',
      });
    } else if (season === 'forår') {
      recommendedLures.push(
        {
          name: 'Bornholmerpilen / Sømmet',
          type: 'Blink/Wobler',
          color: 'Kobber / Rød el. Tobisgrøn',
          weightSize: '18-22g',
          targetSpecies: 'Havørred',
          reason: 'Efterligner forårets tobis og børsteorm, der trækker tæt under land.',
        },
        {
          name: 'Pattegrisen / Børsteorm Flue',
          type: 'Flue',
          color: 'Salmon Pink / Brun',
          weightSize: 'Krog str. 4-6',
          targetSpecies: 'Havørred',
          reason: 'Suveræn i forårsmånederne ved tangbælter og leopardbund.',
        }
      );
      fishingTechniques.push({
        technique: 'Aktivt kystfiskeri i leopardbunden',
        depthLevel: '1.0 - 2.5 meter',
        retrievalSpeed: 'Varierende tempo med små ryk i stangtoppen',
        proTip: 'Opsøg fralandsvind eller let pålandsvind, hvor fødeemner hvirvles op i brændingen.',
      });
    } else if (season === 'sommer') {
      recommendedLures.push(
        {
          name: 'Stripperen / Gennemløber',
          type: 'Blink/Wobler',
          color: 'Sort / Sølv (Natfiskeri) el. Hvid',
          weightSize: '15-18g',
          targetSpecies: 'Havørred & Hornfisk',
          reason: 'Sorte silhuetagn er uovertrufne til natfiskeri over mørk tangbund.',
        },
        {
          name: 'Skumfidus / Cigar Flue',
          type: 'Flue',
          color: 'Sort / Mørkebrun',
          weightSize: 'Overfladeflue',
          targetSpecies: 'Havørred',
          reason: 'Trækkes i overfladen i nattemørket – skaber en uimodståelig trykbølge.',
        }
      );
      fishingTechniques.push({
        technique: 'Nat- og dæmringsfiskeri over rev og strømsæt',
        depthLevel: 'Top 0.5 - 1.0 meter',
        retrievalSpeed: 'Jævn, markant indspinning',
        proTip: 'Fisk i de mørkeste timer mellem 23:00 og 04:00, hvor havørreden jager rejer på det lave vand.',
      });
    } else {
      // Efterår
      recommendedLures.push(
        {
          name: 'Møresilda / Savage Gear Seeker',
          type: 'Blink/Wobler',
          color: 'Kobber / Guld / Sort',
          weightSize: '18-22g',
          targetSpecies: 'Havørred',
          reason: 'Mørke og metalliske toner efterligner efterårets sild og store kutlinger.',
        },
        {
          name: 'Kobberbassen Flue',
          type: 'Flue',
          color: 'Kobberdubbing',
          weightSize: 'Krog str. 8',
          targetSpecies: 'Havørred',
          reason: 'Lille diskret tangloppeimitation, der lokker selv de mest forsigtige ørreder.',
        }
      );
      fishingTechniques.push({
        technique: 'Affiskning af dybe kanter og revspidser',
        depthLevel: '1.5 - 3.5 meter',
        retrievalSpeed: 'Mellem hurtigt med aggressive spinstop',
        proTip: 'Hold øje med springende fisk og fugledyk – havørrederne samler sig inden gydetrækket.',
      });
    }
  } else if (spot.waterType === 'ferskvand' && (primarySpeciesId === 'gedde' || primarySpeciesId === 'sandart')) {
    // Pike / Zander / Freshwater Predator
    recommendedLures.push(
      {
        name: 'Westin Swim 12cm Jerkbait',
        type: 'Blink/Wobler',
        color: season === 'vinter' ? 'Firetiger / Chartreuse' : 'Pike / Real Roach',
        weightSize: '53g Suspending',
        targetSpecies: 'Gedde',
        reason: 'S-kurve svømmebevægelse, der provokerer store rovfisk på kanter og sivbælter.',
      },
      {
        name: 'Westin ShadTeez 12cm m. Stinger',
        type: 'Jig/Gummi',
        color: temp > 15 ? 'Official Roach' : 'Headlight / Orange',
        weightSize: '15-20g jighoved',
        targetSpecies: primarySpeciesName,
        reason: 'Halen slår bredt selv ved lav fart; perfekt til bundnært fiskeri på skrænter.',
      }
    );
    fishingTechniques.push({
      technique: 'Jerkbait- og jiggning over dybdekurver',
      depthLevel: season === 'sommer' ? '2.0 - 4.0 meter' : '4.0 - 8.0 meter',
      retrievalSpeed: 'Korte ryk efterfulgt af pause (3-5 sek)',
      proTip: 'I ferskvand står rovfiskene ofte tæt på vegetation, åkander eller markante bundfald.',
    });
  } else {
    // Perch / Generic Lake / River
    recommendedLures.push(
      {
        name: 'Mepps Aglia Longue Str. 3',
        type: 'Spinner',
        color: 'Kobber / Røde prikker',
        weightSize: '8g',
        targetSpecies: 'Aborre & Ørred',
        reason: 'Kraftige trykbølger, der lokker nysgerrige aborrer ud af skjulesteder.',
      },
      {
        name: 'Ned Rig / Creature Bait 7cm',
        type: 'Jig/Gummi',
        color: 'Green Pumpkin / Motor Oil',
        weightSize: '5-7g jighead',
        targetSpecies: 'Aborre & Sandart',
        reason: 'Står lodret på bunden og imiterer krebs eller døende byttefisk.',
      }
    );
    fishingTechniques.push({
      technique: 'Ned-rig hopping langs bunden',
      depthLevel: '1.5 - 4.0 meter',
      retrievalSpeed: 'Langsomme små hop langs bunden',
      proTip: 'Lad agnen hvile 2-4 sekunder på bunden mellem hop – aborren suger den ofte op i pausen.',
    });
  }

  // Seasonal advice string
  const seasonalAdvice =
    season === 'forår'
      ? `Foråret er i fuld gang! Vandet varmes op (${temp}°C), og fiskene søger ind på lavere vand for at jage efter vinterdvalen.`
      : season === 'sommer'
      ? `Sommervandet er varmt (${temp}°C). Fisk tidlig morgen (05:00-08:00) eller sen aften/nat for optimal aktivitet.`
      : season === 'efterår'
      ? `Efteråret er højsæson for storfangster! Fiskene æder aggressivt op til vinteren, især ved vindstød og skiftende vejr.`
      : `Vinterfiskeri kræver langsom præsentation (${temp}°C). Søg mod dybere huller eller lune badekar i solskin.`;

  // Weather advice string
  const weatherAdvice =
    wind > 8
      ? `Frisk vind (${wind} m/s): Brug tungere agn (18-24g) til lange kast. Fiskeri i det grumsede vand tæt på brændingen giver ofte hug.`
      : `Let brise (${wind} m/s) og stabilt lufttryk (${pressure} hPa): Giver fremragende overblik. Brug naturtro farver og diskret forfang.`;

  const tideAdvice = spot.waterType === 'saltvand'
    ? `${tide.phaseLabel} med ${tide.currentSpeedKnots} knob strøm. Vandbevægelsen aktiverer byttefisk og rovfisk!`
    : undefined;

  const goldenHour = season === 'sommer' ? '05:00 - 07:30 & 21:30 - 23:30' : '07:00 - 10:00 & 16:30 - 18:30';

  return {
    recommendedLures,
    fishingTechniques,
    seasonalAdvice,
    weatherAdvice,
    tideAdvice,
    overallScore: tide.biteChanceScore,
    goldenHour,
  };
}
