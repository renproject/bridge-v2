require("dotenv").config();
const crowdin = require("@crowdin/crowdin-api-client").default;

const credentials = {
  token: process.env.CROWDIN_API_TOKEN,
};

module.exports.projectId = 466534;

module.exports.client = new crowdin(credentials);

const errorHandler = (ex) => {
  console.error("Error", ex);
  if (ex.errors) {
    ex.errors.forEach(errorHandler);
  }
  if (ex.error) {
    console.error("SubError", ex.error);
    if (ex.error.errors) {
      ex.error.errors.forEach(errorHandler);
    }
  }
};

module.exports.errorHandler = errorHandler;
