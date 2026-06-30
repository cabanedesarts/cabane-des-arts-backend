const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { JWT_SECRET } = require('../jwtSecret');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Petite protection anti brute-force : limite simple en mémoire.
// (Solution basique adaptée à un seul compte admin ; pour un usage à plus
// grande échelle, préférer un store partagé comme Redis.)
const tentatives = new Map(); // ip -> { count, premierEssai }
const MAX_TENTATIVES = 5;
const FENETRE_MS = 15 * 60 * 1000; // 15 minutes

function estBloque(ip) {
    const entry = tentatives.get(ip);
    if (!entry) return false;
    if (Date.now() - entry.premierEssai > FENETRE_MS) {
        tentatives.delete(ip);
        return false;
    }
    return entry.count >= MAX_TENTATIVES;
}

function enregistrerEchec(ip) {
    const entry = tentatives.get(ip);
    if (!entry || Date.now() - entry.premierEssai > FENETRE_MS) {
        tentatives.set(ip, { count: 1, premierEssai: Date.now() });
    } else {
        entry.count += 1;
    }
}

function reinitialiser(ip) {
    tentatives.delete(ip);
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const ip = req.ip;

    if (estBloque(ip)) {
        return res.status(429).json({ erreur: 'Trop de tentatives. Réessayez dans quelques minutes.' });
    }

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ erreur: 'Email et mot de passe requis' });
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error('❌ ADMIN_EMAIL / ADMIN_PASSWORD non définis dans les variables d\'environnement du serveur.');
        return res.status(500).json({ erreur: 'Configuration serveur incomplète' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        reinitialiser(ip);
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '8h' });
        return res.json({
            message: '✅ Connexion réussie',
            token
        });
    }

    enregistrerEchec(ip);
    res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
});

module.exports = router;
