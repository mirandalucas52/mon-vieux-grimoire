const Book = require("../models/Book");

const fs = require("fs");

exports.createBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: req.file
            ? `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            : null,
    });

    book.save()
        .then(() => {
            res.status(201).json({ message: "Objet enregistré !" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({
        _id: req.params.id,
    })
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => {
            res.status(404).json({
                error: error,
            });
        });
};

exports.modifyBook = (req, res, next) => {
    const { title, author, year, genre } = req.body;

    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (!book) {
                return res.status(404).json({ message: "Book not found" });
            }

            if (book.userId !== req.auth.userId) {
                return res.status(403).json({ message: "Not authorized" });
            }

            const oldImageUrl = book.imageUrl;

            const updateFields = {
                title: title,
                author: author,
                year: year,
                genre: genre,
            };

            if (req.file) {
                updateFields.imageUrl = `${req.protocol}://${req.get(
                    "host"
                )}/images/${req.file.filename}`;

                if (oldImageUrl) {
                    const filename = oldImageUrl.split("/images/")[1];
                    fs.unlink(`images/${filename}`, (error) => {
                        if (error) {
                            console.error("Error deleting old image:", error);
                        }
                    });
                }
            }

            const options = {
                arrayFilters: [{ "elem.userId": req.auth.userId }],
            };

            return Book.updateOne(
                { _id: req.params.id, userId: req.auth.userId },
                { $set: updateFields },
                options
            );
        })
        .then((result) => {
            if (result.nModified === 0) {
                return res
                    .status(404)
                    .json({ message: "Book not found or not authorized" });
            }
            res.status(200).json({ message: "Book updated successfully!" });
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(403).json({ message: "Not authorized" });
            } else {
                const filename = book.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: "Objet supprimé !",
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            res.status(200).json(books);
        })
        .catch((error) => {
            res.status(400).json({
                error: error,
            });
        });
};

exports.bestRating = (req, res, next) => {
    Book.find()
        .sort({ averageRating: "desc" })
        .then((books) => res.status(200).json(books.splice(0, 3)))
        .catch((error) => res.status(400).json({ error }));
};

exports.ratingBook = (req, res, next) => {
    const url = req.url;
    const urlId = url.split("/")[1];
    const bookFilter = { _id: urlId };
    const updatedUserId = req.body.userId;
    const updatedGrade = req.body.rating;

    const updatedData = {
        userId: updatedUserId,
        grade: updatedGrade,
    };

    Book.findOneAndUpdate(
        bookFilter,
        { $push: { ratings: updatedData } },
        { new: true }
    )
        .then((updatedBook) => {
            const totalRatings = updatedBook.ratings.length;
            const ratingsSum = updatedBook.ratings.reduce(
                (acc, rating) => acc + rating.grade,
                0
            );
            updatedBook.averageRating = (ratingsSum / totalRatings).toFixed(0);

            return updatedBook.save();
        })
        .then((book) => {
            res.status(200).json(book);
        })
        .catch((error) => res.status(400).json({ error }));
};
