@echo off
echo ========================================
echo    PRIVATE PHOTO VAULT - SETUP
echo ========================================
echo.

echo [1/5] Checking Node.js...
if exist C:\nodejs\node.exe (
    echo ✅ Node.js found
) else (
    echo ❌ Node.js not found!
    echo.
    echo Please download portable Node.js:
    echo https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x86.zip
    echo Extract to C:\nodejs
    pause
    exit
)

echo [2/5] Installing dependencies...
cd backend
C:\nodejs\npm.cmd install
echo ✅ Dependencies installed

echo [3/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo ✅ .env file created
)

echo [4/5] Creating start script...
cd ..
echo @echo off > start.bat
echo cd backend >> start.bat
echo echo. >> start.bat
echo echo ======================================== >> start.bat
echo echo    STARTING PHOTO VAULT SERVER >> start.bat
echo echo ======================================== >> start.bat
echo echo. >> start.bat
echo echo Server will start at: http://localhost:3000 >> start.bat
echo echo. >> start.bat
echo C:\nodejs\node.exe server.js >> start.bat
echo pause >> start.bat
echo ✅ Start script created

echo [5/5] Creating desktop shortcut...
echo Set oWS = WScript.CreateObject("WScript.Shell") > CreateShortcut.vbs
echo sLinkFile = oWS.ExpandEnvironmentStrings("%USERPROFILE%\Desktop\Photo Vault.lnk") >> CreateShortcut.vbs
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> CreateShortcut.vbs
echo oLink.TargetPath = "cmd.exe" >> CreateShortcut.vbs
echo oLink.Arguments = "/c cd /d C:\photo-vault ^&^& start.bat" >> CreateShortcut.vbs
echo oLink.WorkingDirectory = "C:\photo-vault" >> CreateShortcut.vbs
echo oLink.Description = "Private Photo Vault" >> CreateShortcut.vbs
echo oLink.IconLocation = "C:\nodejs\node.exe, 0" >> CreateShortcut.vbs
echo oLink.Save >> CreateShortcut.vbs
cscript CreateShortcut.vbs /nologo
del CreateShortcut.vbs
echo ✅ Desktop shortcut created

echo.
echo ========================================
echo    ✅ SETUP COMPLETE!
echo ========================================
echo.
echo 📝 NEXT STEPS:
echo 1. Edit backend\.env with your Google credentials
echo 2. Double-click start.bat to run server
echo 3. Open http://localhost:3000 in browser
echo.
pause
