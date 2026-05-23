const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './cabane.db';
const db = new Database(dbPath);

// Activer les clés étrangères
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Créer les tables
db.exec(`
  CREATE TABLE IF NOT EXISTS commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    adresse TEXT NOT NULL,
    livraison TEXT NOT NULL,
    paiement TEXT NOT NULL,
    articles TEXT NOT NULL,
    total INTEGER NOT NULL,
    statut TEXT DEFAULT 'en_attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    atelier TEXT NOT NULL,
    prix INTEGER NOT NULL,
    date_souhaitee TEXT,
    paiement TEXT NOT NULL,
    statut TEXT DEFAULT 'en_attente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    sujet TEXT NOT NULL,
    message TEXT NOT NULL,
    lu BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log('✅ Base de données SQLite initialisée');

module.exports = db;