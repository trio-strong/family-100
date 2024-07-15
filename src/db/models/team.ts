import { database } from "../config/mongodb";

export type TeamType = {
    _id: any;
    name: any;
    userId: any;
    roomId: any;
};

export class Room {
    static async create(team: TeamType) {
        const collection = database.collection("teams");
        await collection.insertOne(team.name);
    }

    static async delete(team: TeamType) {
        const collection = database.collection("teams");
        await collection.deleteOne({
            _id: team._id,
        });
    }
}
