import { prisma } from "../lib/prisma";
import { FastifyInstance } from 'fastify';

export async function debugRoutes(fastify: FastifyInstance) {
    fastify.addHook('onRequest', async (request, reply) => {
        if (process.env.NODE_ENV === 'production') {
            return reply.code(403).send({ error: 'Debug routes disabled in production' });
        }
    });

    // Debug endpoint for testing Prisma queries
    fastify.get('/debug/catch-test', async (request, reply) => {
        try {
            // Test 1: Simple count
            const count = await prisma.catch.count();

            // Test 2: FindMany without include
            const catchesSimple = await prisma.catch.findMany({
                take: 1,
                select: { id: true, species: true, userId: true }
            });

            // Test 3: FindMany with include
            let catchesWithUser = null;
            let includeError = null;
            try {
                catchesWithUser = await prisma.catch.findMany({
                    take: 1,
                    include: {
                        user: {
                            select: { id: true, name: true, avatar: true }
                        }
                    }
                });
            } catch (e) {
                includeError = e instanceof Error ? e.message : String(e);
            }

            // Test 4: Check User model
            const userCount = await prisma.user.count();

            return {
                success: true,
                tests: {
                    catchCount: count,
                    simpleQuery: catchesSimple,
                    withUserInclude: catchesWithUser,
                    includeError,
                    userCount
                }
            };
        } catch (error) {
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });

    // Debug endpoint for database table verification
    fastify.get('/debug/database-tables', async (request, reply) => {
        try {
            // Get all table names from PostgreSQL
            const tablesResult = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `;
            const existingTables = tablesResult.map((t: any) => t.tablename);

            // Expected tables from Prisma schema (67 tables)
            const expectedTables = [
                'locations', 'users', 'catches', 'fish', 'friendships', 'blocked_users', 'muted_users',
                'content_reports', 'likes', 'comments', 'events', 'contests', 'event_participants',
                'badges', 'user_badges', 'catch_validation', 'clubs', 'club_members', 'club_messages',
                'groups', 'group_memberships', 'group_posts', 'group_post_likes', 'group_post_comments',
                'group_messages', 'favorite_spots', 'trips', 'trip_participants', 'gear', 'species',
                'fiskedex_entries', 'fishing_licenses', 'challenges', 'challenge_participants',
                'challenge_comments', 'challenge_templates', 'streaks', 'notifications', 'push_tokens',
                'messages', 'conversations', 'conversation_participants', 'conversation_messages',
                'personal_bests', 'weather_data', 'albums', 'album_photos', 'fishing_sessions',
                'session_kudos', 'session_comments', 'segments', 'segment_efforts', 'local_legends',
                'segment_leaderboards', 'catch_kudos', 'user_goals', 'tide_data', 'water_temperatures',
                'fishing_regulations', 'bait_effectiveness', 'conservation_scores', 'premium_subscriptions',
                'native_ads', 'ad_impressions', 'ad_clicks', 'ad_conversions', 'sponsored_spots',
                '_prisma_migrations'
            ];

            // Check which tables exist
            const tableStatus: Record<string, boolean> = {};
            const missingTables: string[] = [];
            const extraTables: string[] = [];

            for (const table of expectedTables) {
                const exists = existingTables.includes(table);
                tableStatus[table] = exists;
                if (!exists && table !== '_prisma_migrations') {
                    missingTables.push(table);
                }
            }

            for (const table of existingTables) {
                if (!expectedTables.includes(table) && !table.startsWith('_')) {
                    extraTables.push(table);
                }
            }

            // Count rows in key tables
            const tableCounts: Record<string, number> = {};
            try {
                tableCounts.users = await prisma.user.count();
                tableCounts.catches = await prisma.catch.count();
                tableCounts.species = await prisma.species.count();
                tableCounts.badges = await prisma.badge.count();
                tableCounts.challenges = await prisma.challenge.count();
                tableCounts.events = await prisma.event.count();
                tableCounts.notifications = await prisma.notification.count();
                tableCounts.segments = await prisma.segment.count();
            } catch (e) {
                // Some counts might fail if tables don't exist
            }

            return {
                success: true,
                summary: {
                    expected: expectedTables.length - 1, // Exclude _prisma_migrations
                    found: existingTables.filter((t: string) => !t.startsWith('_')).length,
                    missing: missingTables.length,
                    extra: extraTables.length,
                    percentComplete: ((expectedTables.length - 1 - missingTables.length) / (expectedTables.length - 1) * 100).toFixed(1) + '%'
                },
                tables: existingTables.filter((t: string) => !t.startsWith('_')),
                missingTables,
                extraTables,
                tableStatus,
                tableCounts,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return reply.code(500).send({
                success: false,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
        }
    });

}
