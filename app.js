const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const booksRoutes = require("./routes/books");
const userRoutes = require("./routes/user");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Configuration du rate limit pour limiter les requêtes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite chaque IP à 100 requêtes par fenêtre de temps (ici, 15 minutes)
    standardHeaders: true, // Retourne les informations du rate limit dans les en-têtes `RateLimit-*`
    legacyHeaders: false, // Désactive les en-têtes `X-RateLimit-*` (en-têtes héritées)
});

// Connexion à la base de données MongoDB
mongoose
    .connect(
        "mongodb+srv://" +
            process.env.MONGODB_LOGIN +
            ":" +
            process.env.MONGODB_PASSWORD +
            "@" +
            process.env.MONGODB_CLUSTER +
            "/?retryWrites=true&w=majority",
        { useNewUrlParser: true, useUnifiedTopology: true }
    )
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));

// Utilisation du rate limit pour l'application
app.use(limiter);

// Configuration de l'analyseur de corps de requête JSON
app.use(express.json());
app.use(bodyParser.json());

// Configuration des en-têtes CORS
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

// Configuration du dossier d'images statiques
app.use("/images", express.static(path.join(__dirname, "images")));

// Configuration des routes pour les livres
app.use("/api/books", booksRoutes);

// Configuration des routes pour l'authentification
app.use("/api/auth", userRoutes);

module.exports = app;
