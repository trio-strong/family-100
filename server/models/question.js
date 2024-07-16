import { database } from "../config/mongodb";

export class Question {
    static async create(question) {
        const collection = database.collection("questions");
        await collection.insertOne(question);
    }

    // Read Question by Id
    static async readById(id) {
        const collection = database.collection("questions");
    }
}
