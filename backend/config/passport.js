import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Debug log
console.log('Google OAuth Config:', {
    clientID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing'
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Buscar si el usuario ya existe
                let user = await User.findOne({ email: profile.emails[0].value });

                if (!user) {
                    // Crear nuevo usuario si no existe
                    user = await User.create({
                        email: profile.emails[0].value,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        password: 'google-auth-' + Math.random().toString(36).slice(-8),
                        age: 0, // Valor por defecto
                        googleId: profile.id
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;