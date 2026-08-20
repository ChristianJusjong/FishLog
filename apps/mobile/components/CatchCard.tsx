import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedCatch, useToggleLike, useAddComment } from '../hooks/useCatches';

interface CatchCardProps {
    catchItem: FeedCatch;
    colors: any;
    styles: any;
}

const LOCATION_CACHE_KEY = '@location_cache';

export default function CatchCard({ catchItem, colors, styles }: CatchCardProps) {
    const router = useRouter();
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [locationName, setLocationName] = useState<string | null>(null);

    const toggleLikeMutation = useToggleLike();
    const addCommentMutation = useAddComment();

    useEffect(() => {
        if (!catchItem.latitude || !catchItem.longitude) return;

        const fetchLocation = async () => {
            const lat = catchItem.latitude!;
            const lng = catchItem.longitude!;
            const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;

            try {
                const cachedData = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (parsed[key]) {
                        setLocationName(parsed[key]);
                        return;
                    }
                }

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=da`,
                    { headers: { 'User-Agent': 'FishLog App' } }
                );

                if (response.ok) {
                    const data = await response.json();
                    const address = data.address;
                    const city = address.city || address.town || address.village || address.municipality;
                    const country = address.country;

                    let locName = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    if (city && country) {
                        locName = `${city}, ${country}`;
                    } else if (city) {
                        locName = city;
                    } else if (country) {
                        locName = country;
                    }

                    setLocationName(locName);

                    const cache = cachedData ? JSON.parse(cachedData) : {};
                    cache[key] = locName;
                    await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cache));
                }
            } catch (error) {
                console.error('Failed to get location name:', error);
            }
        };

        fetchLocation();
    }, [catchItem.latitude, catchItem.longitude]);

    const handleToggleLike = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
        toggleLikeMutation.mutate({ catchId: catchItem.id, isLikedByMe: catchItem.isLikedByMe });
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;
        addCommentMutation.mutate({ catchId: catchItem.id, text: commentText.trim() }, {
            onSuccess: () => setCommentText('')
        });
    };

    const lastTapRef = useRef<number>(0);
    const heartScale = useRef(new Animated.Value(0)).current;
    const heartOpacity = useRef(new Animated.Value(0)).current;

    const handlePhotoDoubleTap = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
            // Trigger Hug if not already hugged
            if (!catchItem.isLikedByMe) {
                toggleLikeMutation.mutate({ catchId: catchItem.id, isLikedByMe: false });
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

            // Animate floating spark
            heartScale.setValue(0.5);
            heartOpacity.setValue(1);
            Animated.parallel([
                Animated.spring(heartScale, {
                    toValue: 1.5,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.timing(heartOpacity, {
                    toValue: 0,
                    duration: 700,
                    delay: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            lastTapRef.current = now;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.catchCard, { backgroundColor: colors.surface }]}
            onPress={() => router.push(`/catch-detail?id=${catchItem.id}`)}
            activeOpacity={0.95}
        >
            <View style={styles.userHeader}>
                <TouchableOpacity
                    style={styles.userInfo}
                    onPress={() => router.push(`/user-profile?userId=${catchItem.user.id}`)}
                    activeOpacity={0.7}
                >
                    {catchItem.user.avatar ? (
                        <Image source={{ uri: catchItem.user.avatar }} style={styles.userAvatar} contentFit="cover" cachePolicy="memory-disk" />
                    ) : (
                        <View style={[styles.userAvatarPlaceholder, { backgroundColor: colors.primaryLight + '20' }]}>
                            <Ionicons name="person" size={20} color={colors.primary} />
                        </View>
                    )}
                    <Text style={[styles.userName, { color: colors.text }]}>{catchItem.user.name}</Text>
                </TouchableOpacity>
                <Text style={[styles.catchDate, { color: colors.textSecondary }]}>
                    {new Date(catchItem.createdAt).toLocaleDateString('da-DK')}
                </Text>
            </View>

            {catchItem.photoUrl && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={handlePhotoDoubleTap}
                    style={{ position: 'relative' }}
                >
                    <Image
                        source={{ uri: catchItem.photoUrl }}
                        style={[styles.catchImage, { backgroundColor: colors.backgroundLight }]}
                        contentFit="contain"
                        cachePolicy="memory-disk"
                        transition={200}
                    />
                    <Animated.View
                        pointerEvents="none"
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            marginLeft: -35,
                            marginTop: -35,
                            transform: [{ scale: heartScale }],
                            opacity: heartOpacity,
                            shadowColor: '#F5A623',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 10,
                            elevation: 8,
                        }}
                    >
                        <Ionicons name="heart" size={70} color="#F5A623" />
                    </Animated.View>
                </TouchableOpacity>
            )}

            <View style={styles.catchContent}>
                <Text style={[styles.catchSpecies, { color: colors.text }]}>{catchItem.species}</Text>

                <View style={styles.catchDetails}>
                    {catchItem.lengthCm && (
                        <View style={[styles.catchDetailBadge, { backgroundColor: 'rgba(0, 212, 178, 0.12)', borderColor: 'rgba(0, 212, 178, 0.3)', borderWidth: 1 }]}>
                            <Ionicons name="resize-outline" size={14} color="#00D4B2" />
                            <Text style={[styles.catchDetailText, { color: '#00D4B2', fontWeight: '800' }]}>{catchItem.lengthCm} cm</Text>
                        </View>
                    )}
                    {catchItem.weightKg && (
                        <View style={[styles.catchDetailBadge, { backgroundColor: 'rgba(245, 166, 35, 0.12)', borderColor: 'rgba(245, 166, 35, 0.3)', borderWidth: 1 }]}>
                            <Ionicons name="scale-outline" size={14} color="#F5A623" />
                            <Text style={[styles.catchDetailText, { color: '#F5A623', fontWeight: '800' }]}>
                                {catchItem.weightKg >= 1 ? `${catchItem.weightKg} kg` : `${Math.round(catchItem.weightKg * 1000)} g`}
                            </Text>
                        </View>
                    )}
                    {catchItem.released && (
                        <View style={[styles.catchDetailBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.3)', borderWidth: 1 }]}>
                            <Ionicons name="leaf-outline" size={14} color="#10B981" />
                            <Text style={[styles.catchDetailText, { color: '#10B981', fontWeight: '800' }]}>C&R</Text>
                        </View>
                    )}
                </View>

                {catchItem.bait && (
                    <View style={styles.catchInfoRow}>
                        <Ionicons name="bug-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>Agn: {catchItem.bait}</Text>
                    </View>
                )}
                {catchItem.technique && (
                    <View style={styles.catchInfoRow}>
                        <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>Teknik: {catchItem.technique}</Text>
                    </View>
                )}
                {catchItem.notes && (
                    <Text style={[styles.catchNotes, { color: colors.text, backgroundColor: colors.backgroundLight }]}>{catchItem.notes}</Text>
                )}
                {catchItem.latitude && catchItem.longitude && (
                    <View style={styles.catchInfoRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.catchInfo, { color: colors.textSecondary }]}>
                            {locationName || 'Henter sted...'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        {
                            backgroundColor: catchItem.isLikedByMe ? 'rgba(245, 166, 35, 0.15)' : colors.backgroundLight,
                            borderColor: catchItem.isLikedByMe ? '#F5A623' : 'transparent',
                            borderWidth: catchItem.isLikedByMe ? 1 : 0,
                        }
                    ]}
                    onPress={handleToggleLike}
                    accessible={true}
                    accessibilityLabel={catchItem.isLikedByMe ? `Fjern hug. ${catchItem.likesCount} hug` : `Giv hug! ${catchItem.likesCount} hug`}
                    accessibilityRole="button"
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name={catchItem.isLikedByMe ? "flash" : "flash-outline"}
                        size={18}
                        color={catchItem.isLikedByMe ? "#F5A623" : colors.iconDefault}
                    />
                    <Text style={[styles.actionText, { color: catchItem.isLikedByMe ? '#F5A623' : colors.textSecondary, fontWeight: catchItem.isLikedByMe ? '800' : '600' }]}>
                        {catchItem.likesCount > 0 ? `${catchItem.likesCount} Hug` : 'Giv Hug ⚡'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.backgroundLight }]}
                    onPress={() => setShowComments(!showComments)}
                    accessible={true}
                    accessibilityLabel={`Vis kommentarer. ${catchItem.commentsCount} kommentarer`}
                    accessibilityRole="button"
                >
                    <Ionicons
                        name={showComments ? "chatbubble" : "chatbubble-outline"}
                        size={22}
                        color={showComments ? colors.accent : colors.iconDefault}
                    />
                    <Text style={[styles.actionText, { color: showComments ? colors.text : colors.textSecondary }]}>
                        {catchItem.commentsCount}
                    </Text>
                </TouchableOpacity>
            </View>

            {showComments && (
                <View style={[styles.commentsSection, { backgroundColor: colors.backgroundLight }]}>
                    {catchItem.comments?.map((comment: any) => (
                        <View key={comment.id} style={[styles.comment, { backgroundColor: colors.surface }]}>
                            <TouchableOpacity onPress={() => router.push(`/user-profile?userId=${comment.userId}`)}>
                                <Text style={[styles.commentUser, { color: colors.text }]}>{comment.user.name}</Text>
                            </TouchableOpacity>
                            <Text style={[styles.commentText, { color: colors.text }]}>{comment.text}</Text>
                            <Text style={[styles.commentDate, { color: colors.textTertiary }]}>
                                {new Date(comment.createdAt).toLocaleDateString('da-DK')}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.addCommentContainer}>
                        <TextInput
                            style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.text }]}
                            placeholder="Skriv en kommentar..."
                            placeholderTextColor={colors.textTertiary}
                            value={commentText}
                            onChangeText={setCommentText}
                            multiline
                            accessible={true}
                            accessibilityLabel="Kommentar felt"
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, { backgroundColor: colors.accent }]}
                            onPress={handleAddComment}
                            disabled={addCommentMutation.isPending}
                            accessible={true}
                            accessibilityLabel="Send kommentar"
                            accessibilityRole="button"
                        >
                            <Text style={[styles.sendButtonText, { color: colors.textInverse }]}>
                                {addCommentMutation.isPending ? '...' : 'Send'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}
