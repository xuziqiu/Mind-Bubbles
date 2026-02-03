import { GoogleGenAI, Type } from "@google/genai";

export const brainstormSubNodes = async (
  text: string, 
  lang: 'zh' | 'en',
  apiKey: string,
  baseUrl?: string
): Promise<string[]> => {
  // If no API key is provided, we cannot proceed.
  if (!apiKey) {
      console.warn("Brainstorming skipped: No API Key provided.");
      return [];
  }

  try {
    const clientOptions: any = { apiKey };
    
    // If a custom base URL is provided, use it.
    if (baseUrl && baseUrl.trim()) {
        clientOptions.baseUrl = baseUrl.trim();
    }

    const ai = new GoogleGenAI(clientOptions);

    const prompt = lang === 'zh'
      ? `针对主题 "${text}"，给出 5 个简短的、有启发性的发散思维关键词或短语（每个不超过10个字）。请直接返回一个纯 JSON 字符串数组。`
      : `Generate 5 short, insightful brainstorming keywords or phrases (max 5 words each) related to the topic "${text}". Return a pure JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text || '[]';
    const json = JSON.parse(jsonText);
    
    if (Array.isArray(json)) {
        // Ensure we only return strings and limit to 5
        return json.filter(item => typeof item === 'string').slice(0, 5);
    }
    return [];
  } catch (error) {
    console.error("Brainstorming failed:", error);
    // Return empty array to handle error gracefully in UI
    return [];
  }
};