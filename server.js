require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== MIDDLEWARES =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/avis', require('./routes/avis'));

// ===== ROUTE DE TEST =====
app.get('/', (req, res) => {
  res.json({
    message: '🎨 Cabane des Arts API - En ligne !',
    version: '1.0.0',
    routes: [
      'GET  /',
      'POST /api/commandes',
      'GET  /api/commandes',
      'POST /api/reservations',
      'GET  /api/reservations',
      'POST /api/contact',
      'GET  /api/contact',
      'POST /api/newsletter',
      'GET  /api/newsletter',
    ]
  });
});

// ===== GESTION DES ERREURS =====
app.use((req, res) => {
  res.status(404).json({ erreur: 'Route introuvable' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erreur: 'Erreur serveur interne' });
});

// ===== DÉMARRAGE =====
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});