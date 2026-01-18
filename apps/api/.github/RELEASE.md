# Release Checklist

Use this template when creating GitHub releases.

## Pre-Release

- [ ] All tests passing
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Documentation up to date
- [ ] No console.log debug statements

## Create Release

1. **Tag the release**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

2. **Go to GitHub Releases** → "Draft a new release"

3. **Use this template for release notes:**

---

## v1.0.0 - Initial Release

### 🎉 What's New

- Initial public release of SST Node API
- Full REST API for DayZ server management
- Player tracking and inventory management
- Vehicle location and status tracking
- Expansion mod market integration
- Real-time log viewing
- JWT + API key authentication

### 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/sst-node-api.git
cd sst-node-api
npm install
cp .env.example .env
# Edit .env with your paths
npm start
```

### ⚠️ Breaking Changes

None (initial release)

### 🐛 Bug Fixes

None (initial release)

### 📝 Documentation

- Complete API reference in [docs/API.md](docs/API.md)
- Setup guide in [docs/SETUP.md](docs/SETUP.md)
- Architecture overview in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### 🙏 Contributors

- @YOUR_USERNAME

---

## GitHub Repository Topics

Add these topics to your repository (Settings → Topics):

```
dayz
dayz-server
server-management
admin-dashboard
game-server
nodejs
express
rest-api
sqlite
expansion-mod
```
