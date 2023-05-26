const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
const mongoSanitize = require("mongo-sanitize");

const passwordSchema = new passwordValidator();

// Définition des règles du schéma de mot de passe
passwordSchema
    .is()
    .min(8) // Minimum 8 caractères
    .is()
    .max(100) // Maximum 100 caractères
    .has()
    .uppercase() // Au moins une lettre majuscule
    .has()
    .lowercase() // Au moins une lettre minuscule
    .has()
    .digits() // Au moins un chiffre
    .has()
    .symbols() // Au moins un symbole
    .has()
    .not()
    .spaces(); // Ne pas contenir d'espaces

exports.signup = (req, res, next) => {
    let { email, password } = req.body;

    email = mongoSanitize(email);
    password = mongoSanitize(password);

    // Validation de l'adresse e-mail
    if (!emailValidator.validate(email)) {
        return res.status(400).json({ error: "Adresse e-mail invalide" });
    }

    // Validation du mot de passe avec le schéma défini
    if (!passwordSchema.validate(password)) {
        return res.status(400).json({ error: "Mot de passe invalide" });
    }

    bcrypt
        .hash(password, 10) // Hashage du mot de passe avec un "salt" de 10
        .then((hash) => {
            const user = new User({
                email: email,
                password: hash,
            });
            user.save()
                .then(() =>
                    res.status(201).json({ message: "Utilisateur créé !" })
                )
                .catch((error) => res.status(400).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    let { email, password } = req.body;

    email = mongoSanitize(email);
    password = mongoSanitize(password);

    // Validation de l'adresse e-mail
    if (!emailValidator.validate(email)) {
        return res.status(400).json({ error: "Adresse e-mail invalide" });
    }

    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                return res
                    .status(401)
                    .json({ error: "Utilisateur non trouvé !" });
            }
            bcrypt
                .compare(password, user.password) // Comparaison du mot de passe saisi avec le mot de passe stocké (hashé)
                .then((valid) => {
                    if (!valid) {
                        return res
                            .status(401)
                            .json({ error: "Mot de passe incorrect !" });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.RANDOM_TOKEN_SECRET, // Clé secrète pour signer le token
                            {
                                expiresIn: process.env.EXPIRES_IN, // Durée de validité du token
                            }
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
