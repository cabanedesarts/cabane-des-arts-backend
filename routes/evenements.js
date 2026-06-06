const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/evenements — Lister les événements publiés
router.get('/', (req, res) => {
  try {
    const evenements = db.prepare(`
      SELECT * FROM evenements 
      WHERE statut = 'publié' 
      ORDER BY date_debut ASC
    `).all();
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération' });
  }
});

// GET /api/evenements/admin — Lister tous les événements
router.get('/admin', (req, res) => {
  try {
    const evenements = db.prepare('SELECT * FROM evenements ORDER BY date_debut ASC').all();
    res.json(evenements);
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la récupération' });
  }
});

// POST /api/evenements — Créer un événement
router.post('/', (req, res) => {
  const { titre, description, date_debut, date_fin, lieu, type, prix, image_url } = req.body;

  if (!titre || !description || !date_debut) {
    return res.status(400).json({ erreur: 'Titre, description et date sont obligatoires' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO evenements (titre, description, date_debut, date_fin, lieu, type, prix, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(titre, description, date_debut, date_fin || null, lieu || null, type || 'atelier', prix || 0, image_url || null);

    res.status(201).json({
      message: '✅ Événement créé avec succès',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la création' });
  }
});

// PUT /api/evenements/:id — Modifier un événement
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { titre, description, date_debut, date_fin, lieu, type, prix, image_url, statut } = req.body;

  try {
    const stmt = db.prepare(`
      UPDATE evenements 
      SET titre=?, description=?, date_debut=?, date_fin=?, lieu=?, type=?, prix=?, image_url=?, statut=?
      WHERE id=?
    `);
    const result = stmt.run(titre, description, date_debut, date_fin || null, lieu || null, type, prix || 0, image_url || null, statut || 'publié', id);

    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Événement introuvable' });
    }

    res.json({ message: '✅ Événement mis à jour' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/evenements/:id — Supprimer un événement
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare('DELETE FROM evenements WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Événement introuvable' });
    }
    res.json({ message: '✅ Événement supprimé' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

// DELETE /api/evenements — Vider tous les événements
router.delete('/', (req, res) => {
  try {
    db.prepare('DELETE FROM evenements').run();
    res.json({ message: '✅ Tous les événements ont été supprimés' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

module.exports = router;