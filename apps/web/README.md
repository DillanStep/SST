# SST Dashboard

<p align="center">
  <img src="docs/banner.svg" alt="SST Dashboard Banner" width="100%">
</p>

<p align="center">
  <strong>Modern React web dashboard for DayZ server management</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-5-blue" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3-teal" alt="Tailwind">
  <img src="https://img.shields.io/badge/License-Non--Commercial-red" alt="License">
</p>

> ⚠️ **NON-COMMERCIAL LICENSE** - Free for personal and community use. Commercial use is **strictly prohibited** and will result in DMCA action. See [LICENSE](LICENSE).

![Dashboard Screenshot](docs/screenshot.png)

## Features

- 🎮 **Player Dashboard** - Real-time player stats and management
- 🗺️ **Interactive Map** - Live player positions on DayZ map
- 🚗 **Vehicle Tracker** - Locate and manage all vehicles
- 🔍 **Item Search** - Browse and grant items to players
- 🏪 **Market Editor** - Edit Expansion mod market prices
- 📊 **Economy Analysis** - Spawn rate and pricing insights
- 📜 **Log Viewer** - Real-time server log monitoring
- 👥 **User Management** - Role-based access control
- 🌐 **Multi-Server** - Connect to multiple DayZ servers
- 🌙 **Dark Theme** - Easy on the eyes

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/sst-dashboard.git
cd sst-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Dashboard opens at `http://localhost:5173`

## Requirements

- Node.js 18+
- [SST Node API](../sst-node-api) running

## Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/SETUP.md) | Installation walkthrough |
| [Components](docs/COMPONENTS.md) | Component architecture |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history |

## Project Structure

```
sst-dashboard/
├── src/
│   ├── App.tsx          # Main application
│   ├── main.tsx         # Entry point
│   ├── components/      # React components
│   │   ├── features/    # Dashboard views
│   │   └── ui/          # UI primitives
│   ├── services/        # API & utilities
│   └── types/           # TypeScript types
├── public/
│   └── maps/            # DayZ map tiles
├── docs/                # Documentation
└── package.json
```

## Deployment

### Build for Production

```bash
npm run build
```

Output is in the `dist/` folder.

### Docker

```bash
docker build -t sst-dashboard .
docker run -p 80:80 sst-dashboard
```

Or with Docker Compose:

```bash
docker-compose up -d
```

See [Setup Guide](docs/SETUP.md) for more deployment options.

## Screenshots

### Player Dashboard
Real-time server overview with online players and stats.

### Interactive Map
Live player positions with trader zones and teleport support.

### Vehicle Tracker
Track all vehicles with key generation and management.

### Market Editor
Edit Expansion mod market prices with inventory counts.

## Related Projects

- **[SST Node API](../sst-node-api)** - Backend API (required)
- **SST DayZ Mod** - EnforceScript mod (required)

## Support

- 📖 [Documentation](docs/)
- 🐛 [Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 [Request a Feature](.github/ISSUE_TEMPLATE/feature_request.md)

## License

This project is licensed under a **Non-Commercial License**.

- ✅ Free for personal use
- ✅ Free for community servers
- ❌ **No commercial use**
- ❌ **No selling or monetization**

Violations will result in DMCA takedowns. See [LICENSE](LICENSE) for full terms.

---

Made with ❤️ by the SST Development Team
