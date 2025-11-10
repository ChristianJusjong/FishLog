/**
 * Shared type definitions for FishLog application
 * These types match the Prisma schema on the backend
 */

/**
 * User model
 */
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  provider?: string | null;
  providerId?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Catch model
 */
export interface Catch {
  id: string;
  userId: string;
  user?: User;
  species?: string | null;
  lengthCm?: number | null;
  weightKg?: number | null;
  bait?: string | null;
  lure?: string | null;
  rig?: string | null;
  technique?: string | null;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  photoHash?: string | null;
  exifData?: string | null;
  isDraft: boolean;
  visibility: VisibilityType;
  createdAt: Date | string;
  updatedAt: Date | string;
  likes?: Like[];
  comments?: Comment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

/**
 * Event model
 */
export interface Event {
  id: string;
  ownerId: string;
  owner?: User;
  title: string;
  description?: string | null;
  startAt: Date | string;
  endAt: Date | string;
  venue?: string | null;
  fishingArea?: string | null;
  visibility: VisibilityType;
  createdAt: Date | string;
  updatedAt: Date | string;
  contests?: Contest[];
  participants?: EventParticipant[];
  _count?: {
    participants: number;
  };
  isParticipating?: boolean;
  participantCount?: number;
}

/**
 * Contest model
 */
export interface Contest {
  id: string;
  eventId: string;
  rule: ContestRule;
  speciesFilter?: string | null;
  createdAt: Date | string;
}

/**
 * Event Participant model
 */
export interface EventParticipant {
  id: string;
  eventId: string;
  userId: string;
  user?: User;
  joinedAt: Date | string;
}

/**
 * Like model
 */
export interface Like {
  id: string;
  userId: string;
  catchId: string;
  user?: User;
  createdAt: Date | string;
}

/**
 * Comment model
 */
export interface Comment {
  id: string;
  userId: string;
  catchId: string;
  text: string;
  user?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Friendship model
 */
export interface Friendship {
  id: string;
  requesterId: string;
  accepterId: string;
  status: FriendshipStatus;
  requester?: User;
  accepter?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Badge model
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  createdAt: Date | string;
}

/**
 * User Badge model
 */
export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge?: Badge;
  earnedAt: Date | string;
}

/**
 * Group model
 */
export interface Group {
  id: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  isPrivate: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  members?: GroupMembership[];
  posts?: GroupPost[];
  messages?: GroupMessage[];
  _count?: {
    members: number;
    posts: number;
    messages?: number;
  };
}

/**
 * Group Membership model
 */
export interface GroupMembership {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  user?: User;
  joinedAt: Date | string;
}

/**
 * Group Post model
 */
export interface GroupPost {
  id: string;
  groupId: string;
  userId: string;
  catchId?: string | null;
  text?: string | null;
  user?: User;
  catch?: Catch;
  createdAt: Date | string;
  updatedAt: Date | string;
  likes?: GroupPostLike[];
  comments?: GroupPostComment[];
  _count?: {
    likes: number;
    comments: number;
  };
}

/**
 * Group Post Like model
 */
export interface GroupPostLike {
  id: string;
  postId: string;
  userId: string;
  user?: User;
  createdAt: Date | string;
}

/**
 * Group Post Comment model
 */
export interface GroupPostComment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  user?: User;
  createdAt: Date | string;
}

/**
 * Group Message model
 */
export interface GroupMessage {
  id: string;
  groupId: string;
  senderId: string;
  message?: string | null;
  imageUrl?: string | null;
  catchId?: string | null;
  sender?: User;
  catch?: Catch;
  createdAt: Date | string;
}

/**
 * Feed Catch (extended Catch for feed display with social features)
 */
export interface FeedCatch {
  id: string;
  species: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  photoUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  user: User;
  likesCount: number;
  commentsCount: number;
  isLikedByMe: boolean;
  comments: Comment[];
}

/**
 * Feed Event (extended Event for feed display with participation status)
 */
export interface FeedEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  venue?: string;
  owner: {
    id: string;
    name: string;
  };
  isParticipating: boolean;
  participantCount: number;
  createdAt?: string;
}

/**
 * Feed Item (union type for feed display)
 */
export interface FeedItem {
  id: string;
  type: 'catch' | 'event';
  user?: User;
  catch?: Catch;
  event?: Event;
  createdAt: Date | string;
}

/**
 * Feed Item Discriminated Union (for type-safe feed rendering)
 */
export type FeedItemUnion =
  | { type: 'catch'; data: FeedCatch }
  | { type: 'event'; data: FeedEvent };

/**
 * Type unions and enums
 */
export type VisibilityType = 'private' | 'friends' | 'public';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected';
export type GroupRole = 'admin' | 'member';
export type ContestRule =
  | 'biggestSingle'
  | 'biggestTotal'
  | 'mostCatches'
  | 'longestFish'
  | 'mostSpecies'
  | 'biggestAverage';

/**
 * Fish species constants
 */
export const FISH_SPECIES = [
  'pike',
  'perch',
  'zander',
  'trout',
  'carp',
  'bream',
  'roach',
  'tench',
  'eel',
  'cod',
  'mackerel',
  'seaTrout',
  'flounder',
  'seaBass',
  'pollock',
  'herring',
  'garfish',
] as const;

export type FishSpecies = (typeof FISH_SPECIES)[number];

/**
 * Weather data
 */
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  conditions: string;
  icon?: string;
}

/**
 * Location data
 */
export interface LocationData {
  latitude: number;
  longitude: number;
  name?: string;
  description?: string;
}

/**
 * EXIF data structure
 */
export interface ExifData {
  timestamp?: string;
  latitude?: number;
  longitude?: number;
  deviceModel?: string;
  [key: string]: any;
}
