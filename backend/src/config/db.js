//Configure the db connection
const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI; 
const DB_NAME = process.env.DB_NAME;

let client;
let db;

async function connectDB() {
    try {
    client = new MongoClient(MONGO_URI);
    await client.connect();                       // 1) wait for connect
    db = client.db(DB_NAME);
    console.log("Mongo connected");
    return db;
    //const PORT = process.env.PORT || 5003;
    //app.listen(PORT, () => console.log(`API on ${PORT}`));
  } catch (err) {
    console.error("Mongo connection failed:", err);
    process.exit(1);
  }
}


module.exports = {connectDB};
