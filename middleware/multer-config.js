const multer = require("multer"); // Importation du module multer pour la gestion des fichiers multipart

// Fonction de vérification du fichier qui n'accepte que les types jpeg, jpg, png et webp
const fileFilter = function (req, file, callback) {
    console.log(req);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]; // Types de fichiers acceptés
    if (!allowedTypes.includes(file.mimetype)) {
        // Vérification du type de fichier
        const error = new Error("Type de fichier non-accepté");
        error.code = "LIMIT_FILE_TYPES";
        return callback(error, false); // Appel du callback avec une erreur si le type de fichier n'est pas accepté
    }
    callback(null, true); // Appel du callback sans erreur si le type de fichier est accepté
};

const storage = multer.memoryStorage(); // Configuration du stockage en mémoire pour les fichiers

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
}); // Création d'un objet multer avec les options de stockage et de filtrage des fichiers

module.exports = upload.single("image"); // Exportation du middleware multer configuré pour traiter un seul fichier avec le champ "image"
