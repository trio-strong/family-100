import { database } from "../config/mongodb";

export class Room {
    static async create(room) {
        const collection = database.collection("rooms");
        await collection.insertOne(room);
    }

    // Read Room by Id
    static async readById(id) {
        const collection = database.collection("rooms");
        return null;
    }

    // Update Room by Id
    static async updateById(id, room) {
        const collection = database.collection("rooms");
        await collection.updateOne({ _id: id }, { $set: room }); // FOLLOW UP FOR SET THE PROPERTIES
    }

    // Delete Room by Id
    static async deleteById(id) {
        const collection = database.collection("rooms");
        await collection.deleteOne({ _id: id });
    }
}
