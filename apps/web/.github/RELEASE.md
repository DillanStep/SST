# Release Checklist

Use this template when creating GitHub releases.

## Pre-Release

- [ ] All tests passing
- [ ] Build succeeds (`npm run build`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Documentation up to date

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

- Initial public release of SST Dashboard
- Modern React 18 + TypeScript interface
- Interactive map with live player positions
- Player management and inventory viewing
- Vehicle tracking and location
- Expansion mod market editor
- Real-time server log viewing
- Docker deployment support

### 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/sst-dashboard.git
cd sst-dashboard
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

### 🐳 Docker

```bash
docker build -t sst-dashboard .
docker run -p 80:80 sst-dashboard
```

### ⚠️ Breaking Changes

None (initial release)

### 🐛 Bug Fixes

None (initial release)

### 📝 Documentation

- Setup guide in [docs/SETUP.md](docs/SETUP.md)
- Component reference in [docs/COMPONENTS.md](docs/COMPONENTS.md)

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
react
typescript
tailwindcss
vite
leaflet
docker
```
