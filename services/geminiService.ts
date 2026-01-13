
import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

export const getWellnessInsight = async (logs: LogEntry[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Provide a structured summary of the last 15 logs for deeper analysis
  const recentLogsSummary = logs.slice(-15).map(l => ({
    date: l.date,
    category: l.category,
    content: l.notes || JSON.stringify(l.inputData)
  }));

  const prompt = `
    Role: A sophisticated, gentle wellness guide for a high-end personal sanctuary app.
    Task: Analyze these recent logs and provide a singular, poetic, and encouraging reflection.
    Tone: Sophisticated, handwritten letter style, minimal.
    Constraints: 1-3 sentences maximum. No bullet points. No generic AI phrasing.
    
    Data: ${JSON.stringify(recentLogsSummary)}
    
    Output Format: Just the reflection text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text.trim() || "May the stillness of today bring you the clarity you seek.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path to peace is walked one step at a time.";
  }
};
