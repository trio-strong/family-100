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
            Buat ${totalQuestion} pertanyaan seperti family 100 dengan kategori ${category} dengan masing-masing minimal 3 sampai 7 jawaban, dan buat menjadi format json sebagai berikut:
              [
                {
                  id: serial,question: "", 
                  answers: [
                    {answer: "",score: point}
                    ]
                }
              ]
            `,
          },
        ],
        model: "gpt-3.5-turbo",
      });

      console.log(completion.choices[0].message.content);
      console.log("\n\n\n");
      const result = safeJsonParse(completion.choices[0].message.content);

      return result;
    } catch (error) {
      console.error(error);
    }
  }

  // 1 hit, return array
  static async compareAnswer(answerByUser, realAnswer) {
    try {
      let stringAnswers = "";
      realAnswer.forEach((a, idx) => {
        stringAnswers += `${idx + 1}. ${a}. `;
      });

      const completion = await this.openai().chat.completions.create({
        messages: [
          {
            role: "user",
            content: `
              Saya memiliki kata atau frasa: ${answerByUser}. Di bawah ini adalah kumpulan data yang terdiri dari list kata atau frase:
              ${stringAnswers}

              Tolong evaluasi kata atau frase mana dari kumpulan list tersebut yang paling mirip dengan jawaban tersebut berdasarkan maknanya. Keluarkan hasilnya dalam format JSON sebagai berikut:
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

      return safeJsonParse(result);
    } catch (error) {
      console.error(error);
    }
  }
}

function safeJsonParse(jsonString) {
  try {
    // Replace non-JSON characters and fix common issues
    jsonString = jsonString.replace(/[\n\r\t]/g, ""); // Remove newlines, carriage returns, and tabs
    jsonString = jsonString.replace(/,(\s*[}\]])/g, "$1"); // Remove trailing commas
    jsonString = jsonString.replace(
      /(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g,
      '"$2":'
    ); // Ensure all keys are double-quoted

    // Attempt to parse the JSON string
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON string:", error);
    return null; // Return null or handle the error as needed
  }
}

module.exports = OpenAIClass;
