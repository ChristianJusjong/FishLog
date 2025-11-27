import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export interface DeepLinkParams {
  path: string;
  params?: Record<string, string>;
}

/**
 * Parse a deep link URL and extract the path and params
 */
export function parseDeepLink(url: string): DeepLinkParams | null {
  try {
    const parsed = Linking.parse(url);

    if (!parsed.path) {
      return null;
    }

    return {
      path: parsed.path,
      params: parsed.queryParams as Record<string, string> || {},
    };
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}

/**
 * Handle a deep link by navigating to the appropriate screen
 */
export function handleDeepLink(url: string): boolean {
  const parsed = parseDeepLink(url);

  if (!parsed) {
    return false;
  }

  try {
    const { path, params } = parsed;

    // Route mapping for deep links
    // Expo Router will automatically handle routes like:
    // - hook://catch/[id] -> /catch-detail with catchId param
    // - hook://challenge/[id] -> /challenge/[id]
    // - hook://event/[id] -> /event/[id]
    // - hook://group/[id] -> /group/[id]
    // - hook://profile/[id] -> /profile with userId param

    // Extract route segments
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      // Navigate to home/feed
      router.push('/feed');
      return true;
    }

    const [type, id] = segments;

    switch (type) {
      case 'catch':
        if (id) {
          router.push(`/catch-detail?catchId=${id}`);
        }
        return true;

      case 'challenge':
        if (id) {
          router.push(`/challenge/${id}`);
        } else {
          router.push('/challenges');
        }
        return true;

      case 'event':
        if (id) {
          router.push(`/event/${id}`);
        } else {
          router.push('/events');
        }
        return true;

      case 'group':
        if (id) {
          router.push(`/group/${id}`);
        } else {
          router.push('/groups');
        }
        return true;

      case 'profile':
        if (id) {
          router.push(`/profile?userId=${id}`);
        } else {
          router.push('/profile');
        }
        return true;

      case 'feed':
        router.push('/feed');
        return true;

      case 'catches':
        router.push('/catches');
        return true;

      case 'map':
        router.push('/map');
        return true;

      case 'statistics':
        router.push('/statistics');
        return true;

      case 'friends':
        router.push('/friends');
        return true;

      case 'messages':
        router.push('/messages');
        return true;

      case 'settings':
        router.push('/settings');
        return true;

      default:
        console.warn(`Unknown deep link type: ${type}`);
        return false;
    }
  } catch (error) {
    console.error('Error handling deep link:', error);
    return false;
  }
}

/**
 * Initialize deep link listener
 * Returns a cleanup function
 */
export function initDeepLinking(): () => void {
  // Handle initial URL if app was opened via deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleDeepLink(url);
    }
  });

  // Listen for deep links while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    handleDeepLink(event.url);
  });

  // Return cleanup function
  return () => {
    subscription.remove();
  };
}

/**
 * Create a shareable deep link URL
 */
export function createDeepLink(type: string, id?: string, params?: Record<string, string>): string {
  let path = type;
  if (id) {
    path += `/${id}`;
  }

  const url = Linking.createURL(path, params);
  return url;
}

/**
 * Create shareable deep links for different entities
 */
export const deepLinks = {
  catch: (id: string) => createDeepLink('catch', id),
  challenge: (id: string) => createDeepLink('challenge', id),
  event: (id: string) => createDeepLink('event', id),
  group: (id: string) => createDeepLink('group', id),
  profile: (userId: string) => createDeepLink('profile', userId),
  feed: () => createDeepLink('feed'),
  catches: () => createDeepLink('catches'),
  map: () => createDeepLink('map'),
  statistics: () => createDeepLink('statistics'),
};
