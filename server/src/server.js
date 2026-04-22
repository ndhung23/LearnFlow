require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/db");
const env = require("./config/env");

connectDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`LearnFlow API running on port ${env.port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });
