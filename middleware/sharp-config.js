const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const sharpMiddleware = (req, res, next) => {
    const buffer = req.file.buffer; // Récupération du buffer du fichier

    // Détermination du taux de compression en fonction du type de fichier
    const compressionRate = req.file.mimetype === "image/webp" ? 100 : 50;

    sharp(buffer)
        .webp({ quality: compressionRate }) // Conversion de l'image en format webp avec le taux de compression spécifié
        .toBuffer((error, buffer) => {
            if (error) {
                return next(error); // Appel du middleware suivant avec une erreur si une erreur s'est produite lors de la conversion
            }

            // Génération du nouveau nom de fichier avec un timestamp
            const oldFileName = path
                .parse(req.file.originalname)
                .name.split(" ")
                .join("_");
            const timestamp = Date.now();
            const newFilename = `${oldFileName}_${timestamp}.webp`;
            req.file.filename = newFilename;

            // Chemin de sauvegarde du fichier
            const savePath = path.join(__dirname, "..", "images", newFilename);

            // Écriture du fichier converti sur le disque
            fs.writeFile(savePath, buffer, (error) => {
                if (error) {
                    return next(error); // Appel du middleware suivant avec une erreur si une erreur s'est produite lors de l'écriture du fichier
                }
                next(); // Appel du middleware suivant sans erreur si le fichier a été correctement sauvegardé
            });
        });
};

module.exports = sharpMiddleware; // Exportation du middleware pour être utilisé dans d'autres routes
