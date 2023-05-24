const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const sharpMiddleware = (req, res, next) => {
    const buffer = req.file.buffer;
    const compressionRate = req.file.mimetype === "image/webp" ? 100 : 50;

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
            const savePath = path.join(__dirname, "..", "images", newFilename);

            fs.writeFile(savePath, buffer, (error) => {
                if (error) {
                    return next(error);
                }
                next();
            });
        });
};

module.exports = sharpMiddleware;
