"use strict";
import { MongoClient, ServerApiVersion } from "mongodb";
import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import userRoutes from './route/route.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 8080;
const connectionURI = "mongodb://127.0.0.1:27017?retryWrites=true&w=majority";

let database, collection;

const client = new MongoClient(connectionURI, { 
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationError: true,
    }
});

async function connectToDatabase() {
    try {
        await client.connect();
        database = client.db("Coursework_2");
        collection = database.collection("userData");
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Failed to connect to MongoDB: ", error);
    }
}


app.use(express.json());
app.use(express.static("Public"));

app.use((req, res, next) => {
    if (!collection) {
        return res.status(500).json({ error: "Database connection not established." });
    }
    req.collection = collection;
    next();
});

app.get("/M00857241", (req, res) => {
    const filePath = path.join(__dirname, "Public", "index.html");
    res.sendFile(filePath);
});

app.use("/M00857241", userRoutes);

app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server listening on http://localhost:${port}`);
});