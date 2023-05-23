const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const emailValidator = require("email-validator");
const passwordValidator = require("password-validator");
const mongoSanitize = require("mongo-sanitize");

const passwordSchema = new passwordValidator();
passwordSchema
    .is()
    .min(8)
    .is()
    .max(100)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .symbols()
    .has()
    .not()
    .spaces();

exports.signup = (req, res, next) => {
    let { email, password } = req.body;

    email = mongoSanitize(email);
    password = mongoSanitize(password);

    if (!emailValidator.validate(email)) {
        return res.status(400).json({ error: "Adresse e-mail invalide" });
    }

    if (!passwordSchema.validate(password)) {
        return res.status(400).json({ error: "Mot de passe invalide" });
    }

    bcrypt
        .hash(password, 10)
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
                .compare(password, user.password)
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
                            process.env.RANDOM_TOKEN_SECRET,
                            {
                                expiresIn: process.env.EXPIRES_IN,
                            }
                        ),
                    });
                })
                .catch((error) => res.status(500).json({ error }));
        })
        .catch((error) => res.status(500).json({ error }));
};
