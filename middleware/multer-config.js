const multer = require("multer");
const path = require("path");

// Vérifie le fichier entrant et n'accepte que jpeg, jpg, png et webp
const fileFilter = function (req, file, callback) {
    console.log(req);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error("Type de fichier non-accepté");
        error.code = "LIMIT_FILE_TYPES";
        return callback(error, false);
    }
    callback(null, true);
};

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
});

module.exports = upload.single("image");
