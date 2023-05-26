const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth"); // Importation du middleware d'authentification
const multer = require("../middleware/multer-config"); // Importation du middleware de configuration de multer pour la gestion des fichiers
const sharpMiddleware = require("../middleware/sharp-config"); // Importation du middleware de configuration de sharp pour la manipulation des images

const booksCtrl = require("../controllers/books"); // Importation du contrôleur des livres

router.get("/", booksCtrl.getAllBooks); // Route pour récupérer tous les livres
router.get("/bestrating", booksCtrl.bestRating); // Route pour récupérer les livres les mieux notés
router.post("/", auth, multer, sharpMiddleware, booksCtrl.createBook); // Route pour créer un livre (authentification requise, gestion des fichiers avec multer, manipulation des images avec sharp)
router.get("/:id", booksCtrl.getOneBook); // Route pour récupérer un livre spécifique
router.put("/:id", auth, multer, sharpMiddleware, booksCtrl.modifyBook); // Route pour modifier un livre spécifique (authentification requise, gestion des fichiers avec multer, manipulation des images avec sharp)
router.delete("/:id", auth, booksCtrl.deleteBook); // Route pour supprimer un livre spécifique (authentification requise)
router.post("/:id/rating", auth, booksCtrl.ratingBook); // Route pour attribuer une note à un livre (authentification requise)

module.exports = router; // Exportation du routeur
