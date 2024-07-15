import { database } from "../config/mongodb";

export type UserType = {
    // _id: string;
    // username: string;
    _id: any;
    username: any;
};

export class User {
    static async create(user: UserType) {
        const collection = database.collection("users");
        await collection.insertOne(user.username);
    }

    static async delete(user: UserType) {
        const collection = database.collection("users");
        await collection.deleteOne({
            _id: user._id,
        });
    }
}
