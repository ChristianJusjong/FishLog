/**
 * Dansk Lystfisker NLP Stemmelogning Parser
 * Forvandler talt dansk fra lystfiskere til strukturerede fangstdata.
 */

export interface ParsedVoiceCatch {
  species?: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  released?: boolean;
  notes?: string;
  confidence: number; // 0 to 1
}

const SPECIES_MAP: { [key: string]: string } = {
  'havørred': 'Havørred',
  'havoered': 'Havørred',
  'havorred': 'Havørred',
  'hav ørred': 'Havørred',
  'seatrout': 'Havørred',
  'laks': 'Laks',
  'bækørred': 'Bækørred',
  'regnbueørred': 'Regnbueørred',
  'regnbue': 'Regnbueørred',
  'gedde': 'Gedde',
  'aborre': 'Aborre',
  'sandart': 'Sandart',
  'torsk': 'Torsk',
  'hornfisk': 'Hornfisk',
  'makrel': 'Makrel',
  'rødspætte': 'Rødspætte',
  'skrubbe': 'Skrubbe',
  'pighvar': 'Pighvar',
  'fladfisk': 'Fladfisk',
  'karpe': 'Karpe',
  'brasen': 'Brasen',
  'suder': 'Suder',
  'skalle': 'Skalle',
  'ål': 'Ål',
  'multe': 'Multe',
  'sild': 'Sild',
  'havbars': 'Havbars',
  'bars': 'Havbars',
};

/**
 * Parser talt dansk tekst til fangst-parametre
 */
export function parseVoiceCatchText(spokenText: string): ParsedVoiceCatch {
  if (!spokenText || !spokenText.trim()) {
    return { confidence: 0 };
  }

  const text = spokenText.toLowerCase();
  const result: ParsedVoiceCatch = {
    confidence: 0,
    notes: spokenText.trim(),
  };

  let matchedFields = 0;

  // 1. Find Fiskeart
  for (const [pattern, officialName] of Object.entries(SPECIES_MAP)) {
    if (text.includes(pattern)) {
      result.species = officialName;
      matchedFields += 1;
      break;
    }
  }

  // 2. Find Længde i cm
  // Mønstre: "54 cm", "54 centimeter", "54,5 cm", "på 54 cm", "længde 54"
  const lengthMatch = text.match(/(\d+([.,]\d+)?)\s*(cm|centimeter)/i) ||
                      text.match(/længde\s*(på)?\s*(\d+([.,]\d+)?)/i);
  if (lengthMatch) {
    const rawVal = lengthMatch[1] ? lengthMatch[1].replace(',', '.') : lengthMatch[2]?.replace(',', '.');
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val >= 5 && val <= 250) {
      result.lengthCm = Math.round(val);
      matchedFields += 1;
    }
  }

  // 3. Find Vægt i kg eller gram
  // Mønstre: "1.8 kg", "1,8 kilo", "1800 gram", "1800 g", "vægt på 2 kilo"
  const kgMatch = text.match(/(\d+([.,]\d+)?)\s*(kg|kilo)/i) ||
                  text.match(/vægt\s*(på)?\s*(\d+([.,]\d+)?)\s*(kilo|kg)?/i);
  const gramMatch = text.match(/(\d+)\s*(g|gram)/i);

  if (gramMatch && !kgMatch) {
    const gVal = parseInt(gramMatch[1], 10);
    if (!isNaN(gVal) && gVal >= 50) {
      result.weightKg = +(gVal / 1000).toFixed(2);
      matchedFields += 1;
    }
  } else if (kgMatch) {
    const rawVal = kgMatch[1] ? kgMatch[1].replace(',', '.') : kgMatch[2]?.replace(',', '.');
    const val = parseFloat(rawVal);
    if (!isNaN(val) && val >= 0.1 && val <= 100) {
      result.weightKg = +val.toFixed(2);
      matchedFields += 1;
    }
  }

  // 4. Find C&R / Genudsat vs Hjemtaget
  if (
    text.includes('genudsat') ||
    text.includes('sluppet fri') ||
    text.includes('sat ud') ||
    text.includes('c&r') ||
    text.includes('svømme videre')
  ) {
    result.released = true;
    matchedFields += 1;
  } else if (
    text.includes('hjemtaget') ||
    text.includes('taget med hjem') ||
    text.includes('aflivet') ||
    text.includes('til spisefisk') ||
    text.includes('i tasken')
  ) {
    result.released = false;
    matchedFields += 1;
  }

  // 5. Find Agn / Endegrej
  // Mønstre: "på [agn]", "taget på [agn]", "huggede på [agn]"
  const baitMatch = text.match(/(på|taget på|huggede på|med)\s+([a-zA-ZæøåÆØÅ0-9\s-]+?)(,\s*|\.\s*|den blev|og den|og vejede|som vejede|$)/i);
  if (baitMatch && baitMatch[2]) {
    const potentialBait = baitMatch[2].trim();
    // Filter out obvious filler words
    if (
      potentialBait.length > 2 &&
      !potentialBait.includes('kilo') &&
      !potentialBait.includes('centimeter') &&
      !potentialBait.includes('cm')
    ) {
      result.bait = potentialBait.charAt(0).toUpperCase() + potentialBait.slice(1);
      matchedFields += 1;
    }
  }

  result.confidence = Math.min(1, matchedFields / 3);
  return result;
}
