
import { GoogleGenAI, Type } from "@google/genai";
import { Expense, Category, SpendingInsight, ParsedExpense } from "../types";

const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY || '' });

export const analyzeSpending = async (expenses: Expense[]): Promise<SpendingInsight> => {
  if (expenses.length === 0) {
    return {
      summary: "Add your first transaction to unlock smart financial forecasting!",
      suggestions: ["Start with groceries or fuel", "Set a monthly budget"],
      topSpendingCategory: "N/A"
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const expenseData = expenses.map(e => ({
    amount: e.amount,
    category: e.category,
    date: e.date,
    desc: e.description
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Today is ${today}. Analyze these expenses: ${JSON.stringify(expenseData)}. 
    1. Provide a concise summary.
    2. Suggest 3 specific actions.
    3. Identify the top category.
    4. Forecast the end-of-month spend based on current velocity.
    5. List any "anomalies" or unusual spikes.`,
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
          topSpendingCategory: { type: Type.STRING },
          forecastedTotal: { type: Type.NUMBER },
          anomalies: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["summary", "suggestions", "topSpendingCategory"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}') as SpendingInsight;
  } catch (e) {
    console.error("AI Insights Error:", e);
    return {
      summary: "Working on your financial roadmap...",
      suggestions: [],
      topSpendingCategory: "Processing"
    };
  }
};

export const parseRawExpense = async (input: string): Promise<ParsedExpense> => {
  const categories = Object.values(Category).join(", ");
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Context: Today is ${dayName}, ${todayStr}. Parse: "${input}". 
    Rules: 
    - Category must be from: ${categories}. 
    - Date must be YYYY-MM-DD. Handle relative terms like 'yesterday' or 'last Friday'.`,
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
    return {};
  }
};
