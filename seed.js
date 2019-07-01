const { Author, Book } = require("./models");

const createAuthorsAndBooks = async () => {
  await Author.create(
    {
      name: "George Orwell",
      books: [{ title: "Animal Farm" }, { title: "1984" }]
    },
    { include: [Book] }
  );
  await Author.create(
    {
      name: "Aldous Huxley",
      books: [{ title: "Brave New World" }]
    },
    { include: [Book] }
  );
};

module.exports = createAuthorsAndBooks;
