const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; // Extraction du token JWT de l'en-tête Authorization de la requête
        const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET); // Décodage et vérification du token JWT en utilisant la clé secrète RANDOM_TOKEN_SECRET
        const userId = decodedToken.userId; // Récupération de l'identifiant de l'utilisateur à partir du token décodé
        req.auth = {
            userId: userId,
        }; // Ajout de l'objet d'authentification à l'objet de requête pour le rendre accessible aux prochaines étapes du traitement
        next(); // Passez à l'étape suivante du traitement de la requête
    } catch (error) {
        res.status(401).json({ error }); // En cas d'erreur, renvoie une réponse d'erreur 401 (Non autorisé) avec l'erreur retournée
    }
};
