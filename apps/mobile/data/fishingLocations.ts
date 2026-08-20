// Comprehensive Danish fishing locations database
// Used by AI Guide and Map for location-based recommendations

export interface FishSpecies {
  id: string;
  name: string;
  icon: string;
  category: 'ferskvand' | 'saltvand' | 'begge';
  season: string;
  minSize: number; // Minimum legal size in cm
}

export const FISH_SPECIES_DB: FishSpecies[] = [
  // Ferskvandsfisk
  { id: 'gedde', name: 'Gedde', icon: '🐊', category: 'ferskvand', season: 'Hele året', minSize: 60 },
  { id: 'aborre', name: 'Aborre', icon: '🐟', category: 'ferskvand', season: 'Hele året', minSize: 0 },
  { id: 'sandart', name: 'Sandart', icon: '🐠', category: 'ferskvand', season: 'Hele året', minSize: 50 },
  { id: 'karpe', name: 'Karpe', icon: '🐡', category: 'ferskvand', season: 'Maj-Sep', minSize: 0 },
  { id: 'brasen', name: 'Brasen', icon: '🐟', category: 'ferskvand', season: 'Hele året', minSize: 0 },
  { id: 'suder', name: 'Suder', icon: '🐟', category: 'ferskvand', season: 'Maj-Sep', minSize: 0 },
  { id: 'skalle', name: 'Skalle', icon: '🐟', category: 'ferskvand', season: 'Hele året', minSize: 0 },
  { id: 'aal', name: 'Ål', icon: '🐍', category: 'begge', season: 'Fredet', minSize: 45 },

  // Laksefisk
  { id: 'oerred', name: 'Bækørred', icon: '🐟', category: 'ferskvand', season: 'Mar-Sep', minSize: 30 },
  { id: 'havorred', name: 'Havørred', icon: '🐟', category: 'begge', season: 'Hele året', minSize: 40 },
  { id: 'laks', name: 'Laks', icon: '🐟', category: 'begge', season: 'Apr-Okt', minSize: 60 },
  { id: 'regnbue', name: 'Regnbueørred', icon: '🌈', category: 'ferskvand', season: 'Hele året', minSize: 0 },
  { id: 'helt', name: 'Helt', icon: '🐟', category: 'ferskvand', season: 'Hele året', minSize: 36 },
  { id: 'stallingr', name: 'Stalling', icon: '🐟', category: 'ferskvand', season: 'Hele året', minSize: 33 },

  // Saltvandsfisk
  { id: 'torsk', name: 'Torsk', icon: '🐟', category: 'saltvand', season: 'Hele året', minSize: 38 },
  { id: 'fladfisk', name: 'Fladfisk', icon: '🐠', category: 'saltvand', season: 'Hele året', minSize: 25 },
  { id: 'rodspaette', name: 'Rødspætte', icon: '🐠', category: 'saltvand', season: 'Hele året', minSize: 27 },
  { id: 'skrubbe', name: 'Skrubbe', icon: '🐠', category: 'saltvand', season: 'Hele året', minSize: 25 },
  { id: 'pighvar', name: 'Pighvar', icon: '🐠', category: 'saltvand', season: 'Hele året', minSize: 30 },
  { id: 'makrel', name: 'Makrel', icon: '🐟', category: 'saltvand', season: 'Jun-Sep', minSize: 20 },
  { id: 'hornfisk', name: 'Hornfisk', icon: '🐟', category: 'saltvand', season: 'Apr-Jun', minSize: 0 },
  { id: 'bars', name: 'Bars/Havbars', icon: '🐟', category: 'saltvand', season: 'Hele året', minSize: 40 },
  { id: 'sild', name: 'Sild', icon: '🐟', category: 'saltvand', season: 'Hele året', minSize: 0 },
  { id: 'multe', name: 'Multe', icon: '🐟', category: 'saltvand', season: 'Jun-Okt', minSize: 0 },
];

export interface FishingLocation {
  name: string;
  latitude: number;
  longitude: number;
  description: string;
  waterType: 'ferskvand' | 'saltvand' | 'brakvand';
  species: string[]; // IDs from FISH_SPECIES_DB
  depth?: string;
  regulations?: string;
}

export interface LocationCategory {
  region: string;
  locations: FishingLocation[];
}

export const LOCATIONS_BY_REGION: LocationCategory[] = [
  {
    region: "Jylland - Søer",
    locations: [
      { name: "Silkeborg Søerne", latitude: 56.17, longitude: 9.55, description: "Gedde, aborre, sandart - populært område", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle', 'aal'], depth: "2-22m", regulations: "Dagkort påkrævet" },
      { name: "Mossø", latitude: 55.95, longitude: 9.75, description: "Danmarks dybeste sø - gedde, aborre", waterType: 'ferskvand', species: ['gedde', 'aborre', 'helt', 'brasen', 'skalle', 'aal'], depth: "Op til 21m", regulations: "Dagkort påkrævet" },
      { name: "Hald Sø", latitude: 56.38, longitude: 9.35, description: "Stor sø med flotte fisk", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle'], depth: "Op til 31m", regulations: "Dagkort påkrævet" },
      { name: "Tjele Langsø", latitude: 56.48, longitude: 9.48, description: "Gedde og aborre", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'karpe'], depth: "3-8m", regulations: "Frit fiskeri" },
      { name: "Tange Sø", latitude: 56.35, longitude: 9.58, description: "Kunstig sø - gode gedder", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'karpe'], depth: "2-12m", regulations: "Dagkort påkrævet" },
      { name: "Stubbe Sø", latitude: 56.22, longitude: 10.52, description: "Nær Djursland", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'suder'], depth: "2-6m", regulations: "Frit fiskeri" },
      { name: "Julsø", latitude: 56.10, longitude: 9.62, description: "Del af Silkeborg søerne", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'aal'], depth: "3-15m", regulations: "Dagkort påkrævet" },
      { name: "Borre Sø", latitude: 56.12, longitude: 9.58, description: "Fin geddefiskeri", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle'], depth: "2-10m", regulations: "Dagkort påkrævet" },
      { name: "Skanderborg Sø", latitude: 56.03, longitude: 9.93, description: "Bynært fiskeri", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'karpe', 'skalle'], depth: "2-14m", regulations: "Dagkort påkrævet" },
    ],
  },
  {
    region: "Jylland - Åer",
    locations: [
      { name: "Gudenåen", latitude: 56.26, longitude: 9.50, description: "Danmarks længste å - ørred, gedde", waterType: 'ferskvand', species: ['oerred', 'havorred', 'laks', 'gedde', 'aborre', 'aal', 'stallingr'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Skjern Å", latitude: 55.95, longitude: 8.50, description: "Berømt laksefiskeri", waterType: 'ferskvand', species: ['laks', 'havorred', 'oerred', 'gedde', 'aal', 'stallingr'], depth: "0.5-4m", regulations: "Dagkort + fisketegn, kvote på laks" },
      { name: "Karup Å", latitude: 56.30, longitude: 9.15, description: "Ørred og laks", waterType: 'ferskvand', species: ['oerred', 'havorred', 'laks', 'aal', 'stallingr'], depth: "0.5-2.5m", regulations: "Dagkort + fisketegn" },
      { name: "Storå", latitude: 56.35, longitude: 8.45, description: "Vestjysk å med havørred", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aborre', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Varde Å", latitude: 55.62, longitude: 8.48, description: "God havørred å", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Kongeåen", latitude: 55.45, longitude: 9.05, description: "Ørred og havørred", waterType: 'ferskvand', species: ['havorred', 'oerred', 'gedde', 'aborre', 'aal'], depth: "0.5-2m", regulations: "Dagkort + fisketegn" },
      { name: "Vidå", latitude: 54.93, longitude: 8.90, description: "Sydligste å - havørred", waterType: 'ferskvand', species: ['havorred', 'oerred', 'gedde', 'aal'], depth: "0.5-2.5m", regulations: "Dagkort + fisketegn" },
      { name: "Gudenåen Øvre", latitude: 55.97, longitude: 9.43, description: "Øvre del ved Tinnet Krat - ørredfiskeri", waterType: 'ferskvand', species: ['oerred', 'havorred', 'gedde', 'aborre', 'aal', 'stallingr'], depth: "0.3-1.5m", regulations: "Dagkort + fisketegn" },
      { name: "Gudenåen Nedre", latitude: 56.45, longitude: 10.03, description: "Nedre del ved Randers - havørred", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aborre', 'aal', 'stallingr'], depth: "1-4m", regulations: "Dagkort + fisketegn" },
    ],
  },
  {
    region: "Jylland - Kyster",
    locations: [
      { name: "Limfjorden", latitude: 56.85, longitude: 9.00, description: "Havørred, fladfisk, torsk", waterType: 'brakvand', species: ['havorred', 'torsk', 'fladfisk', 'skrubbe', 'bars', 'multe', 'sild', 'hornfisk', 'aal'], depth: "1-15m", regulations: "Fisketegn påkrævet" },
      { name: "Mariager Fjord", latitude: 56.65, longitude: 10.00, description: "Flot fjord med havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild', 'aal'], depth: "2-10m", regulations: "Fisketegn påkrævet" },
      { name: "Randers Fjord", latitude: 56.52, longitude: 10.20, description: "Brakvand - gedde, aborre", waterType: 'brakvand', species: ['gedde', 'aborre', 'havorred', 'skrubbe', 'aal'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Nissum Fjord", latitude: 56.35, longitude: 8.15, description: "Vestkysten - havørred, fladfisk", waterType: 'brakvand', species: ['havorred', 'skrubbe', 'fladfisk', 'bars', 'aal'], depth: "1-5m", regulations: "Fisketegn påkrævet" },
      { name: "Ringkøbing Fjord", latitude: 56.00, longitude: 8.20, description: "Stor lagune - havørred", waterType: 'brakvand', species: ['havorred', 'skrubbe', 'fladfisk', 'bars', 'multe', 'aal'], depth: "1-5m", regulations: "Fisketegn påkrævet" },
      { name: "Vejle Fjord", latitude: 55.70, longitude: 9.60, description: "Havørred og fladfisk", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'skrubbe', 'makrel', 'sild', 'hornfisk'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Horsens Fjord", latitude: 55.85, longitude: 10.00, description: "Gode fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'rodspaette', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Ebeltoft Vig", latitude: 56.20, longitude: 10.70, description: "Djursland - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'torsk', 'makrel', 'hornfisk', 'sild'], depth: "2-18m", regulations: "Fisketegn påkrævet" },
      { name: "Ålborg Bugt", latitude: 57.05, longitude: 10.00, description: "Torsk og fladfisk", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'rodspaette', 'skrubbe', 'havorred', 'makrel', 'sild'], depth: "5-25m", regulations: "Fisketegn påkrævet" },
      { name: "Hanstholm", latitude: 57.12, longitude: 8.62, description: "Nordsøen - torsk, makrel", waterType: 'saltvand', species: ['torsk', 'makrel', 'fladfisk', 'rodspaette', 'pighvar', 'sild', 'hornfisk'], depth: "5-40m", regulations: "Fisketegn påkrævet" },
      { name: "Hirtshals", latitude: 57.58, longitude: 9.95, description: "Havfiskeri - mange arter", waterType: 'saltvand', species: ['torsk', 'makrel', 'fladfisk', 'rodspaette', 'pighvar', 'sild', 'hornfisk', 'havorred'], depth: "5-50m", regulations: "Fisketegn påkrævet" },
      { name: "Skagen", latitude: 57.72, longitude: 10.58, description: "Grenen - unikt fiskeri", waterType: 'saltvand', species: ['torsk', 'makrel', 'fladfisk', 'rodspaette', 'hornfisk', 'sild', 'havorred', 'bars'], depth: "3-40m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fyn",
    locations: [
      { name: "Odense Fjord", latitude: 55.48, longitude: 10.50, description: "Havørred og fladfisk", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars', 'aal'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Nyborg Fjord", latitude: 55.30, longitude: 10.82, description: "Gode havørreder", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'makrel'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Kerteminde Bugt", latitude: 55.45, longitude: 10.65, description: "Populært område", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'makrel', 'bars'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Faaborg Fjord", latitude: 55.10, longitude: 10.25, description: "Sydfyn - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'hornfisk', 'makrel'], depth: "2-18m", regulations: "Fisketegn påkrævet" },
      { name: "Svendborg Sund", latitude: 55.07, longitude: 10.60, description: "Mellem Fyn og øerne", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'makrel', 'bars'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Arreskov Sø", latitude: 55.17, longitude: 10.32, description: "Fyns største sø", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'karpe', 'aal'], depth: "2-8m", regulations: "Dagkort påkrævet" },
      { name: "Langeland", latitude: 54.90, longitude: 10.75, description: "Øhav - mange arter", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'rodspaette', 'pighvar', 'hornfisk', 'makrel', 'bars'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Ærø", latitude: 54.85, longitude: 10.40, description: "Flot ø-fiskeri", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'makrel', 'bars'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Sønderby Klint", latitude: 55.47, longitude: 9.93, description: "Kystfiskeri ved klinten - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Båringskov", latitude: 55.52, longitude: 10.05, description: "Skovkyst - havørred og fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Fyns Hoved", latitude: 55.62, longitude: 10.62, description: "Nordfyns spids - strømfiskeri", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Thurø Rev", latitude: 55.05, longitude: 10.68, description: "Populær havørredplads ved Svendborg", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Sjælland - Søer",
    locations: [
      { name: "Esrum Sø", latitude: 56.02, longitude: 12.38, description: "Nordsjællands største sø", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle', 'aal', 'helt'], depth: "2-22m", regulations: "Dagkort påkrævet" },
      { name: "Arresø", latitude: 55.97, longitude: 12.10, description: "Danmarks største sø", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle', 'karpe', 'aal'], depth: "2-6m", regulations: "Dagkort påkrævet" },
      { name: "Furesø", latitude: 55.80, longitude: 12.40, description: "Dyb sø nær København", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'helt', 'brasen', 'aal'], depth: "3-37m", regulations: "Dagkort påkrævet" },
      { name: "Tissø", latitude: 55.58, longitude: 11.27, description: "Vestsjælland - gedde, sandart", waterType: 'ferskvand', species: ['gedde', 'sandart', 'aborre', 'brasen', 'skalle', 'aal'], depth: "2-13m", regulations: "Dagkort påkrævet" },
      { name: "Sorø Sø", latitude: 55.43, longitude: 11.55, description: "Smuk sø med gedde", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'karpe', 'aal'], depth: "2-12m", regulations: "Dagkort påkrævet" },
      { name: "Tystrup-Bavelse", latitude: 55.37, longitude: 11.62, description: "To forbundne søer", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle', 'aal'], depth: "2-18m", regulations: "Dagkort påkrævet" },
      { name: "Gyrstinge Sø", latitude: 55.47, longitude: 11.72, description: "Gedde og aborre", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'aal'], depth: "2-8m", regulations: "Dagkort påkrævet" },
      { name: "Holme Å Put & Take", latitude: 55.65, longitude: 12.05, description: "Put & Take fiskeri", waterType: 'ferskvand', species: ['regnbue', 'oerred', 'karpe'], depth: "1-4m", regulations: "Put & Take - betaling" },
    ],
  },
  {
    region: "Sjælland - Kyster",
    locations: [
      { name: "Øresund", latitude: 55.85, longitude: 12.65, description: "Havørred, torsk, fladfisk", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'rodspaette', 'skrubbe', 'hornfisk', 'makrel', 'sild', 'bars'], depth: "3-30m", regulations: "Fisketegn påkrævet" },
      { name: "Køge Bugt", latitude: 55.45, longitude: 12.35, description: "Populært kystfiskeri", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'rodspaette', 'hornfisk', 'sild'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Præstø Fjord", latitude: 55.12, longitude: 12.05, description: "Havørred og fladfisk", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'gedde', 'aborre', 'aal'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Roskilde Fjord", latitude: 55.75, longitude: 12.05, description: "Lang fjord - havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'aal'], depth: "1-12m", regulations: "Fisketegn påkrævet" },
      { name: "Isefjord", latitude: 55.72, longitude: 11.80, description: "Stor fjord med mange arter", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'makrel', 'aal'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Storebælt (Korsør)", latitude: 55.33, longitude: 11.13, description: "Stærk strøm - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'rodspaette', 'hornfisk', 'makrel', 'bars'], depth: "5-40m", regulations: "Fisketegn påkrævet" },
      { name: "Karrebæksminde", latitude: 55.18, longitude: 11.65, description: "Sydsjælland - fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'rodspaette', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Møn Klint", latitude: 54.97, longitude: 12.55, description: "Flot kystfiskeri", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Stevns Klint", latitude: 55.27, longitude: 12.45, description: "Kystfiskeri ved klinten", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Mandehoved", latitude: 55.02, longitude: 11.72, description: "Sydsjælland halvø - havørred og fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Albuen", latitude: 54.72, longitude: 11.05, description: "Sydvestlig odde - unikke strømforhold", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "2-18m", regulations: "Fisketegn påkrævet" },
      { name: "Sydstenen", latitude: 54.98, longitude: 12.12, description: "Markant sten ved Møn - havørred hotspot", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Møns Klint Fyr", latitude: 54.95, longitude: 12.53, description: "Ved fyrtårnet - dybt vand tæt på land", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel'], depth: "5-30m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Bornholm",
    locations: [
      { name: "Sandvig", latitude: 55.28, longitude: 14.77, description: "Nordspidsen - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'laks'], depth: "3-30m", regulations: "Fisketegn påkrævet" },
      { name: "Gudhjem", latitude: 55.22, longitude: 14.97, description: "Klippekysten", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Svaneke", latitude: 55.13, longitude: 15.07, description: "Østkysten - torsk", waterType: 'saltvand', species: ['torsk', 'havorred', 'fladfisk', 'hornfisk', 'makrel'], depth: "5-35m", regulations: "Fisketegn påkrævet" },
      { name: "Nexø", latitude: 55.05, longitude: 15.13, description: "Havnefiskeri", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild', 'havorred'], depth: "3-30m", regulations: "Fisketegn påkrævet" },
      { name: "Dueodde", latitude: 54.98, longitude: 15.08, description: "Sydspidsen - fladfisk", waterType: 'saltvand', species: ['fladfisk', 'rodspaette', 'pighvar', 'skrubbe', 'havorred', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Rønne", latitude: 55.10, longitude: 14.70, description: "Største by - mange muligheder", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Hammershus", latitude: 55.27, longitude: 14.75, description: "Ved slottet - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'laks'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Nordjylland",
    locations: [
      { name: "Thy Nationalpark", latitude: 57.00, longitude: 8.50, description: "Vild natur - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'rodspaette', 'pighvar', 'torsk', 'hornfisk'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Blokhus", latitude: 57.25, longitude: 9.58, description: "Vestkysten - havfiskeri", waterType: 'saltvand', species: ['fladfisk', 'rodspaette', 'pighvar', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-25m", regulations: "Fisketegn påkrævet" },
      { name: "Løkken", latitude: 57.37, longitude: 9.72, description: "Strand og mole - stenrev", waterType: 'saltvand', species: ['fladfisk', 'rodspaette', 'torsk', 'hornfisk', 'makrel', 'sild'], depth: "2-30m", regulations: "Fisketegn påkrævet" },
      { name: "Læsø", latitude: 57.27, longitude: 11.00, description: "Ø i Kattegat", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Sæby", latitude: 57.33, longitude: 10.53, description: "Østkysten - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Frederikshavn", latitude: 57.43, longitude: 10.53, description: "Stor havn - mange arter", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "3-35m", regulations: "Fisketegn påkrævet" },
      { name: "Uggerby Å", latitude: 57.55, longitude: 10.05, description: "66 km å med udløb i Skagerrak", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Liver Å", latitude: 57.52, longitude: 9.92, description: "Syd for Hirtshals - havørred", waterType: 'ferskvand', species: ['havorred', 'oerred', 'laks', 'aal'], depth: "0.5-2m", regulations: "Dagkort + fisketegn" },
      { name: "Nibe Bredning", latitude: 56.98, longitude: 9.63, description: "Sildeplads i Limfjorden", waterType: 'brakvand', species: ['sild', 'havorred', 'fladfisk', 'torsk', 'skrubbe'], depth: "2-10m", regulations: "Fisketegn påkrævet" },
      { name: "Gjøl", latitude: 57.07, longitude: 9.70, description: "Limfjorden - fladfisk og havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Guldkysten", latitude: 56.92, longitude: 9.10, description: "Limfjorden - kendt havørredkyst", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
      { name: "Rønbjerg", latitude: 56.75, longitude: 9.05, description: "Limfjorden vest - fladfisk", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Binderup Å", latitude: 56.85, longitude: 9.65, description: "Små å ved Limfjorden - havørred", waterType: 'ferskvand', species: ['havorred', 'oerred', 'aal'], depth: "0.5-2m", regulations: "Dagkort + fisketegn" },
      { name: "Skagen Havn", latitude: 57.72, longitude: 10.60, description: "Havnefiskeri ved Grenen", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Mors", latitude: 56.82, longitude: 8.82, description: "Ø i Limfjorden - alsidig fiskeri", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild', 'hornfisk'], depth: "1-15m", regulations: "Fisketegn påkrævet" },
      { name: "Fur", latitude: 56.83, longitude: 9.00, description: "Lille ø i Limfjorden - havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Sønderjylland",
    locations: [
      { name: "Genner Bugt", latitude: 55.05, longitude: 9.48, description: "Top havørredplads - kendt for store fisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Als", latitude: 54.95, longitude: 9.90, description: "Øhav med fantastisk havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'skrubbe', 'hornfisk', 'makrel', 'bars'], depth: "2-25m", regulations: "Fisketegn påkrævet" },
      { name: "Als Sund", latitude: 54.92, longitude: 9.82, description: "Strømrigt sund - mange arter", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild', 'bars'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Aabenraa Fjord", latitude: 55.05, longitude: 9.43, description: "Beskyttet fjord - gode havørreder", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Flensborg Fjord", latitude: 54.82, longitude: 9.58, description: "Grænsefjord - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'skrubbe', 'hornfisk', 'bars'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Haderslev Fjord", latitude: 55.25, longitude: 9.50, description: "Lang fjord - gedde og havørred", waterType: 'brakvand', species: ['havorred', 'gedde', 'aborre', 'fladfisk', 'skrubbe', 'aal'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
      { name: "Gels Å", latitude: 55.15, longitude: 9.00, description: "Lakseå ved Ribe", waterType: 'ferskvand', species: ['laks', 'havorred', 'oerred', 'aal', 'gedde'], depth: "0.5-3m", regulations: "Dagkort + fisketegn, kvote på laks" },
      { name: "Brede Å", latitude: 55.00, longitude: 8.95, description: "Sydligste lakseå", waterType: 'ferskvand', species: ['laks', 'havorred', 'oerred', 'gedde', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn, kvote på laks" },
      { name: "Sønderborg Havn", latitude: 54.91, longitude: 9.79, description: "Havnefiskeri - mange arter", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild', 'havorred'], depth: "3-15m", regulations: "Fisketegn påkrævet" },
      { name: "Rømø", latitude: 55.12, longitude: 8.55, description: "Vadehavet - unikke arter", waterType: 'saltvand', species: ['fladfisk', 'skrubbe', 'rodspaette', 'bars', 'multe', 'havorred'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
      { name: "Kegnæs Fyr", latitude: 54.85, longitude: 9.97, description: "Sydspidsen af Als - havørred og fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Halk Hoved", latitude: 55.20, longitude: 9.58, description: "Populær kystplads ved Haderslev", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Østjylland",
    locations: [
      { name: "Udbyhøj", latitude: 56.62, longitude: 10.30, description: "Randers Fjord munding - havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'sild', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Aarhus Havn - Sydmolen", latitude: 56.15, longitude: 10.23, description: "Molefiskeri i Aarhus", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "3-15m", regulations: "Fisketegn påkrævet" },
      { name: "Aarhus Havn - Østmolen", latitude: 56.16, longitude: 10.24, description: "Populært bynært fiskeri", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "3-15m", regulations: "Fisketegn påkrævet" },
      { name: "Ballen Rev", latitude: 55.82, longitude: 10.65, description: "Samsø - havørred og fladfisk", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Kolindsund Kanal", latitude: 56.37, longitude: 10.55, description: "Kanal ved Djursland - gedde", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'aal'], depth: "1-4m", regulations: "Dagkort påkrævet" },
      { name: "Gjerrild Klint", latitude: 56.47, longitude: 10.88, description: "Djursland nordkyst - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Almind Sø", latitude: 56.03, longitude: 9.55, description: "Sø i Søhøjlandet - gedde og aborre", waterType: 'ferskvand', species: ['gedde', 'aborre', 'brasen', 'skalle', 'aal'], depth: "2-10m", regulations: "Dagkort påkrævet" },
      { name: "Lilleåen", latitude: 56.28, longitude: 9.70, description: "Tilløb til Gudenåen - ørred", waterType: 'ferskvand', species: ['oerred', 'havorred', 'gedde', 'aborre', 'aal'], depth: "0.5-2m", regulations: "Dagkort + fisketegn" },
    ],
  },
  {
    region: "Lillebælt",
    locations: [
      { name: "Kolding Fjord", latitude: 55.48, longitude: 9.55, description: "Beskyttet fjord - havørred året rundt", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars'], depth: "2-18m", regulations: "Fisketegn påkrævet" },
      { name: "Fredericia", latitude: 55.57, longitude: 9.75, description: "Havnefiskeri og kyst", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'sild'], depth: "3-25m", regulations: "Fisketegn påkrævet" },
      { name: "Middelfart", latitude: 55.50, longitude: 9.73, description: "Stærk strøm - storsej, torsk", waterType: 'saltvand', species: ['torsk', 'havorred', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "5-35m", regulations: "Fisketegn påkrævet" },
      { name: "Fønsskov", latitude: 55.45, longitude: 9.78, description: "Skovkyst - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Hejlsminde", latitude: 55.37, longitude: 9.57, description: "Noret og stranden", waterType: 'brakvand', species: ['havorred', 'gedde', 'aborre', 'fladfisk', 'skrubbe', 'aal'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Gamborg Fjord", latitude: 55.47, longitude: 9.72, description: "Roligt farvand - fladfisk", waterType: 'saltvand', species: ['fladfisk', 'skrubbe', 'havorred', 'hornfisk', 'torsk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Trelde Næs", latitude: 55.55, longitude: 9.82, description: "Strømkant - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel', 'bars'], depth: "3-20m", regulations: "Fisketegn påkrævet" },
      { name: "Kolding Å", latitude: 55.50, longitude: 9.50, description: "Å med havørred og laks opstigning", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aborre', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Vejle Å", latitude: 55.71, longitude: 9.53, description: "Kendt havørred- og lakseå", waterType: 'ferskvand', species: ['havorred', 'laks', 'oerred', 'gedde', 'aborre', 'aal'], depth: "0.5-3m", regulations: "Dagkort + fisketegn" },
      { name: "Ammoniakhavnen", latitude: 55.69, longitude: 9.62, description: "Vejle Fjord - molefiskeri", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "3-15m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Vestjylland - Kyster",
    locations: [
      { name: "Hvide Sande", latitude: 56.00, longitude: 8.12, description: "Lystfiskerparadis - hav og fjord", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'rodspaette', 'sild', 'hornfisk', 'makrel', 'bars'], depth: "2-30m", regulations: "Fisketegn påkrævet" },
      { name: "Hvide Sande Sluse", latitude: 56.00, longitude: 8.13, description: "Sildefiskeri i foråret", waterType: 'brakvand', species: ['sild', 'havorred', 'skrubbe', 'fladfisk', 'bars', 'multe'], depth: "1-5m", regulations: "Fisketegn påkrævet" },
      { name: "Thorsminde", latitude: 56.37, longitude: 8.12, description: "Nissum Fjord udløb", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'rodspaette', 'torsk', 'sild', 'hornfisk'], depth: "2-20m", regulations: "Fisketegn påkrævet" },
      { name: "Thyborøn", latitude: 56.70, longitude: 8.22, description: "Limfjordens vestlige udløb", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'rodspaette', 'makrel', 'sild', 'hornfisk', 'havorred'], depth: "5-35m", regulations: "Fisketegn påkrævet" },
      { name: "Agger", latitude: 56.72, longitude: 8.27, description: "Thy - havfiskeri", waterType: 'saltvand', species: ['fladfisk', 'rodspaette', 'pighvar', 'torsk', 'havorred', 'hornfisk'], depth: "2-25m", regulations: "Fisketegn påkrævet" },
      { name: "Bovbjerg", latitude: 56.52, longitude: 8.12, description: "Høj klint - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'makrel'], depth: "3-30m", regulations: "Fisketegn påkrævet" },
      { name: "Nymindegab", latitude: 55.82, longitude: 8.18, description: "Ringkøbing Fjord udløb", waterType: 'brakvand', species: ['havorred', 'skrubbe', 'fladfisk', 'bars', 'multe', 'aal'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Skallingen", latitude: 55.52, longitude: 8.28, description: "Ho Bugt - fladfisk", waterType: 'saltvand', species: ['fladfisk', 'skrubbe', 'rodspaette', 'havorred', 'bars', 'multe'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Nordfyn - Kyster",
    locations: [
      { name: "Flyvesandet", latitude: 55.55, longitude: 10.25, description: "Agernæs - top havørredplads", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'hornfisk', 'bars', 'torsk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Æbleø", latitude: 55.57, longitude: 10.22, description: "Ø nord for Bogense - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Enebærodde", latitude: 55.52, longitude: 10.48, description: "Nær Odense Fjord - mange arter", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'bars', 'aal'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
      { name: "Hasmark Strand", latitude: 55.55, longitude: 10.32, description: "Sandstrand - fladfisk", waterType: 'saltvand', species: ['fladfisk', 'skrubbe', 'havorred', 'hornfisk', 'torsk'], depth: "2-10m", regulations: "Fisketegn påkrævet" },
      { name: "Bogense", latitude: 55.57, longitude: 10.08, description: "Havn og kyst", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'sild'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Isefjord & Omegn",
    locations: [
      { name: "Vellerup Vig", latitude: 55.70, longitude: 11.88, description: "Østlig Isefjord - populær plads", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'aal'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Bramsnæs Bugt", latitude: 55.67, longitude: 11.78, description: "Sydlig Isefjord - havørred", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'hornfisk', 'aal'], depth: "2-10m", regulations: "Fisketegn påkrævet" },
      { name: "Holbæk Fjord", latitude: 55.72, longitude: 11.70, description: "Inderfjord - rolige vande", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'hornfisk', 'aal', 'gedde'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Tuse Næs", latitude: 55.75, longitude: 11.78, description: "Halvø i Isefjord - strømkant", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'torsk', 'hornfisk', 'bars'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Orø", latitude: 55.78, longitude: 11.85, description: "Ø i Isefjord - fint kystfiskeri", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Lammefjord", latitude: 55.82, longitude: 11.58, description: "Afvandet fjord-område", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'hornfisk', 'aal'], depth: "1-6m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Put & Take",
    locations: [
      { name: "Langesø Put & Take", latitude: 55.42, longitude: 10.18, description: "Fyn - regnbueørred, karpe", waterType: 'ferskvand', species: ['regnbue', 'karpe', 'oerred'], depth: "1-4m", regulations: "Put & Take - betaling" },
      { name: "Rørbæk Sø", latitude: 55.88, longitude: 9.35, description: "Midtjylland - gedde, sandart", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'karpe'], depth: "2-8m", regulations: "Dagkort påkrævet" },
      { name: "Tørring Fiskesø", latitude: 55.87, longitude: 9.50, description: "Put & Take ved Gudenåen", waterType: 'ferskvand', species: ['regnbue', 'oerred', 'karpe'], depth: "1-3m", regulations: "Put & Take - betaling" },
      { name: "Vingsted Put & Take", latitude: 55.72, longitude: 9.35, description: "Ved Vejle - god størrelse", waterType: 'ferskvand', species: ['regnbue', 'oerred', 'karpe'], depth: "2-5m", regulations: "Put & Take - betaling" },
      { name: "Kolding Put & Take", latitude: 55.52, longitude: 9.48, description: "Bynært fiskeri", waterType: 'ferskvand', species: ['regnbue', 'oerred', 'karpe'], depth: "1-4m", regulations: "Put & Take - betaling" },
      { name: "Vennebjerg Golf- og Fiskepark", latitude: 57.42, longitude: 9.95, description: "Nordjylland - Put & Take", waterType: 'ferskvand', species: ['regnbue', 'oerred', 'karpe'], depth: "1-4m", regulations: "Put & Take - betaling" },
      { name: "Abildvig (Falster)", latitude: 54.72, longitude: 12.02, description: "Kendt plads - stenbund, ålegræs", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-10m", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Lolland-Falster",
    locations: [
      { name: "Nakskov Fjord", latitude: 54.82, longitude: 11.10, description: "Vestlolland - havørred, fladfisk", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk', 'aal'], depth: "1-10m", regulations: "Fisketegn påkrævet" },
      { name: "Maribo Søerne", latitude: 54.78, longitude: 11.50, description: "Store søer - gedde, aborre", waterType: 'ferskvand', species: ['gedde', 'aborre', 'sandart', 'brasen', 'skalle', 'aal'], depth: "2-10m", regulations: "Dagkort påkrævet" },
      { name: "Sakskøbing Fjord", latitude: 54.80, longitude: 11.63, description: "Rolig fjord - fladfisk", waterType: 'brakvand', species: ['fladfisk', 'skrubbe', 'havorred', 'aal', 'hornfisk'], depth: "1-8m", regulations: "Fisketegn påkrævet" },
      { name: "Guldborg Sund", latitude: 54.85, longitude: 11.72, description: "Mellem Lolland og Falster", waterType: 'brakvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-12m", regulations: "Fisketegn påkrævet" },
      { name: "Gedser", latitude: 54.57, longitude: 11.93, description: "Danmarks sydligste punkt", waterType: 'saltvand', species: ['torsk', 'fladfisk', 'rodspaette', 'hornfisk', 'makrel', 'sild', 'havorred'], depth: "5-25m", regulations: "Fisketegn påkrævet" },
      { name: "Nysted", latitude: 54.67, longitude: 11.73, description: "Sydkysten - havørred", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'skrubbe', 'torsk', 'hornfisk'], depth: "2-15m", regulations: "Fisketegn påkrævet" },
      { name: "Stubbekøbing", latitude: 54.88, longitude: 12.05, description: "Østfalster - havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel'], depth: "3-18m", regulations: "Fisketegn påkrævet" },
      { name: "Hvideklint", latitude: 54.9370576, longitude: 12.2822623, description: "Vinter/forår plads - dybt vand tæt på kyst, huller på 3-4m", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "3-4m", regulations: "Fisketegn påkrævet" },
      { name: "Vesterskov (Farø)", latitude: 54.9336051, longitude: 11.9936905, description: "Ved Farø bro - 20-25m dybt vand, stærk strøm, trækkende havørred", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "20-25m", regulations: "Fisketegn påkrævet" },
      { name: "Madsesklint", latitude: 54.88153, longitude: 12.206979, description: "Suverænt havørredspot - dybt vand, stærk strøm fra Grønsund", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Djursland",
    locations: [
      { name: "Polterrev", latitude: 56.3925356, longitude: 10.9218865, description: "Første rev syd for Grenå - havørred, vadning anbefales", waterType: 'saltvand', species: ['havorred', 'fladfisk', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Stenrevet (Randers Fjord)", latitude: 56.5793493, longitude: 10.2731833, description: "Yderfjordens mest kendte plads - sten, sand, muslingebanker", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'sild', 'makrel', 'fladfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet, fredning 15/11-2/3" },
    ],
  },
  {
    region: "Fishingindenmark.info - Storebælt",
    locations: [
      { name: "Klarskov", latitude: 55.3012467, longitude: 11.1942729, description: "Vestsjælland - dyb varieret bund, store sten, tangskove, leopardbund", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Nørrehoved", latitude: 55.7476384, longitude: 11.2225855, description: "Afsides plads - varieret bund, rev, dybt vand tæt på", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Drøsselbjerg Strand", latitude: 55.4709794, longitude: 11.181098, description: "God varieret bund - sten, ålegræs, blæretang", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel', 'fladfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Vågehøj", latitude: 55.7349103, longitude: 10.8854063, description: "Stenkyst med stort rev - gode muligheder for store havørred", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel', 'fladfisk', 'sild', 'torsk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Lillebælt",
    locations: [
      { name: "Strandhuse", latitude: 55.4970373, longitude: 9.5344926, description: "Kolding Fjord - typisk fjordbund, blød bund, ålegræs, muslingebanker", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Fællesstykket", latitude: 55.625163, longitude: 9.794351, description: "Vejle Fjord - sten, tangskog, ålegræs, rev med badekar", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Lyngsodde", latitude: 55.5186777, longitude: 9.74088, description: "Lillebælt - dybt vand under bro, flere km kyststræk", waterType: 'saltvand', species: ['havorred', 'torsk', 'hornfisk', 'makrel'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Kasmose", latitude: 55.5545837, longitude: 9.8371612, description: "Fyn - leopardbund, badekar, stejle klinter ved Røjle Klint", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Skelodde", latitude: 55.2400615, longitude: 9.8956628, description: "Fyn - varieret bund, god langs hele odden", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'fladfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Fyn",
    locations: [
      { name: "Svendborg Havn (mole)", latitude: 55.0583275, longitude: 10.6165564, description: "Havnefiskeri - fladfisk, sæsonfisk, havørred", waterType: 'saltvand', species: ['havorred', 'torsk', 'fladfisk', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Fyns Hoved (nord)", latitude: 55.6172817, longitude: 10.5879519, description: "Klassiker - lang stræk mod spidsen, store sten, små rev", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel', 'fladfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Odense Å (by)", latitude: 55.3716455, longitude: 10.3821017, description: "20 km å gennem Odense - 20+ arter, havørred, gedde", waterType: 'ferskvand', species: ['havorred', 'oerred', 'gedde', 'aborre', 'skalle'], depth: "Varierende", regulations: "Dagkort + fisketegn" },
    ],
  },
  {
    region: "Fishingindenmark.info - Mariager Fjord",
    locations: [
      { name: "Dollarhuset (Stenarmen)", latitude: 56.6653596, longitude: 9.9929683, description: "Himmerland - dybt vand, rev, parkering ved vand", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet, fredning 16/9-15/3" },
    ],
  },
  {
    region: "Fishingindenmark.info - Køge Bugt",
    locations: [
      { name: "Strøby Ladeplads", latitude: 55.4009983, longitude: 12.3158112, description: "Stevns - stort rev, store sten, ålegræs, leopardbund", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Roskilde Fjord",
    locations: [
      { name: "Midgård", latitude: 55.8554046, longitude: 12.0450658, description: "Roskilde Fjord - dyb sejlrende tæt på kyst, vadere nødvendige", waterType: 'brakvand', species: ['havorred', 'makrel', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet, fredning ved Græse Å" },
      { name: "Møllekrogen", latitude: 55.7357701, longitude: 11.9926198, description: "Isefjord - lavt område med god dybde i midten, både ferskvand og saltvand", waterType: 'brakvand', species: ['havorred', 'aborre', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Færgebrorevet", latitude: 55.707132, longitude: 11.9912077, description: "Unikt rev midt i Roskilde Fjord - fantastisk havørredfiskeri, naturskøn tur fra Bognæs", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet, Bognæs er fredet" },
      { name: "Herslev Odde", latitude: 55.6758288, longitude: 11.9519769, description: "Spredte muslingebanker og ålegræs - god havørred hele året", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet, fredning syd ved Gevninge Å" },
      { name: "Vesterskov (Bognæs)", latitude: 55.6933976, longitude: 11.9804512, description: "Flotte naturomgivelser - varieret bund, optimal for havørred", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet, Bognæs er fredet" },
      { name: "Veddelev", latitude: 55.6696067, longitude: 12.0818868, description: "Smuk odde med udsigt over Roskilde - varieret bund, havørred", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Isefjord",
    locations: [
      { name: "Lommestenen", latitude: 55.8520443, longitude: 11.7141503, description: "En af de smukkeste pladser i Isefjord - fantastisk naturoplevelse, varieret bund", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Bramsnæs Vig", latitude: 55.6894164, longitude: 11.8378223, description: "En af Isefjords mest populære - magisk efterår/vinter/forår, trofæfisk", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet, ingen kørsel på Bramsnæs" },
      { name: "Bøsserup", latitude: 55.8746823, longitude: 11.6913113, description: "Klassiker på vestsiden - gode pynter, varieret bund, sydøst vind godt", waterType: 'brakvand', species: ['havorred', 'makrel', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Englands Huse", latitude: 55.8681641, longitude: 11.699715, description: "Klassisk plads på vestsiden - spændende stenrev, strækker sig til Bøsserup", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Tempelkrogen", latitude: 55.6726416, longitude: 11.8023262, description: "Populær i kolde måneder - lavere saltholdighed, rev med masser af fisk", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Jægerspris", latitude: 55.8651191, longitude: 11.948889, description: "Revfiskeri med smukke badekar - varieret bund, muslingebanker, ålegræs", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet, skydeterræn mod syd" },
      { name: "Kulhuse", latitude: 55.9316598, longitude: 11.906158, description: "Havn med god parkering - fladfisk fra moler, havørred mod sydvest", waterType: 'brakvand', species: ['havorred', 'hornfisk', 'makrel', 'rodspaette', 'skrubbe'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Galgebjerg Strand", latitude: 55.9877796, longitude: 11.8917696, description: "Nordsjælland - varierede bundforhold, badekar og rev, hele året", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Vesterlyng", latitude: 55.9425204, longitude: 11.6259841, description: "Sandet plads med markant kraftigt rev - naturligt stoppested for havørred", waterType: 'saltvand', species: ['havorred', 'hornfisk', 'makrel'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Bornholm",
    locations: [
      { name: "Svenskehavn", latitude: 55.0890585, longitude: 15.1536914, description: "Klassisk Bornholm plads - grove klipper, skær, vilde forhold", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Limfjorden",
    locations: [
      { name: "Rovvig", latitude: 56.8379511, longitude: 8.6324124, description: "Vinterfiskeri - lavt vand, blød bund, ferskvand udløb", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Lavt", regulations: "Fisketegn påkrævet, fredning i bunden af bugten" },
      { name: "Bådsgård Vig", latitude: 56.6160701, longitude: 9.122713, description: "Stor muslingerev ved pynten - god i kolde måneder", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Silstrup Hoved", latitude: 56.923281, longitude: 8.6619892, description: "Langt spændende stræk - hotspot under smukke klinter", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Færker Odde", latitude: 56.8445344, longitude: 9.0822366, description: "Strækker sig langt ud i fjorden - gode pladser på begge sider", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
      { name: "Lendrup", latitude: 56.9396221, longitude: 9.2095441, description: "Velkendt plads - nem adgang, gode fisk fanges årligt", waterType: 'brakvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Sydsjælland",
    locations: [
      { name: "Store Brunddrag", latitude: 54.6131675, longitude: 11.4491943, description: "Lolland-Falster - dybt vand tæt på, leopardbund", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Haraldsted Sø", latitude: 55.4788791, longitude: 11.8271746, description: "200 ha sø - gedde, sandart, aborre, maks 11m dyb", waterType: 'ferskvand', species: ['gedde', 'aborre', 'skalle', 'sandart'], depth: "5-11m", regulations: "Fisketegn + dagkort" },
    ],
  },
  {
    region: "Fishingindenmark.info - Sønderjylland",
    locations: [
      { name: "Aabenraa Havn (mole)", latitude: 55.0458395, longitude: 9.4267639, description: "Havnefiskeri - makrel, sild, havørred, fladfisk", waterType: 'saltvand', species: ['havorred', 'makrel', 'sild', 'torsk', 'fladfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Midtjylland Søer",
    locations: [
      { name: "Ejstrup Sø", latitude: 55.9907437, longitude: 9.2857983, description: "Smuk sø ved Holtum Å - gedde tæt på bred, maks 4m", waterType: 'ferskvand', species: ['gedde', 'aborre', 'skalle'], depth: "1-4m", regulations: "Fisketegn påkrævet, kun ved badeområder" },
      { name: "Tollundgaard Put & Take", latitude: 56.153298, longitude: 9.423865, description: "Stor sø ved Silkeborg - 40.000 m², åbent hele året", waterType: 'ferskvand', species: ['regnbue', 'oerred'], depth: "Varierende", regulations: "Put & Take - betaling" },
    ],
  },
  {
    region: "Fishingindenmark.info - Vestkysten",
    locations: [
      { name: "Hvide Sande (moler)", latitude: 56.0038478, longitude: 8.1284948, description: "Mange arter fra moler - makrel, fladfisk, multe, torsk, sild", waterType: 'saltvand', species: ['makrel', 'sild', 'fladfisk', 'hornfisk', 'bars', 'pighvar', 'torsk', 'multe'], depth: "Varierende", regulations: "Fisketegn påkrævet, laks/havørred fredet ved sluse" },
      { name: "Hvide Sande Nordstrand", latitude: 56.0215874, longitude: 8.1050103, description: "Fladfisk og pighvar - makrel i sensommer på lavt vand", waterType: 'saltvand', species: ['fladfisk', 'pighvar', 'makrel'], depth: "0.5-Dybt", regulations: "Fisketegn påkrævet" },
      { name: "Thyborøn Havn (moler)", latitude: 56.7060947, longitude: 8.2233502, description: "Gode faciliteter - nemt for familier, torsk, fladfisk, sild, makrel", waterType: 'saltvand', species: ['makrel', 'sild', 'fladfisk', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
  {
    region: "Fishingindenmark.info - Vejle Fjord Åer",
    locations: [
      { name: "Egtved Å", latitude: 55.6416217, longitude: 9.2828934, description: "God havørred og bækørred - del af Vejle Å systemet", waterType: 'ferskvand', species: ['havorred', 'oerred', 'regnbue'], depth: "Varierende", regulations: "Dagkort + fisketegn" },
      { name: "Borgmesteren", latitude: 55.6277165, longitude: 9.8285913, description: "Vejle Fjord kyst - store havørred fanges årligt, børsteorm", waterType: 'saltvand', species: ['havorred', 'hornfisk'], depth: "Varierende", regulations: "Fisketegn påkrævet" },
    ],
  },
];

// Flatten all locations for easy access
export const ALL_FISHING_LOCATIONS: FishingLocation[] = LOCATIONS_BY_REGION.flatMap(cat => cat.locations);

// Helper to get species info by ID
export const getSpeciesById = (id: string): FishSpecies | undefined =>
  FISH_SPECIES_DB.find(s => s.id === id);

// Helper to get species name by ID
export const getSpeciesName = (id: string): string =>
  getSpeciesById(id)?.name || id;

// Calculate distance between two coordinates in kilometers (Haversine formula)
export const calculateDistance = (
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Find nearest fishing location to given coordinates
export const findNearestFishingLocation = (
  latitude: number,
  longitude: number,
  maxDistanceKm: number = 50
): { location: FishingLocation; distance: number } | null => {
  let nearest: { location: FishingLocation; distance: number } | null = null;

  for (const location of ALL_FISHING_LOCATIONS) {
    const distance = calculateDistance(
      latitude, longitude,
      location.latitude, location.longitude
    );

    if (distance <= maxDistanceKm && (!nearest || distance < nearest.distance)) {
      nearest = { location, distance };
    }
  }

  return nearest;
};

// Get marker color based on water type
export const getWaterTypeColor = (waterType: FishingLocation['waterType']): string => {
  switch (waterType) {
    case 'ferskvand': return '#22C55E'; // Green
    case 'saltvand': return '#3B82F6'; // Blue
    case 'brakvand': return '#8B5CF6'; // Purple
    default: return '#6B7280'; // Gray
  }
};

// Get marker icon based on water type
export const getWaterTypeIcon = (waterType: FishingLocation['waterType']): string => {
  switch (waterType) {
    case 'ferskvand': return 'leaf'; // Lake/river
    case 'saltvand': return 'water'; // Ocean
    case 'brakvand': return 'git-merge'; // Mix
    default: return 'location';
  }
};

// Get all locations that have a specific species
export const getLocationsForSpecies = (speciesId: string): FishingLocation[] => {
  return ALL_FISHING_LOCATIONS.filter(loc => loc.species.includes(speciesId));
};

// Get all species available at a location
export const getSpeciesAtLocation = (locationName: string): FishSpecies[] => {
  const location = ALL_FISHING_LOCATIONS.find(loc => loc.name === locationName);
  if (!location) return [];
  return location.species
    .map(id => getSpeciesById(id))
    .filter((s): s is FishSpecies => s !== undefined);
};

// Find all locations within a radius (in km)
export const findLocationsInRadius = (
  latitude: number,
  longitude: number,
  radiusKm: number
): Array<{ location: FishingLocation; distance: number }> => {
  const results: Array<{ location: FishingLocation; distance: number }> = [];

  for (const location of ALL_FISHING_LOCATIONS) {
    const distance = calculateDistance(
      latitude, longitude,
      location.latitude, location.longitude
    );

    if (distance <= radiusKm) {
      results.push({ location, distance });
    }
  }

  return results.sort((a, b) => a.distance - b.distance);
};

// Get location by name (case-insensitive partial match)
export const getLocationByName = (name: string): FishingLocation | undefined => {
  const nameLower = name.toLowerCase();
  return ALL_FISHING_LOCATIONS.find(loc =>
    loc.name.toLowerCase() === nameLower ||
    loc.name.toLowerCase().includes(nameLower)
  );
};

// Get region for a location
export const getRegionForLocation = (locationName: string): string | undefined => {
  for (const category of LOCATIONS_BY_REGION) {
    if (category.locations.some(loc => loc.name === locationName)) {
      return category.region;
    }
  }
  return undefined;
};

// Get water type label in Danish
export const getWaterTypeLabel = (waterType: FishingLocation['waterType']): string => {
  switch (waterType) {
    case 'ferskvand': return 'Ferskvand';
    case 'saltvand': return 'Saltvand';
    case 'brakvand': return 'Brakvand';
    default: return 'Ukendt';
  }
};

// Search locations by query (name or description)
export const searchLocations = (query: string): FishingLocation[] => {
  const queryLower = query.toLowerCase();
  return ALL_FISHING_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(queryLower) ||
    loc.description.toLowerCase().includes(queryLower)
  );
};
