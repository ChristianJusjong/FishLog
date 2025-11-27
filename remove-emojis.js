const fs = require('fs');

// Files to process and their emoji replacements
const replacements = [
  // DrawerMenu.tsx - remove emojis from section titles
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/components/DrawerMenu.tsx',
    changes: [
      { from: "'🗺️ NAVIGATION'", to: "'NAVIGATION'" },
      { from: "'🎯 UDFORDRINGER'", to: "'UDFORDRINGER'" },
      { from: "'👥 SOCIALT'", to: "'SOCIALT'" },
      { from: "'📊 ANALYSE'", to: "'ANALYSE'" },
      { from: "'📚 MIN FISKEBOG'", to: "'MIN FISKEBOG'" },
    ]
  },
  // AIRecommendations.tsx - replace emojis with text only
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/components/AIRecommendations.tsx',
    changes: [
      { from: '🤖 Få AI-Råd', to: 'Få AI-Råd' },
      { from: '🤖 AI Anbefalinger', to: 'AI Anbefalinger' },
      { from: '🎣 Anbefalet Agn', to: 'Anbefalet Agn' },
      { from: '🎯 Anbefalet Wobblers', to: 'Anbefalet Wobblers' },
      { from: '⚡ Teknikker', to: 'Teknikker' },
      { from: '🌤️ Vejr & Sæson', to: 'Vejr & Sæson' },
    ]
  },
  // LevelUpModal.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/components/LevelUpModal.tsx',
    changes: [
      { from: '🎉 LEVEL UP! 🎉', to: 'LEVEL UP!' },
      { from: '🎁 Belønninger:', to: 'Belønninger:' },
    ]
  },
  // camera-capture.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/camera-capture.tsx',
    changes: [
      { from: '📸 Tag billede af fangst', to: 'Tag billede af fangst' },
      { from: '🎣 Åbn kamera', to: 'Åbn kamera' },
      { from: '📍 Vigtigt:', to: 'Vigtigt:' },
    ]
  },
  // catch-form.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/catch-form.tsx',
    changes: [
      { from: '🤖 AI Genkendelse', to: 'AI Genkendelse' },
      { from: '🎉 Fangst færdiggjort!', to: 'Fangst gemt!' },
    ]
  },
  // contest/[id]/validate.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/contest/[id]/validate.tsx',
    changes: [
      { from: '📊 Metadata', to: 'Metadata' },
      { from: '📍 GPS:', to: 'GPS:' },
    ]
  },
  // drafts.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/drafts.tsx',
    changes: [
      { from: '📍', to: '' },
    ]
  },
  // event/[id].tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/event/[id].tsx',
    changes: [
      { from: '📍 Sted:', to: 'Sted:' },
      { from: '👥', to: '' },
    ]
  },
  // hot-spots.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/hot-spots.tsx',
    changes: [
      { from: '📍 Kendte Fiskepladser i Nærheden', to: 'Kendte Fiskepladser i Nærheden' },
    ]
  },
  // map.tsx
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/app/map.tsx',
    changes: [
      { from: '📍 **Nærmeste fiskeplads:**', to: 'Nærmeste fiskeplads:' },
      { from: '📍', to: '' },
    ]
  },
  // socialShare.ts
  {
    file: 'C:/ClaudeCodeProject/FishLog/apps/mobile/lib/socialShare.ts',
    changes: [
      { from: '🎣 Fangede en', to: 'Fangede en' },
      { from: '📍 ${location}', to: '${location}' },
    ]
  },
];

let totalChanges = 0;

for (const fileConfig of replacements) {
  try {
    if (!fs.existsSync(fileConfig.file)) {
      console.log(`File not found: ${fileConfig.file}`);
      continue;
    }
    
    let content = fs.readFileSync(fileConfig.file, 'utf8');
    let fileChanges = 0;
    
    for (const change of fileConfig.changes) {
      const originalContent = content;
      content = content.split(change.from).join(change.to);
      if (content !== originalContent) {
        fileChanges++;
      }
    }
    
    if (fileChanges > 0) {
      fs.writeFileSync(fileConfig.file, content);
      console.log(`Updated ${fileConfig.file} (${fileChanges} changes)`);
      totalChanges += fileChanges;
    } else {
      console.log(`No changes needed: ${fileConfig.file}`);
    }
  } catch (err) {
    console.log(`Error processing ${fileConfig.file}: ${err.message}`);
  }
}

console.log(`\nTotal changes: ${totalChanges}`);
