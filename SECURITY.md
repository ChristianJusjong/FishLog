# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### Do NOT:
- Open a public GitHub issue
- Discuss the vulnerability publicly until it's been addressed

### Do:
1. **Email**: Send details to security@fishlog.app (or create a private security advisory on GitHub)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)
3. **Response Time**: We aim to respond within 48 hours

## Security Measures

### Automated Security Scanning

This project uses multiple layers of automated security scanning:

1. **Dependency Scanning**
   - Dependabot (weekly updates)
   - npm audit (on every commit)
   - Snyk (continuous monitoring)
   - OWASP Dependency Check

2. **Code Analysis**
   - CodeQL (JavaScript/TypeScript)
   - Semgrep (security patterns)
   - ESLint security rules

3. **Container Security**
   - Trivy (vulnerability scanning)
   - Docker image scanning

4. **Secret Detection**
   - Gitleaks (prevents secret commits)
   - GitHub secret scanning

### Security Best Practices

#### Authentication & Authorization
- JWT tokens with secure expiration
- Password hashing with bcrypt
- OAuth2 integration support
- Session management best practices

#### API Security
- CORS configuration
- Rate limiting (recommended to implement)
- Input validation
- SQL injection prevention (Prisma ORM)

#### Data Security
- Database connection encryption
- Environment variable protection
- Sensitive data encryption at rest

#### Container Security
- Non-root user in Docker containers
- Minimal base images (Alpine)
- Regular security updates
- Health checks implemented

## Security Checklist for Contributors

Before submitting a PR, ensure:

- [ ] No hardcoded credentials or secrets
- [ ] Input validation for all user inputs
- [ ] Proper error handling (no sensitive info in errors)
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection (where applicable)
- [ ] Authentication/authorization checks
- [ ] Secure dependencies (run `npm audit`)
- [ ] Environment variables for sensitive config
- [ ] No debug/console.log with sensitive data

## Known Security Considerations

### Current Implementation Status

✅ **Implemented:**
- JWT authentication
- Password hashing
- CORS protection
- Prisma ORM (SQL injection prevention)
- Docker security hardening
- Automated dependency updates
- Security scanning in CI/CD

⚠️ **Recommended Additions:**
- Rate limiting
- API request throttling
- Brute force protection
- Security headers middleware
- Content Security Policy
- HTTPS enforcement
- Database encryption at rest
- Audit logging
- Intrusion detection

## Security Headers

Recommended security headers for production:

```javascript
// Add to Fastify server
fastify.addHook('onSend', (request, reply, payload, done) => {
  reply.header('X-Content-Type-Options', 'nosniff');
  reply.header('X-Frame-Options', 'DENY');
  reply.header('X-XSS-Protection', '1; mode=block');
  reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  reply.header('Content-Security-Policy', "default-src 'self'");
  reply.header('Referrer-Policy', 'no-referrer');
  done();
});
```

## Environment Variables Security

### Development
- Use `.env` files (in `.gitignore`)
- Never commit `.env` files
- Use example files (`.env.example`)

### Production
- Use environment-specific secrets
- GitHub Secrets for CI/CD
- Server environment variables
- Secret management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Database Security

### Connection Security
- Use SSL/TLS for database connections
- Restrict database access by IP
- Use strong passwords
- Regular password rotation

### Query Security
- Use Prisma ORM (prevents SQL injection)
- Validate all inputs
- Limit query results
- Implement query timeouts

## Incident Response

If a security incident occurs:

1. **Immediate Actions**
   - Contain the threat
   - Assess the damage
   - Preserve evidence

2. **Communication**
   - Notify security team
   - Inform affected users (if applicable)
   - Document timeline

3. **Resolution**
   - Apply fixes
   - Deploy patches
   - Update security measures

4. **Post-Incident**
   - Conduct review
   - Update procedures
   - Improve security measures

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Fastify Security](https://www.fastify.io/docs/latest/Guides/Recommendations/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

## Updates

This security policy is reviewed quarterly and updated as needed.

Last updated: 2025-10-31
