const { ObjectId } = require("mongodb");
const database = require("../config/mongodb");

module.exports = class Room {
  static async create(room) {
    const collection = database.collection("rooms");
    await collection.insertOne(room);
  }

  // Read Room by Id
  static async readById(id) {
    const collection = database.collection("rooms");
    const room = await collection.findOne({ _id: new ObjectId(String(id)) });
    return room;
  }

  // Read Room by Id
  static async getAll() {
    const collection = database.collection("rooms");
    const rooms = await collection.find().toArray();
    return rooms;
  }

  // Update Room by Id
  static async updateById(id, room) {
    const collection = database.collection("rooms");
    await collection.updateOne(
      { _id: new ObjectId(String(id)) },
      { $set: room }
    ); // FOLLOW UP FOR SET THE PROPERTIES
  }

  // Delete Room by Id
  static async deleteById(id) {
    const collection = database.collection("rooms");
    await collection.deleteOne({ _id: id });
  }
};
