
import { GoogleGenAI, Type } from "@google/genai";
import { Student, PaymentRecord, ClassFeeStructure } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialForecasting = async (
  students: Student[], 
  payments: PaymentRecord[], 
  structures: ClassFeeStructure[]
) => {
  try {
    const totalPayable = students.reduce((acc, s) => {
      const struct = structures.find(st => st.className === s.className);
      return acc + (struct?.total || 0) + s.previousYearDues - s.discount;
    }, 0);
    
    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const pendingAmount = totalPayable - totalCollected;
    
    // Get last 7 days collection
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentCollections = payments
      .filter(p => new Date(p.date) >= weekAgo)
      .reduce((acc, p) => acc + p.amount, 0);

    const context = {
      totalPayable,
      totalCollected,
      pendingAmount,
      recentCollections,
      studentCount: students.length,
      paymentCount: payments.length
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: JSON.stringify(context),
      config: {
        systemInstruction: "You are a Chief Financial Auditor for a school. Analyze the provided JSON data and give a brief 3-point summary: 1. Current Health (Percentage collected), 2. Short-term forecast based on recent collections, 3. One critical action item.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: { type: Type.NUMBER, description: "Collection percentage (0-100)" },
            forecast: { type: Type.STRING },
            actionItem: { type: Type.STRING },
            summary: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["healthScore", "forecast", "actionItem", "summary"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Forecasting Error:", error);
    return null;
  }
};
