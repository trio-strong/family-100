import { MongoClient, ServerApiVersion } from "mongodb";
const uri = process.env.MONGO_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version

if (!uri) {
    throw new Error("MongoDB URI is not defined");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export const database = client.db("family-100");
