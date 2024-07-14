// import { OpenAI } from "openai";
const { OpenAI } = require("openai");
require("dotenv").config();

// export default async function openAI(
async function openAI(category, totalQuestion) {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `
        Buat ${JSON.stringify(
            totalQuestion
        )} pertanyaan seperti family 100 dengan kategori ${JSON.stringify(
                    category
                )}, dan buat menjadi format sebagai berikut:
            [{id: serial,question: "",answers: [{answer: "",score: point,revealed: false}}]}]
        `,
            },
        ],
        model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content ?? "";
}

module.exports = openAI;
