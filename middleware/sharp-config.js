const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sharpMiddleware = (req, res, next) => {
    //Vérifie la présence d'un fichier
    if (req.file) {
        const buffer = req.file.buffer;
        const compressionRate = 50;

        // Si l'image est au format webp, on enregistre sans compresser
        if (req.file.mimetype === "image/webp") {
            sharp(buffer).toBuffer((error, buffer) => {
                if (error) {
                    return next(error);
                }
                // Modifie le nom de fichier entrant
                const oldFileName = path
                    .parse(req.file.originalname)
                    .name.split(" ")
                    .join("_");

                // Crée le nouveau nom de fichier avec extension webp
                const timestamp = Date.now();
                const newFilename = `${oldFileName}_${timestamp}.webp`;

                // Modifie la requête avec le nouveau nom
                req.file.filename = newFilename;

                // Enregistre l'image dans le dossier "images"
                const savePath = path.join(
                    __dirname,
                    "..",
                    "images",
                    newFilename
                );
                fs.writeFile(savePath, buffer, (error) => {
                    if (error) {
                        return next(error);
                    }
                    next();
                });
            });
        } else {
            // Si png, jpg, jpeg, on convertit en webp et compresse de 50%
            sharp(buffer)
                .webp({ quality: compressionRate })
                .toBuffer((error, buffer) => {
                    if (error) {
                        return next(error);
                    }
                    const oldFileName = path
                        .parse(req.file.originalname)
                        .name.split(" ")
                        .join("_");
                    const timestamp = Date.now();
                    const newFilename = `${oldFileName}_${timestamp}.webp`;
                    req.file.filename = newFilename;
                    const savePath = path.join(
                        __dirname,
                        "..",
                        "images",
                        newFilename
                    );
                    fs.writeFile(savePath, buffer, (error) => {
                        if (error) {
                            return next(error);
                        }
                        next();
                    });
                });
        }
    } else {
        next();
    }
};

module.exports = sharpMiddleware;
