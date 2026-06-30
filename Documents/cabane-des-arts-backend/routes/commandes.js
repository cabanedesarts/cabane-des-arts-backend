const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware');
const db = require('../database');

// POST /api/commandes — Créer une commande
router.post('/', (req, res) => {
  const { nom, email, telephone, adresse, livraison, paiement, articles, total } = req.body;

  // Validation
  if (!nom || !email || !telephone || !adresse || !livraison || !paiement || !articles || !total) {
    return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO commandes (nom, email, telephone, adresse, livraison, paiement, articles, total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nom, email, telephone, adresse, livraison, paiement,
      JSON.stringify(articles),
      total
    );

    res.status(201).json({
      message: '✅ Commande enregistrée avec succès',
      id: result.lastInsertRowid
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de l\'enregistrement de la commande' });
  }
});

// GET /api/commandes — Lister toutes les commandes
router.get('/', requireAuth, (req, res) => {
  try {
    const commandes = db.prepare('SELECT * FROM commandes ORDER BY created_at DESC').all();

    // Parser les articles JSON
    const result = commandes.map(c => ({
      ...c,
      articles: JSON.parse(c.articles)
    }));

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des commandes' });
  }
});

// PATCH /api/commandes/:id/statut — Mettre à jour le statut
router.patch('/:id/statut', requireAuth, (req, res) => {
  const { id } = req.params;
  const { statut } = req.body;

  const statuts = ['en_attente', 'confirmée', 'expédiée', 'livrée', 'annulée'];
  if (!statuts.includes(statut)) {
    return res.status(400).json({ erreur: 'Statut invalide' });
  }

  try {
    const stmt = db.prepare('UPDATE commandes SET statut = ? WHERE id = ?');
    const result = stmt.run(statut, id);

    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Commande introuvable' });
    }

    res.json({ message: '✅ Statut mis à jour', statut });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
  }
});
// DELETE /api/commandes — Vider toutes les commandes
router.delete('/', requireAuth, (req, res) => {
  try {
    db.prepare('DELETE FROM commandes').run();
    res.json({ message: '✅ Toutes les commandes ont été supprimées' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

module.exports = router;