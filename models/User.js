const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Adresse e-mail de l'utilisateur (doit être unique)
    password: { type: String, required: true }, // Mot de passe de l'utilisateur
});

userSchema.plugin(uniqueValidator); // Application du plugin uniqueValidator au schéma pour valider l'unicité de l'e-mail

module.exports = mongoose.model("User", userSchema); // Exportation du modèle User basé sur le schéma défini
