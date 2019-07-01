const uuid = require("uuid/v4");
const express = require("express");
const router = express.Router();
const { books } = require("../data/db.json");
const { Book, Author } = require("../models");
const { sequelize } = require("../models/index");

const filterBooksBy = (property, value) => {
  return books.filter(b => b[property] === value);
};

const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.sendStatus(403);
  } else {
    if (authorization === "Bearer my-awesome-token") {
      next();
    } else {
      res.sendStatus(403);
    }
  }
};

router
  .route("/")
  .get(async (req, res) => {
    const { author, title } = req.query;

    if (title) {
      // get only books matching that title
      const books = await Book.findOne({
        where: { title: title },
        include: [Author]
      });

      res.json(books);
    } else if (author) {
      const books = await Book.findAll({
        include: [{ model: Author, where: { name: author } }]
      });
      res.json(books);
    } else {
      const books = await Book.findAll({
        include: [Author]
      });
      res.json(books);
    }
  })

  // Basic POST logic
  // .post(verifyToken, async (req, res) => {
  //   const { title, name } = req.body;
  //   const newBook = await Book.create(
  //     {
  //       title: title,
  //       author: { name: name }
  //     },
  //     { include: [Author] }
  //   );
  //   // book.id = uuid();
  //   res.status(201).json(newBook);
  // });

  // Better POST logic
  // .post(verifyToken, async (req, res) => {
  //   const { title, name } = req.body;
  //   try {
  //     //find if author exist if not create
  //     const [foundAuthor] = await Author.findOrCreate({
  //       where: { name: name }
  //     });
  //     //create a book w/o author
  //     const newBook = await Book.create({ title: title });
  //     await newBook.setAuthor(foundAuthor);
  //     //query again
  //     const newBookWithAuthor = await Book.findOne({
  //       where: { id: newBook.id },
  //       include: [Author]
  //     });
  //     res.status(201).json(newBookWithAuthor);
  //   } catch (ex) {
  //     res.status(400).json({
  //       err: `Author with name = [${req.body.author}] doesn\'t exist.`
  //     });
  //   }
  // });

  // Even better POST logic w transaction code
  .post(verifyToken, async (req, res) => {
    const { title, name } = req.body;

    try {
      //start of transaction
      await sequelize.transaction(async t => {
        //find if author exist if not create
        const [foundAuthor] = await Author.findOrCreate({
          where: { name: name },
          transaction: t
        });
        //create a book w/o author
        const newBook = await Book.create({ title: title }, { transaction: t });
        await newBook.setAuthor(foundAuthor, { transaction: t });
        //query again
        const newBookWithAuthor = await Book.findOne({
          where: { id: newBook.id },
          include: [Author],
          transaction: t
        });
        res.status(201).json(newBookWithAuthor);
      }); // end of transaction
    } catch (ex) {
      res.status(400).json({
        err: `Author with name = [${
          req.body.author
        }] doesn\'t exist. Additional message: ${ex.message}.`
      });
    }
  });

router
  .route("/:id")
  .put(async (req, res) => {
    const book = await Book.findOne({
      where: { id: req.params.id },
      include: [Author]
    });
    if (book) {
      const updated = await book.update({ title: req.body.title });
      res.status(202).json(updated);
    } else {
      res.sendStatus(400);
    }
  })
  .delete(async (req, res) => {
    const book = await Book.destroy({
      where: { id: req.params.id },
      include: [Author]
    });
    if (book === 1) {
      res.status(202);
    } else {
      res.sendStatus(400);
    }
  });

module.exports = router;
