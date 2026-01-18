# SST Dashboard - Quick Start Guide

## First-Time Setup (3 Steps)

### Step 1: Install Dependencies
Double-click **`Install-SST.bat`** in the root folder.

This will:
- Check that Node.js is installed
- Install API dependencies
- Install Web Client dependencies
- Build the web client for production

### Step 2: Launch SST
Double-click **`Start-SST.bat`** in the root folder.

This will:
- Start the API server on port 3001
- Open your browser to the dashboard

### Step 3: Complete Setup in Browser
When the dashboard opens, you'll be guided to:

1. **Configure your DayZ server connection**
   - Choose SFTP, FTP, or Local files
   - Enter your server credentials
   - Test the connection

2. **Create your admin account**
   - Set username and password
   - This account manages the dashboard

---

## Requirements

- **Node.js 18+** - Download from https://nodejs.org/
- **DayZ Server with SST mod** installed
- **SFTP/FTP access** to your server (for hosted servers like HostHavoc, GTX, etc.)

---

## Folder Structure

```
SST/
├── Start-SST.bat          ← Run this to start the dashboard
├── Install-SST.bat        ← Run this once on first install
├── apps/
│   ├── api/               ← Backend API (Node.js)
│   │   └── .env           ← Configuration (created during setup)
│   └── web/               ← Frontend dashboard (React)
│       └── dist/          ← Built web client (created by Install-SST)
```

---

## Configuration

All configuration is done through the web interface during first-run setup.

Settings are saved to `apps/api/.env` and include:
- **Storage Backend**: SFTP, FTP, or Local
- **Server Credentials**: Host, port, username, password
- **File Paths**: SST mod folder location on your server

---

## Troubleshooting

### "Node.js is not installed"
Download and install Node.js LTS from https://nodejs.org/

### "Cannot connect to server"
- Make sure no other application is using port 3001
- Check your firewall allows connections on port 3001
- Verify your SFTP/FTP credentials are correct

### Dashboard shows blank page
- Press F12 to open browser console
- Check for error messages
- Ensure the API is running (check the API terminal window)

### SFTP/FTP connection fails
1. Test your credentials with a standalone SFTP client (WinSCP, FileZilla)
2. Make sure you have the correct port (SFTP is often 8822, not 22)
3. Verify the path to your SST folder

---

## Support

- **Discord**: [SUDO Gaming Discord](https://discord.gg/sudogaming)
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: See `docs/` folder for detailed guides
