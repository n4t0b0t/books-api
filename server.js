const app = require("./app");
const { sequelize } = require("./models"); // don't need to specify file name because it's index.js
const port = process.env.PORT || 5555;
const createAuthorsAndBooks = require("./seed");

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(() => {
  if (eraseDatabaseOnSync) {
    createAuthorsAndBooks();
  }
  app.listen(port, () => {
    if (process.env.NODE_ENV === "production") {
      console.log(`Server is running on Heroku with port number ${port}`);
    } else {
      console.log(`Server is running on http://localhost:${port}`);
    }
  });
});
