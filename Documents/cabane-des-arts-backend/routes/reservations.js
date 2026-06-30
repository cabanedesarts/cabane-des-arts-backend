const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');
const db = require('../database');

// POST /api/reservations — Créer une réservation
router.post('/', (req, res) => {
  const { nom, email, telephone, atelier, prix, date_souhaitee, paiement } = req.body;

  // Validation
  if (!nom || !email || !telephone || !atelier || !prix || !paiement) {
    return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO reservations (nom, email, telephone, atelier, prix, date_souhaitee, paiement)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nom, email, telephone, atelier, prix, date_souhaitee || null, paiement);

    res.status(201).json({
      message: '✅ Réservation enregistrée avec succès',
      id: result.lastInsertRowid
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de l\'enregistrement de la réservation' });
  }
});

// GET /api/reservations — Lister toutes les réservations
router.get('/', requireAuth, (req, res) => {
  try {
    const reservations = db.prepare('SELECT * FROM reservations ORDER BY created_at DESC').all();
    res.json(reservations);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des réservations' });
  }
});

// PATCH /api/reservations/:id/statut — Mettre à jour le statut
router.patch('/:id/statut', requireAuth, (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  const statuts = ['en_attente', 'confirmée', 'annulée'];
  if (!statuts.includes(statut)) {
    return res.status(400).json({ erreur: 'Statut invalide' });
  }

  try {
    const stmt = db.prepare('UPDATE reservations SET statut = ? WHERE id = ?');
    const result = stmt.run(statut, id);

    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Réservation introuvable' });
    }

    res.json({ message: '✅ Statut mis à jour', statut });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
  }
});
// DELETE /api/reservations — Vider toutes les réservations
router.delete('/', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM reservations').run();
    res.json({ message: '✅ Toutes les réservations ont été supprimées' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

module.exports = router;