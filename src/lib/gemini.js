import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini AI client
// Ensure VITE_GEMINI_API_KEY is available in the environment variables
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiModel = () => {
    return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

/**
 * Triages a specific civic complaint using Gemini to automatically determine its priority.
 *
 * @param {string} issueType - The category (e.g., 'bulk_waste', 'overflowing_bin')
 * @param {string} description - The user provided problem description
 * @returns {Promise<string>} - Returns 'critical', 'high', 'medium', or 'low'
 */
export async function triageComplaintPriority(issueType, description) {
    if (!apiKey) {
        console.warn("Gemini API Key missing. Defaulting to 'medium' priority.");
        return "medium";
    }

    const prompt = `
    You are an AI civic triage assistant for Madurai City Corporation.
    Evaluate the following cleanliness/waste complaint and assign ONE priority level.
    
    Issue Category: ${issueType}
    User Description: ${description || "No description provided."}
    
    Rules for Priority:
    - 'critical' if it poses immediate severe health/safety risks (e.g., large animal carcass, massive sewage overflow on main road).
    - 'high' if it heavily impacts public spaces (e.g., overflowing bin in a market, large bulk waste blocking paths).
    - 'medium' for standard miss occurrences (e.g., missed door-to-door collection, dirty public toilet).
    - 'low' for minor, non-urgent issues.

    Respond with ONLY ONE word strictly lowercase: critical, high, medium, or low.
  `;

    try {
        const model = getGeminiModel();
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim().toLowerCase();

        // Ensure the output perfectly matches the Supabase ENUM constraints
        if (['critical', 'high', 'medium', 'low'].includes(responseText)) {
            return responseText;
        }
        return "medium";
    } catch (error) {
        console.error("Gemini triage failed:", error);
        return "medium";
    }
}
