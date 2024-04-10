const { MongoClient } = require("mongodb");
const MONGODB_URI = "mongodb://mongosrv";
const DB_NAME = "expenses";
let cachedDb;

module.exports = {
  connectToDatabase: async () => {
    if (cachedDb) {
      console.log("Cached connection already exists");
      return cachedDb;
    }
    console.log("New DB connection...");
    try {
      const client = await MongoClient.connect(MONGODB_URI);
      const db = client.db(DB_NAME);
      cachedDb = db;
      return db;
    } catch (error) {
      console.log("ERROR aquiring DB connection");
      console.log(error);
      throw error;
    }
  },
};
