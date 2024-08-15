const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;
console.log("MONGODB_URI:", uri); // Add this line for debugging

if (!uri) {
  console.error("MONGODB_URI is not defined in the environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
}

connectToDatabase();

app.get("/api/garbageData", async (req, res) => {
  try {
    const database = client.db("garbageTracker");
    const collection = database.collection("garbageData");
    const data = await collection.findOne({});
    res.json(data ? data.data : {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching data" });
  }
});

app.post("/api/garbageData", async (req, res) => {
  try {
    const database = client.db("garbageTracker");
    const collection = database.collection("garbageData");
    await collection.updateOne(
      {},
      { $set: { data: req.body } },
      { upsert: true }
    );
    res.json({ message: "Data saved successfully" });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Error saving data" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
