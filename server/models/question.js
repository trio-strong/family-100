const { ObjectId } = require("mongodb");
const database = require("../config/mongodb");

module.exports = class Question {
  // Read All Questions: Show all questions.
  // --> Use object .category for index the category
  static async readAll() {
    const collection = database.collection("questions");
    const data = await collection.find().toArray();
    return data;
  }

  static async create(question) {
    const collection = database.collection("questions");
    await collection.insertOne(question);
  }

  // Read Question by Id
  static async readById(_id) {
    const collection = database.collection("questions");
    const data = await collection.findOne({ _id: new ObjectId(String(_id)) });
    return data;
  }

  // Get By Category
  static async readByCategory(category) {
    const collection = database.collection("questions");
    const agg = [
      {
        $match: {
          category: category,
        },
      },
    ];

    const cursor = collection.aggregate(agg);
    const data = await cursor.toArray();
    return data;
  }
};
