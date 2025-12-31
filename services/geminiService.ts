
import { GoogleGenAI } from "@google/genai";
import { Student, PaymentRecord } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (students: Student[], payments: PaymentRecord[]) => {
  try {
    const totalDues = students.reduce((acc, s) => acc + s.previousYearDues, 0);
    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const summary = `Total students: ${students.length}. Total dues from previous years: ₹${totalDues.toLocaleString('en-IN')}. Total collected this period: ₹${totalCollected.toLocaleString('en-IN')}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this school fee data, provide a 3-sentence summary of financial health and 2 recommendations to improve collection. Data: ${summary}`,
    });

    // Extracting text output from GenerateContentResponse using the .text property
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights unavailable.";
  }
};
