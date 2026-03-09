const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000
    }
}));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file']
}, async (accessToken, refreshToken, profile, done) => {
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0]?.value,
        accessToken,
        refreshToken
    };
    return done(null, user);
}));

// Auth Routes
app.get('/auth/google',
    passport.authenticate('google', { accessType: 'offline', prompt: 'consent' })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('http://localhost:3000/dashboard')
);

app.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            loggedIn: true,
            user: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                photo: req.user.photo
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('http://localhost:3000'));
});

// API Routes
app.get('/api/photos', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
            access_token: req.user.accessToken,
            refresh_token: req.user.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Find or create user folder
        let folderId;
        const folderSearch = await drive.files.list({
            q: "name='private_vault' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: 'files(id)'
        });

        if (folderSearch.data.files.length === 0) {
            const folder = await drive.files.create({
                resource: {
                    name: 'private_vault',
                    mimeType: 'application/vnd.google-apps.folder'
                },
                fields: 'id'
            });
            folderId = folder.data.id;
        } else {
            folderId = folderSearch.data.files[0].id;
        }

        const photos = await drive.files.list({
            q: `'${folderId}' in parents and (mimeType contains 'image/') and trashed=false`,
            fields: 'files(id, name, thumbnailLink, webContentLink, createdTime)',
            orderBy: 'createdTime desc'
        });

        res.json({ photos: photos.data.files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/upload', express.raw({ type: 'image/*', limit: '10mb' }), async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );
        oauth2Client.setCredentials({
            access_token: req.user.accessToken,
            refresh_token: req.user.refreshToken
        });

        const drive = google.drive({ version: 'v3', auth: oauth2Client });

        // Get folder
        const folderSearch = await drive.files.list({
            q: "name='private_vault' and mimeType='application/vnd.google-apps.folder'",
            fields: 'files(id)'
        });

        const folderId = folderSearch.data.files[0].id;

        const file = await drive.files.create({
            resource: {
                name: `photo_${Date.now()}.jpg`,
                parents: [folderId]
            },
            media: {
                mimeType: req.headers['content-type'],
                body: req.body
            },
            fields: 'id, name, webContentLink'
        });

        res.json({ success: true, file: file.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
