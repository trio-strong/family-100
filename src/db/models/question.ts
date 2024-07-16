import { database } from "../config/mongodb";

export type Answers = {
    answer: string;
    score: number;
    revealed: boolean;
};

export type QuestionType = {
    _id: any;
    question: string;
    answers: Answers[];
    category: string;
};

export class Question {
    static async create(question: QuestionType) {
        const collection = database.collection("questions");
        await collection.insertOne(question);
    }

    // Read by category
    // No revealed property
}
