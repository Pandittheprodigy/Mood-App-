
import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

export const getWellnessInsight = async (logs: LogEntry[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Prepare a brief summary of the last 10 logs to provide context
  const recentLogs = logs.slice(-10).map(l => ({
    date: l.date,
    category: l.category,
    data: JSON.stringify(l.inputData)
  }));

  const prompt = `
    You are a gentle, supportive wellness coach. 
    Analyze the following recent wellness logs and provide a short (2-3 sentence) encouraging insight or reflection.
    Focus on patterns or simply offer a peaceful thought for the day.
    
    Recent logs: ${JSON.stringify(recentLogs)}
    
    Style: Minimal, classic, sophisticated, like a handwritten note.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "May you find peace and clarity in your journey today.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path to wellness is built one gentle step at a time.";
  }
};
