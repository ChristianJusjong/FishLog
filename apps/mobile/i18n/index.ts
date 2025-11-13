// Danish translations
const translations: Record<string, string> = {
  // Navigation
  'navigation.feed': 'Feed',
  'navigation.catches': 'Fangster',
  'navigation.map': 'Kort',
  'navigation.events': 'Events',
  'navigation.profile': 'Profil',

  // Auth
  'auth.login': 'Log ind',
  'auth.signup': 'Opret konto',
  'auth.email': 'Email',
  'auth.password': 'Adgangskode',
  'auth.name': 'Navn',
  'auth.logOut': 'Log ud',

  // Profile
  'profile.catches': 'Fangster',
  'profile.friends': 'Venner',
  'profile.groups': 'Grupper',
  'profile.editProfile': 'Rediger Profil',
  'profile.settings': 'Indstillinger',
  'profile.appSettings': 'App Indstillinger',
  'profile.themeLanguageEtc': 'Tema, sprog, mm.',
  'profile.notifications': 'Notifikationer',
  'profile.enabled': 'Aktiveret',
  'profile.visibility': 'Synlighed',
  'profile.private': 'Privat',
  'profile.loginMethod': 'Login metode',
  'profile.version': 'Version',

  // Catches
  'catches.addCatch': 'Tilføj Fangst',
  'catches.noCatches': 'Ingen fangster endnu',
  'catches.species': 'Art',
  'catches.length': 'Længde',
  'catches.weight': 'Vægt',
  'catches.bait': 'Agn',
  'catches.rig': 'Forfang',
  'catches.technique': 'Teknik',
  'catches.notes': 'Noter',
  'catches.location': 'Placering',
  'catches.visibility': 'Synlighed',
  'catches.public': 'Offentlig',
  'catches.friends': 'Venner',
  'catches.private': 'Privat',

  // Feed
  'feed.title': 'Feed',
  'feed.noFeed': 'Ingen opslag endnu',

  // Map
  'map.title': 'Kort',
  'map.heatmap': 'Heatmap',
  'map.mySpots': 'Mine Spots',

  // Events
  'events.title': 'Events',
  'events.noEvents': 'Ingen events endnu',
  'events.createEvent': 'Opret Event',

  // Friends
  'friends.title': 'Venner',
  'friends.noFriends': 'Ingen venner endnu',
  'friends.addFriend': 'Tilføj Ven',

  // Groups
  'groups.title': 'Grupper',
  'groups.noGroups': 'Ingen grupper endnu',
  'groups.createGroup': 'Opret Gruppe',

  // Settings
  'settings.title': 'Indstillinger',
  'settings.theme': 'Tema',
  'settings.language': 'Sprog',
  'settings.groqApiKey': 'Groq API Key',
  'settings.groqApiKeyPlaceholder': 'Indtast din Groq API key...',
  'settings.saveApiKey': 'Gem API Key',
  'settings.apiKeySaved': 'API key gemt!',
  'settings.apiKeyError': 'Kunne ikke gemme API key',

  // Common
  'common.save': 'Gem',
  'common.cancel': 'Annuller',
  'common.delete': 'Slet',
  'common.edit': 'Rediger',
  'common.loading': 'Indlæser...',
  'common.error': 'Fejl',
  'common.success': 'Succes',
};

export const t = (key: string): string => {
  return translations[key] || key;
};

export const i18n = {
  t,
  locale: 'da',
};

export default i18n;
