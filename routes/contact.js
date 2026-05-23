const express = require('express');
const router = express.Router();
const db = require('../database');

// POST /api/contact — Envoyer un message
router.post('/', (req, res) => {
  const { nom, email, telephone, sujet, message } = req.body;

  // Validation
  if (!nom || !email || !sujet || !message) {
    return res.status(400).json({ erreur: 'Tous les champs obligatoires doivent être remplis' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO contacts (nom, email, telephone, sujet, message)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(nom, email, telephone || null, sujet, message);

    res.status(201).json({
      message: '✅ Message envoyé avec succès',
      id: result.lastInsertRowid
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de l\'envoi du message' });
  }
});

// GET /api/contact — Lister tous les messages
router.get('/', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
    res.json(messages);

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la récupération des messages' });
  }
});

// PATCH /api/contact/:id/lu — Marquer un message comme lu
router.patch('/:id/lu', (req, res) => {
  const { id } = req.params;

  try {
    const stmt = db.prepare('UPDATE contacts SET lu = 1 WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ erreur: 'Message introuvable' });
    }

    res.json({ message: '✅ Message marqué comme lu' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: 'Erreur lors de la mise à jour' });
  }
});
// DELETE /api/contact — Vider tous les messages
router.delete('/', (req, res) => {
  try {
    db.prepare('DELETE FROM contacts').run();
    res.json({ message: '✅ Tous les messages ont été supprimés' });
  } catch (err) {
    res.status(500).json({ erreur: 'Erreur lors de la suppression' });
  }
});

module.exports = router;