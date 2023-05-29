const Book = require("../models/Book");

const fs = require("fs"); // Créer un livre
exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book); // Conversion de la chaîne JSON en objet JavaScript
    delete bookObject._id; // Suppression de la clé "_id" de l'objet
    delete bookObject._userId; // Suppression de la clé "_userId" de l'objet
    const book = new Book({
        ...bookObject, // Utilisation de la syntaxe spread pour copier les propriétés de bookObject
        userId: req.auth.userId, // Ajout de l'identifiant de l'utilisateur authentifié
        imageUrl: req.file // Ajout de l'URL de l'image si elle existe
            ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            : null,
    });

    book.save() // Sauvegarde du livre dans la base de données
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" }); // Réponse JSON en cas de succès
        })
        .catch((error) => {
            res.status(400).json({ error }); // Réponse JSON en cas d'erreur
        });
};

// Récupérer un livre
exports.getOneBook = (req, res, next) => {
    Book.findOne({
        // Recherche d'un livre par son identifiant (_id)
        _id: req.params.id, // L'identifiant est extrait des paramètres de la requête
    })
        .then((book) => {
            res.status(200).json(book); // Réponse JSON contenant le livre trouvé
        })
        .catch((error) => {
            res.status(404).json({
                error: error, // Réponse JSON en cas de livre non trouvé ou d'erreur
            });
        });
};

exports.modifyBook = (req, res, next) => {
    const { title, author, year, genre } = req.body; // Extraction des propriétés à mettre à jour du corps de la requête

    Book.findOne({ _id: req.params.id }) // Recherche du livre à modifier par son identifiant
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: "Book not found" }); // Vérification si le livre existe
            }

            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "Not authorized" }); // Vérification de l'autorisation de modification du livre
            }

            if (book.userId.toString() !== req.auth.userId.toString()) {
                return res
                    .status(403)
                    .json({ message: "Not authorized to modify this book" }); // Vérification de l'autorisation de modification du livre
            }

            const oldImageUrl = book.imageUrl; // Sauvegarde de l'ancienne URL de l'image

            const updateFields = {
                title: title,
                author: author,
                year: year,
                genre: genre,
            }; // Préparation des champs à mettre à jour

            if (req.file) {
                // Vérification si une nouvelle image est fournie dans la requête
                updateFields.imageUrl = `${req.protocol}://${req.get(
                    "host"
                )}/images/${req.file.filename}`; // Mise à jour de l'URL de l'image

                if (oldImageUrl) {
                    const filename = oldImageUrl.split("/images/")[1]; // Extraction du nom de fichier de l'ancienne image
                    fs.unlink(`images/${filename}`, (error) => {
                        // Suppression de l'ancienne image du système de fichiers
                        if (error) {
                            console.error("Error deleting old image:", error);
                        }
                    });
                }
            }

            const options = {
                arrayFilters: [{ "elem.userId": req.auth.userId }], // Filtres pour les mises à jour conditionnelles dans les tableaux
            };

            return Book.updateOne(
                { _id: req.params.id, userId: req.auth.userId }, // Critères de mise à jour
                { $set: updateFields }, // Champs à mettre à jour
                options // Options supplémentaires
            );
        })
        .then((result) => {
            if (result.nModified === 0) {
                return res
                    .status(404)
                    .json({ message: "Book not found or not authorized" }); // Vérification si le livre a été trouvé et modifié avec succès
            }
            res.status(200).json({ message: "Book updated successfully!" }); // Réponse JSON en cas de succès de la mise à jour
        })
        .catch((error) => {
            res.status(400).json({ error }); // Réponse JSON en cas d'erreur
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id }) // Recherche du livre à supprimer par son identifiant
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: "Not authorized" }); // Vérification de l'autorisation de suppression du livre
            } else {
                const filename = book.imageUrl.split("/images/")[1]; // Extraction du nom de fichier de l'image
                fs.unlink(`images/${filename}`, () => {
                    // Suppression de l'image du système de fichiers
                    Book.deleteOne({ _id: req.params.id }) // Suppression du livre de la base de données
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !", // Réponse JSON en cas de succès de la suppression
                            });
                        })
                        .catch((error) => res.status(401).json({ error })); // Réponse JSON en cas d'erreur
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error }); // Réponse JSON en cas d'erreur
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find() // Récupération de tous les livres dans la base de données
        .then((books) => {
            res.status(200).json(books); // Réponse JSON contenant tous les livres
        })
        .catch((error) => {
            res.status(400).json({
                error: error, // Réponse JSON en cas d'erreur
            });
        });
};

exports.bestRating = (req, res, next) => {
    Book.find() // Récupération de tous les livres dans la base de données
        .sort({ averageRating: "desc" }) // Tri des livres par note moyenne décroissante
        .then((books) => res.status(200).json(books.splice(0, 3))) // Réponse JSON contenant les 3 premiers livres avec la meilleure note moyenne
        .catch((error) => res.status(400).json({ error })); // Réponse JSON en cas d'erreur
};

exports.ratingBook = (req, res, next) => {
    const url = req.url; // URL de la requête
    const urlId = url.split("/")[1]; // Identifiant extrait de l'URL
    const bookFilter = { _id: urlId }; // Filtre pour trouver le livre à noter
    const updatedUserId = req.body.userId; // Identifiant de l'utilisateur qui donne la note
    const updatedGrade = req.body.rating; // Note donnée par l'utilisateur

    const updatedData = {
        userId: updatedUserId,
        grade: updatedGrade,
    }; // Données de la note à ajouter

    Book.findOneAndUpdate(
        bookFilter, // Filtre pour trouver le livre à mettre à jour
        { $push: { ratings: updatedData } }, // Ajout de la note à la liste des notes du livre
        { new: true } // Option pour retourner le livre mis à jour
    )
        .then((updatedBook) => {
            const totalRatings = updatedBook.ratings.length; // Nombre total de notes
            const ratingsSum = updatedBook.ratings.reduce(
                (acc, rating) => acc + rating.grade,
                0
            ); // Somme des notes
            updatedBook.averageRating = (ratingsSum / totalRatings).toFixed(0); // Calcul de la note moyenne arrondie

            return updatedBook.save(); // Sauvegarde du livre mis à jour
        })
        .then((book) => {
            res.status(200).json(book); // Réponse JSON contenant le livre mis à jour
        })
        .catch((error) => res.status(400).json({ error })); // Réponse JSON en cas d'erreur
};
