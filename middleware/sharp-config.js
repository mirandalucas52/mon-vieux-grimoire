const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sharpMiddleware = (req, res, next) => {
    if (req.file) {
        const buffer = req.file.buffer;
        const compressionRate = 50; // Taux de compression pour les images non webp

        sharp(buffer)
            .webp({
                quality:
                    req.file.mimetype === "image/webp" ? 100 : compressionRate, // Utilise un taux de compression élevé pour les images webp, sinon utilise le taux de compression par défaut
            })
            .toBuffer((error, buffer) => {
                if (error) {
                    return next(error);
                }

                const oldFileName = path
                    .parse(req.file.originalname)
                    .name.split(" ")
                    .join("_"); // Obtient le nom de fichier d'origine sans espaces

                const timestamp = Date.now(); // Obtient un horodatage unique
                const newFilename = `${oldFileName}_${timestamp}.webp`; // Génère un nouveau nom de fichier en ajoutant l'horodatage et l'extension webp

                req.file.filename = newFilename; // Met à jour le nom de fichier dans la requête

                const savePath = path.join(
                    __dirname,
                    "..",
                    "images",
                    newFilename
                ); // Définit le chemin de sauvegarde du fichier

                fs.writeFile(savePath, buffer, (error) => {
                    if (error) {
                        return next(error);
                    }
                    next();
                });
            });
    } else {
        next();
    }
};

module.exports = sharpMiddleware;
