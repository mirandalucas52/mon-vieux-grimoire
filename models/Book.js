const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true }, // Identifiant de l'utilisateur associé au livre
    title: { type: String, required: true }, // Titre du livre
    author: { type: String, required: true }, // Auteur du livre
    imageUrl: { type: String, required: true }, // URL de l'image du livre
    year: { type: Number, required: true }, // Année de publication du livre
    genre: { type: String, required: true }, // Genre du livre
    ratings: [
        // Tableau des évaluations du livre
        {
            userId: { type: String, required: true }, // Identifiant de l'utilisateur ayant fait l'évaluation
            grade: { type: Number, required: true }, // Note attribuée au livre par l'utilisateur
        },
    ],
    averageRating: { type: Number, required: true }, // Note moyenne du livre calculée à partir des évaluations
});

module.exports = mongoose.model("Book", bookSchema); // Exportation du modèle Book basé sur le schéma défini
