# Contributing to SST - SUDO Server Tools

Thank you for your interest in contributing to SST! This document provides guidelines for contributing to the project.

## 📜 License Agreement

By contributing to this project, you agree that:

1. Your contributions will be licensed under the same [Non-Commercial License](LICENSE) as the rest of the project
2. You have the right to submit the contribution
3. You understand that SST is **non-commercial software** and may not be sold or used for commercial purposes

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** - Required for the API server
- **DayZ Server** - With the SST mod installed
- **Git** - For version control

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sudo-gaming/sst.git
   cd sst/sst-node-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DayZ server paths
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates
2. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - Error messages/logs
   - Environment details

### Submitting Code

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "feat: add feature"`
6. Push and create a Pull Request

## 📋 Code Style

- Use ES6+ features
- Use `async/await` over callbacks
- Handle errors gracefully
- Log errors with `[Category]` prefixes
- Add comments for complex logic

## ✅ Pull Request Checklist

- [ ] Code follows project style
- [ ] Changes tested locally
- [ ] No hardcoded paths/secrets
- [ ] Error handling in place
- [ ] PR description explains changes

## 🔒 Security

- Never commit secrets
- Use `.env` for sensitive config
- Report vulnerabilities privately

---

**SUDO Gaming - Made with ❤️ for the DayZ Community**
