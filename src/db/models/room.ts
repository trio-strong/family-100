import { database } from "../config/mongodb";
import { QuestionType } from "./question";

export type RoomType = {
    id: string;
    name: string;
    scoreA: number;
    scoreB: number;
    tempScoreA: number;
    tempScoreB: number;
    questions: QuestionType[];
    activeQuestion: any;
    answeredTeams: any;
    users: string[];
    teamA: string[];
    teamB: string[];
    currentTurn: any;
    currentTurnIndex: number;
    roomMaster: string;
    currentTurnPlayer: string;
    livesA: number;
    livesB: number;
};

export class Room {
    // INGAT REVISIAN INI
    static async create(room: RoomType) {
        const collection = database.collection("rooms");
        await collection.insertOne(room);
    }

    // Read Room by Id
    // Update Room by Id
    // Delete Room by Id

    // static async delete(room: RoomType) {
    //     const collection = database.collection("rooms");
    //     await collection.deleteOne({
    //         _id: room._id,
    //     });
    // }
    // static async update(room: RoomType) {
    //     const collection = database.collection("rooms");
    //     await collection.deleteOne({
    //         _id: room._id,
    //     });
    // }
}
