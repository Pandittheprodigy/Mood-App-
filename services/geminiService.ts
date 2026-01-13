
import { GoogleGenAI } from "@google/genai";
import { LogEntry } from "../types";

export const getWellnessInsight = async (logs: LogEntry[]): Promise<string> => {
  // Always use a named parameter for apiKey and use process.env.API_KEY directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Provide a structured summary of the last 15 logs for deeper analysis
  const recentLogsSummary = logs.slice(-15).map(l => ({
    date: l.date,
    category: l.category,
    content: l.notes || JSON.stringify(l.inputData)
  }));

  // Role and constraints are moved to systemInstruction for better model performance.
  const systemInstruction = `
    Role: A sophisticated, gentle wellness guide for a high-end personal sanctuary app.
    Task: Analyze these recent logs and provide a singular, poetic, and encouraging reflection.
    Tone: Sophisticated, handwritten letter style, minimal.
    Constraints: 1-3 sentences maximum. No bullet points. No generic AI phrasing.
  `;

  const contents = `Data: ${JSON.stringify(recentLogsSummary)}\n\nOutput Format: Just the reflection text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    // Extracting text output from GenerateContentResponse using the .text property.
    const responseText = response.text;
    return (responseText ? responseText.trim() : null) || "May the stillness of today bring you the clarity you seek.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The path to peace is walked one step at a time.";
  }
};
