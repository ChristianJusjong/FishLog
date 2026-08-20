import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fastify } from '../../src/index';

describe('Auth API endpoints', () => {

    beforeAll(async () => {
        await fastify.ready();
    });

    afterAll(async () => {
        await fastify.close();
    });

    it('should reject login without credentials', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/auth/login',
            payload: {}
        });

        expect(response.statusCode).toBe(400);
    });

    it('should reject register without name', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/auth/signup',
            payload: {
                email: 'test@example.com',
                password: 'password123'
            }
        });

        expect(response.statusCode).toBe(400);
    });

    it('should authenticate user with valid Apple Native token payload', async () => {
        // Create valid mock base64 encoded JWT with sub and email
        const header = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-kid' })).toString('base64');
        const uniqueSub = `apple_test_sub_${Date.now()}`;
        const testEmail = `apple_${Date.now()}@example.com`;
        const payload = Buffer.from(JSON.stringify({
            iss: 'https://appleid.apple.com',
            sub: uniqueSub,
            email: testEmail,
            email_verified: 'true',
        })).toString('base64');
        const signature = Buffer.from('mock_signature').toString('base64');
        const mockIdentityToken = `${header}.${payload}.${signature}`;

        const response = await fastify.inject({
            method: 'POST',
            url: '/auth/apple/native',
            payload: {
                identityToken: mockIdentityToken,
                user: {
                    name: { firstName: 'Apple', lastName: 'Tester' },
                    email: testEmail,
                },
            },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.payload);
        expect(body).toHaveProperty('accessToken');
        expect(body).toHaveProperty('refreshToken');
        expect(body.user.email).toBe(testEmail);
        expect(body.user.provider).toBe('apple');
    });

    it('should require authorization code on /auth/exchange', async () => {
        const response = await fastify.inject({
            method: 'POST',
            url: '/auth/exchange',
            payload: {},
        });

        expect(response.statusCode).toBe(400);
    });
});
