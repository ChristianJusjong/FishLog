# 📸 Camera-First Catch Flow Implementation

## Overview
Implement a camera-first catch logging flow where users must take a photo before entering catch data. Photos are locked after upload, but catch data remains editable.

## ✅ Completed

### 1. Database Schema Updates
- ✅ Added `isDraft` boolean field to Catch model (default: true)
- ✅ Made `species` field nullable to allow incomplete catches
- ✅ Added index on `isDraft` for efficient draft queries
- ✅ Created migration: `202511 06_add_draft_catches`

## 🚧 Implementation Plan

### 2. Backend API Endpoints

#### POST /catches/start
```typescript
// Create initial catch with photo and GPS only
{
  photoUrl: string;      // Required - from camera upload
  latitude: number;      // Required - from GPS
  longitude: number;     // Required - from GPS
}
// Returns: { id, photoUrl, latitude, longitude, isDraft: true, createdAt }
```

#### PUT /catches/:id
```typescript
// Update catch data (excluding photo and GPS)
{
  species?: string;
  lengthCm?: number;
  weightKg?: number;
  bait?: string;
  lure?: string;
  rig?: string;
  technique?: string;
  notes?: string;
  visibility?: 'private' | 'friends' | 'public';
}
// Returns: updated catch
// Validation: Cannot update photoUrl, latitude, longitude
```

####PATCH /catches/:id/complete
```typescript
// Mark catch as complete (isDraft = false)
// Validation: species must be filled
// Returns: completed catch
```

#### GET /catches?isDraft=true
```typescript
// Get draft catches for current user
// Returns: array of incomplete catches
```

### 3. Frontend - Camera Capture Screen

**File:** `apps/mobile/app/camera-capture.tsx`

**Flow:**
1. Open camera automatically on mount
2. User takes photo
3. Get GPS coordinates
4. Upload photo to backend
5. Create initial catch with POST /catches/start
6. Navigate to catch form with catch ID

**Features:**
- Lock orientation during capture
- Show loading state during upload
- Handle permission errors
- Disable back button during upload
- Show GPS accuracy indicator

**Dependencies:**
- `expo-camera` for camera access
- `expo-location` for GPS
- `expo-image-picker` as fallback

### 4. Frontend - Catch Form Screen

**File:** `apps/mobile/app/catch-form.tsx`

**Props:**
- `catchId`: string (from camera capture or draft edit)
- `isEdit`: boolean (editing existing draft vs new)

**Features:**
- Show locked photo preview (no edit button)
- Show GPS coordinates (locked, display only)
- Editable fields: species, length, weight, bait, lure, rig, technique, notes, visibility
- Two action buttons:
  - "Gem som kladde" (Save as Draft) - saves without completing
  - "Færdiggør fangst" (Complete Catch) - validates and marks complete
- Auto-save draft every 30 seconds
- Show unsaved changes indicator

**Validation:**
- Species required for completion
- Length/weight must be positive if provided
- Show validation errors inline

### 5. Frontend - Draft Catches Overview

**File:** `apps/mobile/app/drafts.tsx`

**Features:**
- List all incomplete catches (isDraft = true)
- Show photo thumbnail
- Show timestamp and GPS location name
- Show "Ufuldstændig" badge
- Tap to edit in catch form
- Swipe to delete draft
- Sort by newest first

**Empty State:**
- "Ingen kladdefangster"
- "Tag et billede for at starte en ny fangst"

### 6. Frontend - Main Catches Screen Updates

**Update:** `apps/mobile/app/catches.tsx`

**Changes:**
- Filter out draft catches (isDraft = false only)
- Add "Kladder" button in header linking to drafts screen
- Show draft count badge if > 0

### 7. Frontend - Add Catch Button Behavior

**Update:** `apps/mobile/app/add-catch.tsx` or equivalent

**Changes:**
- Replace form-first with camera-first flow
- Button opens camera-capture screen
- Remove old direct form access

## 🔒 Security & Validation Rules

### Backend Validation:
1. **Photo Lock**: Reject any PUT/PATCH that attempts to modify photoUrl
2. **GPS Lock**: Reject any PUT/PATCH that attempts to modify latitude/longitude
3. **Ownership**: Only catch owner can edit
4. **Draft Completion**: Require species to mark as complete
5. **Photo Required**: Cannot create catch without photoUrl

### Frontend Validation:
1. **Camera Permission**: Request on app start, show guide if denied
2. **GPS Permission**: Request before photo, fallback to manual location
3. **Photo Size**: Compress to max 2MB before upload
4. **Network**: Queue uploads if offline, retry when online

## 📱 User Experience Flow

### Happy Path:
1. User taps "Tilføj fangst" button
2. Camera opens automatically
3. User takes photo of fish
4. GPS coordinates captured
5. Photo uploads with progress indicator
6. Form appears with locked photo preview
7. User fills in details
8. User taps "Gem som kladde" to save partial data
9. Later, user opens "Kladder" from menu
10. User taps draft to continue editing
11. User completes form and taps "Færdiggør fangst"
12. Catch appears in main feed and statistics

### Edge Cases:
- **No GPS**: Use last known location or show manual location picker
- **Upload fails**: Save photo locally, retry later, show offline indicator
- **Camera fails**: Offer gallery picker as fallback
- **Back button**: Warn user about losing photo if pressed during upload

## 🧪 Testing Checklist

### Backend Tests:
- [ ] Cannot create catch without photo
- [ ] Cannot update photoUrl after creation
- [ ] Cannot update GPS coords after creation
- [ ] Can update all other fields while draft
- [ ] Cannot complete without species
- [ ] Draft catches excluded from feed by default
- [ ] isDraft query parameter works correctly

### Frontend Tests:
- [ ] Camera opens on add catch
- [ ] Photo upload shows progress
- [ ] GPS coordinates captured automatically
- [ ] Form shows locked photo preview
- [ ] Save as draft works without species
- [ ] Complete catch requires species
- [ ] Draft list shows incomplete catches
- [ ] Draft edit loads existing data
- [ ] Completed catches appear in feed
- [ ] Draft count badge updates

### Integration Tests:
- [ ] Full flow from camera to completed catch
- [ ] Draft save and resume flow
- [ ] Multiple drafts management
- [ ] Offline photo queue and sync

## 📦 Dependencies to Install

```bash
# Mobile dependencies
cd apps/mobile
npm install expo-camera expo-location expo-image-picker
npm install react-query @tanstack/react-query
npm install uuid @types/uuid

# Backend dependencies (already installed)
# - prisma, fastify, multer for file uploads
```

## 🚀 Deployment Steps

1. Run migration on Railway database
2. Deploy backend with new endpoints
3. Build mobile app with camera flow
4. Test on physical device (camera required)
5. Submit to Play Store

## 📝 Notes

- **Photo Storage**: Currently using base64 in photoUrl. Consider moving to cloud storage (Cloudinary, S3) for better performance.
- **GPS Accuracy**: Show accuracy radius on map if low accuracy
- **Offline Support**: Implement service worker for photo queue
- **Performance**: Lazy load drafts list with pagination if > 50 drafts
- **Analytics**: Track draft completion rate, time to complete

## 🔄 Migration from Old Flow

For existing users with catches created via old form-first flow:
- All existing catches automatically get `isDraft = false`
- No photo = no migration needed, they'll use new camera flow going forward
- Existing catches with photos remain editable (except photo/GPS)

---

**Status**: Schema updated, awaiting backend endpoint implementation
**Next Step**: Implement POST /catches/start endpoint
