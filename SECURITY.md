# Security Policy

## Supported Versions

We actively support the following versions of Open Radio with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Open Radio seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities via:

- **Email**: [security@openradio.dev](mailto:security@openradio.dev)
- **Private Security Advisory**: Use GitHub's private vulnerability reporting feature

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide an initial assessment within 5 business days
- We will work to resolve critical vulnerabilities within 30 days
- We will keep you informed of our progress throughout the process

### Disclosure Policy

- We request that you give us a reasonable amount of time to address the vulnerability before public disclosure
- We will publicly acknowledge your responsible disclosure once the vulnerability has been resolved
- We may provide credit for your discovery in our security advisories (with your permission)

## Security Measures

### Current Security Practices

- **Dependency Management**: Automated security updates via Dependabot
- **Code Quality**: ESLint with security rules and TypeScript for type safety
- **CI/CD Pipeline**: Automated security scanning in our GitHub Actions workflows
- **Environment Variables**: Sensitive configuration stored securely
- **HTTPS**: All production traffic encrypted in transit

### Data Handling

- **YouTube API**: We only access public playlist and video metadata
- **Firebase**: Real-time listener count data only (no personal information)
- **Local Storage**: Only non-sensitive user preferences (volume, etc.)
- **No Authentication**: The application does not collect or store user accounts

### Third-Party Dependencies

We regularly audit our dependencies for known vulnerabilities and maintain them at their latest secure versions. Key security-relevant dependencies include:

- React/Next.js framework components
- YouTube IFrame API
- Firebase SDK
- Build and development tools

## Vulnerability Disclosure Examples

### In Scope

- Cross-site scripting (XSS) vulnerabilities
- Authentication or authorization flaws
- Server-side injection vulnerabilities
- Significant security misconfigurations
- Exposure of sensitive data

### Out of Scope

- Vulnerabilities in third-party services (YouTube, Firebase) that we cannot control
- Issues requiring physical access to a user's device
- Social engineering attacks
- Denial of service attacks
- Reports about missing security headers that don't pose a demonstrable risk

## Contact

For any questions about this security policy, please contact us at [security@openradio.dev](mailto:security@openradio.dev).

---

Thank you for helping to keep Open Radio and our users safe!