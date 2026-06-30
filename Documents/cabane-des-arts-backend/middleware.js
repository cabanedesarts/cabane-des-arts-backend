const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./jwtSecret');

// Vérifie le header "Authorization: Bearer <token>".
// Bloque la requête (401) si le token est absent, invalide ou expiré.
function requireAuth(req, res, next) {
    const header = req.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ erreur: 'Authentification requise' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.admin = payload; // { email, iat, exp }
        next();
    } catch (err) {
        return res.status(401).json({ erreur: 'Session invalide ou expirée, veuillez vous reconnecter' });
    }
}

module.exports = { requireAuth };
