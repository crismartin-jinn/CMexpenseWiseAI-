
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category, SpendingInsight, ParsedExpense } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSpending = async (expenses: Expense[]): Promise<SpendingInsight> => {
  if (expenses.length === 0) {
    return {
      summary: "No expenses to analyze yet. Start adding your spending to get AI insights!",
      suggestions: ["Add your first expense", "Categorize accurately"],
      topSpendingCategory: "N/A"
    };
  }

  const expenseData = expenses.map(e => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    desc: e.description
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these expenses and provide a brief financial summary and 3 specific, helpful suggestions to save money or improve budgeting: ${JSON.stringify(expenseData)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          topSpendingCategory: { type: Type.STRING }
        },
        required: ["summary", "suggestions", "topSpendingCategory"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as SpendingInsight;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return {
      summary: "I'm having trouble analyzing your data right now.",
      suggestions: [],
      topSpendingCategory: "Error"
    };
  }
};

export const parseRawExpense = async (input: string): Promise<ParsedExpense> => {
  const categories = Object.values(Category).join(", ");
  const today = new Date().toISOString().split('T')[0];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Parse this expense note into structured data. Input: "${input}". Today is ${today}. Return the amount, category (must be one of: ${categories}), description, and date (YYYY-MM-DD).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          description: { type: Type.STRING },
          date: { type: Type.STRING }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as ParsedExpense;
  } catch (e) {
    console.error("Failed to parse AI expense", e);
    return {};
  }
};
