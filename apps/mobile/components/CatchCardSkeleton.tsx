import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { RADIUS, SPACING } from '@/constants/branding';

export default function CatchCardSkeleton() {
    const { colors } = useTheme();

    // Custom animation value
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    const skeletonColor = colors.backgroundLight;

    return (
        <View style={[styles.catchCard, { backgroundColor: colors.surface }]}>
            {/* User Header Skeleton */}
            <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                    <Animated.View style={[styles.avatar, { backgroundColor: skeletonColor, opacity }]} />
                    <Animated.View style={[styles.nameText, { backgroundColor: skeletonColor, opacity }]} />
                </View>
                <Animated.View style={[styles.dateText, { backgroundColor: skeletonColor, opacity }]} />
            </View>

            {/* Image Skeleton */}
            <Animated.View style={[styles.catchImage, { backgroundColor: skeletonColor, opacity }]} />

            {/* Content Skeleton */}
            <View style={styles.catchContent}>
                <Animated.View style={[styles.titleText, { backgroundColor: skeletonColor, opacity }]} />

                <View style={styles.badgesContainer}>
                    <Animated.View style={[styles.badge, { backgroundColor: skeletonColor, opacity }]} />
                    <Animated.View style={[styles.badge, { backgroundColor: skeletonColor, opacity }]} />
                </View>

                <View style={styles.rowsContainer}>
                    <Animated.View style={[styles.infoRow, { backgroundColor: skeletonColor, opacity }]} />
                    <Animated.View style={[styles.infoRow, { backgroundColor: skeletonColor, opacity }]} />
                </View>
            </View>

            {/* Actions Skeleton */}
            <View style={styles.actions}>
                <Animated.View style={[styles.actionButton, { backgroundColor: skeletonColor, opacity }]} />
                <Animated.View style={[styles.actionButton, { backgroundColor: skeletonColor, opacity }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    catchCard: {
        borderRadius: RADIUS.xl,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 2,
        overflow: 'hidden',
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: SPACING.sm,
    },
    nameText: {
        width: 120,
        height: 16,
        borderRadius: RADIUS.sm,
    },
    dateText: {
        width: 80,
        height: 14,
        borderRadius: RADIUS.sm,
    },
    catchImage: {
        width: '100%',
        height: 300,
    },
    catchContent: {
        padding: SPACING.md,
    },
    titleText: {
        width: 150,
        height: 24,
        borderRadius: RADIUS.sm,
        marginBottom: SPACING.md,
    },
    badgesContainer: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.md,
    },
    badge: {
        width: 80,
        height: 30,
        borderRadius: RADIUS.full,
    },
    rowsContainer: {
        gap: SPACING.sm,
    },
    infoRow: {
        width: 200,
        height: 16,
        borderRadius: RADIUS.sm,
    },
    actions: {
        flexDirection: 'row',
        padding: SPACING.md,
        paddingTop: 0,
        gap: SPACING.lg,
    },
    actionButton: {
        width: 64,
        height: 44,
        borderRadius: RADIUS.full,
    },
});
