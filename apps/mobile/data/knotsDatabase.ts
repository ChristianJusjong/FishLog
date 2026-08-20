/**
 * Offline Fishing Knots & Rigs Database
 * 12 essentielle lystfiskerknob med trin-for-trin instruktioner, brudstyrke, sværhedsgrad og linetype.
 */

export interface KnotStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
}

export interface FishingKnot {
  id: string;
  name: string;
  category: 'line-to-line' | 'line-to-hook' | 'loop' | 'special';
  categoryLabel: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1 = Nemmest, 5 = Ekspert
  strengthPercent: number; // F.eks. 95%
  recommendedLines: ('Fletline' | 'Fluorocarbon' | 'Nylon / Monofil')[];
  bestFor: string;
  description: string;
  steps: KnotStep[];
  proTip: string;
}

export const FISHING_KNOTS: FishingKnot[] = [
  {
    id: 'fg-knot',
    name: 'FG-Knude (FG Knot)',
    category: 'line-to-line',
    categoryLabel: 'Line-til-line',
    difficulty: 4,
    strengthPercent: 98,
    recommendedLines: ['Fletline', 'Fluorocarbon'],
    bestFor: 'Samling af fletline og fluorocarbon forfang til kyst- og predatorfiskeri.',
    description: 'Verdens stærkeste og slankeste samling mellem fletline og tykt forfang. Knuden glider uhindret gennem stangøjerne uden modstand.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Hold fletlinen stramt mellem tænderne eller stangen. Læg fluorocarbon-forfanget vinkelret over fletlinen.',
        tip: 'Stram fletline er nøglen til en perfekt FG-knude.',
      },
      {
        stepNumber: 2,
        instruction: 'Vikl forfanget skiftevis over og under fletlinen 16-20 gange i ottetal-mønster.',
        tip: 'Hold viklingerne tætte og parallelle, så de ikke krydser rodet over hinanden.',
      },
      {
        stepNumber: 3,
        instruction: 'Lav 2-3 halve stik (half-hitches) med fletlinen om BÅDE flet-hovedlinen og forfanget for at låse viklingerne.',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt knuden grundigt med spyt. Træk hårdt i både hovedline og forfang, så fletlinen "bider" ind i fluorocarbonen og skifter farve.',
      },
      {
        stepNumber: 5,
        instruction: 'Klip den overskydende forfangs-ende tæt af, og afslut med 4-6 skiftende halve stik over fletlinen.',
      },
    ],
    proTip: 'Brænd enden af fluorocarbonen forsigtigt med en lighter, så der dannes en lille krave (svamp), der forhindrer fletlinen i at glide af.',
  },
  {
    id: 'grinner-knot',
    name: 'Grinner / Uni-Knob',
    category: 'line-to-hook',
    categoryLabel: 'Line-til-krog/svirvel',
    difficulty: 2,
    strengthPercent: 92,
    recommendedLines: ['Fletline', 'Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Fastgørelse af blink, svirvler, hægter og kroge på alle linetyper.',
    description: 'Lystfiskerens schweizerkniv. Enormt pålidelig knude, der aldrig svigter uanset linevalg.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Før linen gennem krogøjet, og læg 10-15 cm line dobbelt langs hovedlinen.',
      },
      {
        stepNumber: 2,
        instruction: 'Bøj tampen (enden) tilbage mod krogøjet for at danne en løkke langs de to liner.',
      },
      {
        stepNumber: 3,
        instruction: 'Før tampen igennem løkken og rundt om begge liner 5-6 gange (7-8 gange ved tynd fletline).',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt med spyt, og træk roligt i tampen, så viklingerne samler sig til en fin spole.',
      },
      {
        stepNumber: 5,
        instruction: 'Træk i hovedlinen for at glide knuden helt ned mod krogøjet, og klip overskuddet af.',
      },
    ],
    proTip: 'Fugt altid knuden før stramning for at undgå friktionsvarme, der svækker nylon og fluorocarbon.',
  },
  {
    id: 'palomar-knot',
    name: 'Palomar-Knude',
    category: 'line-to-hook',
    categoryLabel: 'Line-til-krog/svirvel',
    difficulty: 1,
    strengthPercent: 95,
    recommendedLines: ['Fletline', 'Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Drop-shot kroge, svirvler og hurtig montering i mørke.',
    description: 'En af de hurtigste og stærkeste knuder i verden. Uovertruffen til fletline og drop-shot fiskeri.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Læg 10-15 cm line dobbelt, og før den dobbelte løkke gennem krogøjet.',
      },
      {
        stepNumber: 2,
        instruction: 'Slå en simpel overhåndsknude med den dobbelte line (lad krogen hænge i midten).',
      },
      {
        stepNumber: 3,
        instruction: 'Før den store løkke hen over hele krogen/agnen, så krogen passerer igennem løkken.',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt knuden, og træk jævnt i både hovedline og tamp, indtil knuden lukker perfekt over krogøjet.',
      },
    ],
    proTip: 'Pas på at den dobbelte line ikke krydser skævt under overhåndsknuden.',
  },
  {
    id: 'rapala-loop',
    name: 'Rapala-Løkke (Rapala Knot)',
    category: 'loop',
    categoryLabel: 'Løkkeknob',
    difficulty: 3,
    strengthPercent: 90,
    recommendedLines: ['Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Woblere, kystwoblere og store kystfluer, der skal have maksimal fri bevægelighed.',
    description: 'Skaber en åben, fast løkke foran agnen, så woblere og fluer kan vrikke uhindret uden at blive afstivet af en stram knude.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Slå en simpel overhåndsknude på forfanget ca. 8-10 cm fra enden (stram den ikke helt).',
      },
      {
        stepNumber: 2,
        instruction: 'Før tampen gennem agnens øje, og derefter tilbage igennem den åbne overhåndsknude.',
      },
      {
        stepNumber: 3,
        instruction: 'Vikl tampen 3 gange rundt om hovedlinen ovenover knuden.',
      },
      {
        stepNumber: 4,
        instruction: 'Før tampen tilbage igennem overhåndsknuden igen, og derefter igennem den nye store løkke, der opstod.',
      },
      {
        stepNumber: 5,
        instruction: 'Fugt og stram knuden roligt ved at trække i hovedline, tamp og agn på samme tid.',
      },
    ],
    proTip: 'Giver op mod 30% mere livlig gang i vandet på kystagn sammenlignet med en fast knude.',
  },
  {
    id: 'double-uni',
    name: 'Dobbelt Uni-Knob',
    category: 'line-to-line',
    categoryLabel: 'Line-til-line',
    difficulty: 2,
    strengthPercent: 90,
    recommendedLines: ['Fletline', 'Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Hurtig samling af fletline og forfang ved kysten, når det blæser.',
    description: 'Meget nemmere og hurtigere at binde i blæsevejr end FG-knuden. To modstående Uni-knob, der låser mod hinanden.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Læg de to liner parallelt med hinanden med 15 cm overlap i modsat retning.',
      },
      {
        stepNumber: 2,
        instruction: 'Tag den ene tamp og form en Uni-løkke rundt om begge liner. Vikl 5-6 gange igennem løkken, og stram let.',
      },
      {
        stepNumber: 3,
        instruction: 'Gentag samme procedure med den anden tamp i den modsatte ende.',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt begge knuder grundigt, og træk i hovedlinerne, så de to knuder glider mod hinanden og låser.',
      },
      {
        stepNumber: 5,
        instruction: 'Klip begge tamper af med 1 mm margin.',
      },
    ],
    proTip: 'Lav 6 viklinger på den tynde fletline og 4 viklinger på det tykkere fluorocarbon forfang.',
  },
  {
    id: 'perfection-loop',
    name: 'Perfection Loop',
    category: 'loop',
    categoryLabel: 'Løkkeknob',
    difficulty: 2,
    strengthPercent: 93,
    recommendedLines: ['Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Flueforfang (løkke-til-løkke) og gennemløber-forfang.',
    description: 'Klassisk løkke, der ligger 100% i linje med hovedlinen uden at trække til siden.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Lav en løkke i enden af forfanget med tampen liggende bagved hovedlinen.',
      },
      {
        stepNumber: 2,
        instruction: 'Lav en anden mindre løkke foran den første.',
      },
      {
        stepNumber: 3,
        instruction: 'Læg tampen imellem de to løkker.',
      },
      {
        stepNumber: 4,
        instruction: 'Træk den anden løkke igennem den første løkke, fugt og stram til.',
      },
    ],
    proTip: 'Perfekt til hurtigt skift af forfang på kysten med løkke-til-løkke metoden.',
  },
  {
    id: 'blood-knot',
    name: 'Blodknude (Blood Knot)',
    category: 'line-to-line',
    categoryLabel: 'Line-til-line',
    difficulty: 3,
    strengthPercent: 88,
    recommendedLines: ['Nylon / Monofil', 'Fluorocarbon'],
    bestFor: 'Samling af to nylonliner med ens eller tæt tykkelse (f.eks. tapering af flueforfang).',
    description: 'Traditionel, smuk og slank samling af to monofile liner.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Læg to liner parallelt med 10 cm overlap i modsat retning.',
      },
      {
        stepNumber: 2,
        instruction: 'Vikl den ene ende 5 gange rundt om den anden line, og før enden tilbage mellem de to liner.',
      },
      {
        stepNumber: 3,
        instruction: 'Vikl den anden ende 5 gange i modsat retning, og før den tilbage igennem det samme midterhul i modsat retning.',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt og træk forsigtigt i begge liner, så viklingerne presses pænt sammen.',
      },
    ],
    proTip: 'Fungerer bedst når de to liner har næsten samme diameter (maks. 20% forskel).',
  },
  {
    id: 'through-lure-rig',
    name: 'Gennemløber Kyst-Rig',
    category: 'special',
    categoryLabel: 'Special-rigs',
    difficulty: 2,
    strengthPercent: 95,
    recommendedLines: ['Fluorocarbon'],
    bestFor: 'Optimal krogning og C&R på kystblink (f.eks. Line Thru Sandeel, Bornholmerpilen).',
    description: 'Forhindrer havørreden i at bruge blinkets vægt som brækstang under spring. Øger landingsraten med op til 40%.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Før 1-1.5 meter fluorocarbon (0.28-0.33mm) igennem gennemløber-blinket.',
      },
      {
        stepNumber: 2,
        instruction: 'Sæt 1-2 bløde gummiperler på forfanget som støddæmper for knuden.',
      },
      {
        stepNumber: 3,
        instruction: 'Monter en lille oval springring eller en mikro-svirvel med en Grinner-knude.',
      },
      {
        stepNumber: 4,
        instruction: 'Monter en skarp trekrog (str. 8-12) eller enkeltkrog i springringen.',
      },
    ],
    proTip: 'Brug en Owner ST-36 trekrog eller en Gamakatsu enkeltkrog for skånsom genudsætning.',
  },
  {
    id: 'dropper-loop',
    name: 'Dropper Loop (Optræksløkke)',
    category: 'special',
    categoryLabel: 'Special-rigs',
    difficulty: 3,
    strengthPercent: 85,
    recommendedLines: ['Fluorocarbon', 'Nylon / Monofil'],
    bestFor: 'Optræksflue foran blinket (ophænger) eller forfang til fladfisk og sild.',
    description: 'Skaber en stiv, vinkelret løkke midt på forfanget, hvor der kan monteres en ophængerflue uden at forfanget kludrer.',
    steps: [
      {
        stepNumber: 1,
        instruction: 'Dan en stor løkke midt på forfanget, hvor ophængeren skal sidde.',
      },
      {
        stepNumber: 2,
        instruction: 'Vikl de to linestykker rundt om hinanden 5-6 gange, så der opstår en åbning i midten.',
      },
      {
        stepNumber: 3,
        instruction: 'Skub toppen af den store løkke igennem midteråbningen.',
      },
      {
        stepNumber: 4,
        instruction: 'Fugt og træk i de to ender af forfanget, indtil løkken stritter 90 grader ud fra linen.',
      },
    ],
    proTip: 'En lille Kobberbasse eller Pink Gammarus ophænger foran kystblinket fanger ofte de ørreder, der afviser blinket.',
  },
];
