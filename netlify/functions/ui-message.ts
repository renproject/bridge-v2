import { Handler } from "@netlify/functions";

const testData = new Date().toISOString();

const handler: Handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World " + testData.toString() }),
  };
};

export { handler };
