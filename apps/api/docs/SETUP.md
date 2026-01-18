# SST Node API - Setup Guide

> Step-by-step installation and configuration guide

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **DayZ Server** with SST mod installed
- **Windows** (for DayZ server integration)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/sst-node-api.git
cd sst-node-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your paths:

```env
# Server Configuration
PORT=3001
HOST=0.0.0.0

# DayZ Server Paths (REQUIRED)
DAYZ_SERVER_PATH=C:/DayZServer
DAYZ_PROFILE_PATH=C:/DayZServer/profiles
SST_PATH=C:/DayZServer/profiles/SST

# Security
JWT_SECRET=your-secure-random-secret-here
API_KEY=your-api-key-here

# Optional
NODE_ENV=production
```

### 4. Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Or use the batch file:
```bash
Start Server.bat
```

### 5. Verify Installation

Open in browser:
```
http://localhost:3001/api/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "version": "1.0.0"
}
```

---

## Path Configuration

### Understanding the Paths

| Variable | Description | Example |
|----------|-------------|---------|
| `DAYZ_SERVER_PATH` | Root DayZ server folder | `C:/DayZServer` |
| `DAYZ_PROFILE_PATH` | Server profiles folder | `C:/DayZServer/profiles` |
| `SST_PATH` | SST mod data folder | `C:/DayZServer/profiles/SST` |

### Expected Folder Structure

```
DayZServer/
├── profiles/
│   ├── SST/                    ← SST_PATH
│   │   ├── player_tracker.json
│   │   ├── vehicle_tracker.json
│   │   └── ...
│   ├── expansion/              ← Expansion mod data
│   └── ...
└── mpmissions/
    └── dayzOffline.chernarusplus/
        └── types.xml
```

---

## Security Configuration

### JWT Secret

Generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### API Key

For external API access, set a strong API key:

```env
API_KEY=your-long-random-api-key-here
```

### Firewall Setup

Run the included PowerShell script as Administrator:

```powershell
.\Setup-Firewall.ps1
```

This opens port 3001 for API access.

---

## Database Setup

The API uses SQLite databases stored in the `data/` folder:

- `positions.db` - Player position tracking
- `archive.db` - Archived position data
- `auth.db` - User authentication

Databases are created automatically on first run.

### Default Admin User

On first run, a default admin user is created:

- **Username:** `admin`
- **Password:** `admin`

**⚠️ Change this immediately after first login!**

---

## Running as a Service

### Windows Service (NSSM)

1. Download [NSSM](https://nssm.cc/)
2. Install as service:
   ```cmd
   nssm install SST-API "C:\path\to\node.exe" "C:\path\to\sst-node-api\src\server.js"
   nssm set SST-API AppDirectory "C:\path\to\sst-node-api"
   nssm start SST-API
   ```

### PM2 (Recommended)

```bash
npm install -g pm2
pm2 start src/server.js --name sst-api
pm2 save
pm2 startup
```

---

## Troubleshooting

### Common Issues

#### "ENOENT: no such file or directory"
- Check your path configuration in `.env`
- Ensure paths use forward slashes: `C:/DayZServer` not `C:\DayZServer`

#### "EACCES: permission denied"
- Run as Administrator
- Check folder permissions

#### "Port already in use"
- Change PORT in `.env`
- Or stop the conflicting service

#### "Cannot find module"
- Run `npm install` again
- Delete `node_modules` and reinstall

### Debug Mode

Enable verbose logging:

```env
DEBUG=sst:*
NODE_ENV=development
```

---

## Updating

### From Git

```bash
git pull origin main
npm install
npm start
```

### Manual

1. Backup your `.env` file
2. Backup your `data/` folder
3. Replace files with new version
4. Restore `.env` and `data/`
5. Run `npm install`
6. Restart the server

---

## Next Steps

- [API Reference](./API.md) - Full API documentation
- [Dashboard Setup](../../sst-dashboard/docs/SETUP.md) - Install the web dashboard
- [Contributing](../CONTRIBUTING.md) - How to contribute
