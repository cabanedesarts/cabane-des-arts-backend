const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');
const db = require('../database');

// POST /api/avis — Soumettre un avis
router.post('/', (req, res) => {
  const { nom, email, produit, note, commentaire } = req.body;

  if (!nom || !email || !note || !commentaire) {
    return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis' });
  }

  if (note < 1 || note > 5) {
    return res.status(400).json({ erreur: 'La note doit être entre 1 et 5' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO avis (nom, email, produit, note, commentaire)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(nom, email, produit || null, note, commentaire);

    res.status(201).json({
      message: '✅ Avis soumis avec succès ! Il sera publié après validation.',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la soumission' });
  }
});

// GET /api/avis — Lister les avis validés (pour le site)
router.get('/', (req, res) => {
  try {
    const avis = db.prepare(`
      SELECT id, nom, produit, note, commentaire, created_at 
      FROM avis WHERE statut = 'validé' 
      ORDER BY created_at DESC
    `).all();
    res.json(avis);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération' });
  }
});

// GET /api/avis/admin — Lister tous les avis (pour le dashboard)
router.get('/admin', requireAuth, (req, res) => {
  try {
    const avis = db.prepare('SELECT * FROM avis ORDER BY created_at DESC').all();
    res.json(avis);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération' });
  }
});

// PATCH /api/avis/:id/statut — Valider ou rejeter un avis
router.patch('/:id/statut', requireAuth, (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  const statuts = ['en_attente', 'validé', 'rejeté'];
  if (!statuts.includes(statut)) {
    return res.status(400).json({ erreur: 'Statut invalide' });
  }

  try {
    const stmt = db.prepare('UPDATE avis SET statut = ? WHERE id = ?');
    const result = stmt.run(statut, id);

    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Avis introuvable' });
    }

    res.json({ message: `✅ Avis ${statut}`, statut });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/avis — Vider tous les avis
router.delete('/', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM avis').run();
    res.json({ message: '✅ Tous les avis ont été supprimés' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

module.exports = router;