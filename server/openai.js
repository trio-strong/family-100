// import { OpenAI } from "openai";
const { OpenAI } = require("openai");
require("dotenv").config();

// export default async function openAI(
class OpenAIClass {
  static openai() {
    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      });
      return openai;
    } catch (error) {
      console.error(error);
    }
  }

  static async createQuestion(category, totalQuestion) {
    try {
      const completion = await this.openai().chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
            Buat ${totalQuestion} pertanyaan seperti family 100 dengan kategori ${category}, dan buat menjadi format sebagai berikut:
                [{id: serial,question: "",answers: [{answer: "",score: point,revealed: false}}]}]
            `,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      return completion.choices[0].message.content ?? "";
    } catch (error) {
      console.error(error);
    }
  }

  // 1 hit, return array
  static async compareAnswer(answerByUser, realAnswer) {
    try {
      const completion = await this.openai().chat.completions.create({
        messages: [
          {
            role: "system",
            content: `
              Saya memiliki jawaban: ${answerByUser}. Di bawah ini adalah kumpulan data yang terdiri dari kata atau frase:
              ${realAnswer}

              Tolong evaluasi kata atau frase mana yang paling sesuai dengan ${answerByUser} berdasarkan kemiripannya. Keluarkan hasilnya dalam format JSON sebagai berikut:
              {
              "status": boolean, # Apakah ada kemiripan atau tidak
              "matched": "<kata atau frase terdekat>", # Kata atau frase yang paling sesuai
              "percentage": <nilai kemiripan dalam persentase> # Persentase kemiripan
              }
          `,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      // Compare answer Precision
      const result = completion.choices[0].message.content;

      return JSON.parse(result);
    } catch (error) {
      console.error(error);
    }
  }
}

// OpenAIClass.createQuestion("film horor", 5).then(console.log);
// OpenAIClass.compareAnswer(answerByUser, realAnswer).then(console.log);

module.exports = OpenAIClass;
