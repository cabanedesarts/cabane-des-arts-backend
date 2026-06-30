const crypto = require('crypto');

// Idéalement JWT_SECRET est défini dans les variables d'environnement Render
// (Render → ton service → Environment → Add Environment Variable).
// Si elle est absente, on génère une clé aléatoire au démarrage du serveur :
// l'app reste fonctionnelle, mais tous les tokens deviennent invalides
// à chaque redémarrage du serveur (l'admin devra juste se reconnecter).
// C'est volontairement plus strict qu'un mot de passe par défaut deviné facilement.
let secret = process.env.JWT_SECRET;

if (!secret) {
    secret = crypto.randomBytes(32).toString('hex');
    console.warn(
        '⚠️  JWT_SECRET non défini dans les variables d\'environnement.\n' +
        '   Une clé temporaire a été générée pour cette session du serveur.\n' +
        '   Pense à définir JWT_SECRET sur Render pour que les sessions admin\n' +
        '   survivent aux redémarrages du serveur.'
    );
}

module.exports = { JWT_SECRET: secret };
