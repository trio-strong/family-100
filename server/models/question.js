import { database } from "../config/mongodb";

export class Question {
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
  static async readById(id) {
    const collection = database.collection("questions");
    const data = await collection.findOne({ _id: id });
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
}
