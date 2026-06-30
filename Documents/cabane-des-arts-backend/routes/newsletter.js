const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');
const db = require('../database');

// POST /api/newsletter — S'abonner
router.post('/', (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({ erreur: 'L\'adresse email est obligatoire' });
  }

  // Validation format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ erreur: 'Adresse email invalide' });
  }

  try {
    const stmt = db.prepare('INSERT INTO newsletter (email) VALUES (?)');
    stmt.run(email);

    res.status(201).json({
      message: '✅ Abonnement à la newsletter confirmé'
    });

  } catch (err) {
    // Email déjà existant (UNIQUE constraint)
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ erreur: 'Cet email est déjà abonné' });
    }
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de l\'abonnement' });
  }
});

// GET /api/newsletter — Lister tous les abonnés
router.get('/', requireAuth, (req, res) => {
  try {
    const abonnes = db.prepare('SELECT * FROM newsletter ORDER BY created_at DESC').all();
    res.json({
      total: abonnes.length,
      abonnes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des abonnés' });
  }
});

// DELETE /api/newsletter/all — Vider tous les abonnés
router.delete('/all', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM newsletter').run();
    res.json({ message: '✅ Tous les abonnés ont été supprimés' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

// DELETE /api/newsletter/:email — Se désabonner
router.delete('/:email', (req, res) => {
  const { email } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM newsletter WHERE email = ?');
    const result = stmt.run(email);
    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Email introuvable' });
    }
    res.json({ message: '✅ Désabonnement effectué' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors du désabonnement' });
  }
});

module.exports = router;