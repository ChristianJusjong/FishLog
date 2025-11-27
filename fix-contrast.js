const fs = require('fs');
const path = 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/ai-guide.tsx';

let content = fs.readFileSync(path, 'utf8');

// Fix gearChip contrast - change primaryLight to accent with opacity
content = content.replace(
  /gearChip: \{[\s\S]*?backgroundColor: colors\.primaryLight,/,
  `gearChip: {
      backgroundColor: colors.accent + '20',`
);

// Fix gearChip border color
content = content.replace(
  /borderColor: colors\.primary \+ '30',/,
  `borderColor: colors.accent + '40',`
);

// Fix gearChipText color - change from primary to text for better contrast
content = content.replace(
  /gearChipText: \{[\s\S]*?color: colors\.primary,/,
  `gearChipText: {
      fontSize: 12,
      color: colors.text,`
);

// Fix gearSectionTitle - change from primary to text
content = content.replace(
  /gearSectionTitle: \{[\s\S]*?color: colors\.primary,/,
  `gearSectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,`
);

// Fix locationItemActive background
content = content.replace(
  /locationItemActive: \{[\s\S]*?backgroundColor: colors\.primaryLight,/,
  `locationItemActive: {
      backgroundColor: colors.accent + '20',`
);

// Fix externalMapButton - change primaryLight to surface with accent border
content = content.replace(
  /externalMapButton: \{[\s\S]*?backgroundColor: colors\.primaryLight,/,
  `externalMapButton: {
      backgroundColor: colors.surface,`
);

// Fix weatherIconLarge background
content = content.replace(
  /weatherIconLarge: \{[\s\S]*?backgroundColor: colors\.primaryLight,/,
  `weatherIconLarge: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.accent + '20',`
);

fs.writeFileSync(path, content);
console.log('Fixed contrast issues in ai-guide.tsx');
