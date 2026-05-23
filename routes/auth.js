const express = require('express');
const router = express.Router();

// Identifiants admin (à mettre dans .env plus tard)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cabanedesarts.bj';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cabane2026';

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ erreur: 'Email et mot de passe requis' });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Token simple basé sur timestamp
        const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
        return res.json({ 
            message: '✅ Connexion réussie',
            token 
        });
    }

    res.status(401).json({ erreur: 'Email ou mot de passe incorrect' });
});

module.exports = router;