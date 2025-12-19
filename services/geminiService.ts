import { GoogleGenAI, Type } from "@google/genai";
import { TempMailApi, GeneratedCode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const API_LIST_MODEL = 'gemini-3-flash-preview';
const CODE_GEN_MODEL = 'gemini-3-pro-preview';

export const fetchTempMailApis = async (): Promise<TempMailApi[]> => {
  const prompt = `
    Find 5 to 7 reliable, free, and currently usable Temporary Email (Disposable Email) APIs.
    Focus on services that are popular among developers (e.g., 1secmail, Mail.tm, Guerrilla Mail, Temp-Mail.org, etc.).
    
    For each API, determine:
    1. Base URL and Auth requirements.
    2. Whether it supports checking the inbox/retrieving messages programmatically ('hasInboxAccess': true) or if it only generates addresses/aliases ('hasInboxAccess': false).
    
    Provide accurate details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: API_LIST_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              website: { type: Type.STRING },
              baseUrl: { type: Type.STRING },
              description: { type: Type.STRING },
              authType: { type: Type.STRING, enum: ['No Auth', 'API Key', 'OAuth'] },
              supportsAttachments: { type: Type.BOOLEAN },
              rateLimit: { type: Type.STRING },
              hasInboxAccess: { type: Type.BOOLEAN, description: "True if API allows reading emails, False if just address generation" },
            },
            required: ['name', 'website', 'baseUrl', 'description', 'authType', 'hasInboxAccess'],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as TempMailApi[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch API list:", error);
    return [];
  }
};

export const generateIntegrationCode = async (api: TempMailApi, language: 'javascript' | 'python' | 'curl'): Promise<GeneratedCode> => {
  const prompt = `
    Generate a robust code example for the "${api.name}" API using ${language}.
    Base URL: ${api.baseUrl}
    Inbox Access: ${api.hasInboxAccess ? "Yes" : "No"}
    
    The code should demonstrate how to:
    1. Generate a new email address.
    2. ${api.hasInboxAccess ? "Check the inbox and retrieve the latest message." : "Print the generated address (API does not support inbox retrieval)."}
    
    Include comments explaining the steps.
  `;

  try {
    const response = await ai.models.generateContent({
      model: CODE_GEN_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            language: { type: Type.STRING },
            code: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ['language', 'code', 'explanation'],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as GeneratedCode;
    }
    throw new Error("No code generated");
  } catch (error) {
    console.error("Failed to generate code:", error);
    return {
      language,
      code: "// Error generating code. Please try again.",
      explanation: "Gemini encountered an error."
    };
  }
};
