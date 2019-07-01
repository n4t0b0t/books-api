const Sequelize = require("sequelize");

let sequelize;

const currentEnv = process.env.NODE_ENV || "development";

if (currentEnv === "production") {
  sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: "postgres" });
} else {
  sequelize = new Sequelize("booksapi", "postgres", "", {
    dialect: "postgres"
  });
}

// init models
const models = {
  Book: sequelize.import("./book"),
  Author: sequelize.import("./author")
};

// call assoc method in each model
Object.keys(models).forEach(key => {
  if ("associate" in models[key]) {
    models[key].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
