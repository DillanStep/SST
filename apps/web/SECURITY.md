# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in SST Dashboard, please report it responsibly.

### How to Report

1. **Do NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: [your-email@example.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes

### What to Expect

- Acknowledgment within 48 hours
- Assessment within 7 days
- Fix timeline based on severity

### Scope

Security issues we're interested in:

- XSS vulnerabilities
- CSRF issues
- Authentication bypass
- Token exposure
- Sensitive data in localStorage
- Insecure dependencies

### Out of Scope

- Denial of service (DoS)
- Social engineering
- Issues in dependencies (report to them directly)
- Server-side issues (report to sst-node-api)

## Security Best Practices

When deploying SST Dashboard:

1. **Use HTTPS** - Always serve over HTTPS in production
2. **Secure cookies** - Configure API for secure cookies
3. **Content Security Policy** - Add CSP headers in your web server
4. **Keep updated** - Apply security updates promptly

## Client-Side Security Notes

- JWT tokens stored in localStorage (secure your browser)
- Server configurations stored in localStorage
- API keys transmitted in headers (use HTTPS)
