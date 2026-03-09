# 🔒 Private Photo Vault with Google Drive

## 📋 Requirements
- Windows 32-bit or 64-bit
- C drive space: 200MB
- Internet connection

## 🚀 Quick Start (5 minutes)

### Step 1: Download Portable Node.js
1. Download from: https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x86.zip
2. Extract to `C:\nodejs`

### Step 2: Get Google API Keys
1. Go to https://console.cloud.google.com
2. Create new project "Photo Vault"
3. Enable Google Drive API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy Client ID and Secret

### Step 3: Setup Project
1. Extract this repository to `C:\photo-vault`
2. Double-click `setup.bat`
3. Edit `backend\.env` - paste your Google credentials

### Step 4: Run
1. Double-click `start.bat`
2. Open browser: http://localhost:3000
3. Click "Google Login"

## ✨ Features
- ✅ Google Login
- ✅ Private photo storage
- ✅ Auto backup to Google Drive
- ✅ Download photos
- ✅ Mobile friendly
- ✅ Secure per-user isolation

## ❓ Troubleshooting
- **Port 3000 busy**: Change PORT in .env file
- **Login not working**: Check redirect URI in Google Console
- **Upload fails**: Check Google Drive permissions
