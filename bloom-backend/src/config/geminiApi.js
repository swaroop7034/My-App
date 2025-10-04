import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY, // Keep API key safe
});

export async function fetchSpeciesDetails(speciesName, lat, lon) {
  try {
    let queryText;

    if (!speciesName || speciesName.trim() === "") {
      // Ask Gemini to find a famous flowering plant for the given location
      queryText = `Given the latitude ${lat} and longitude ${lon}, 
      tell me the most famous flowering plant or flower that blooms there, 
      and give a detailed description including habitat, flowering season, and significance, in about 150 words.`;
    } else {
      // Ask Gemini for the species details
      queryText = `Give me a detailed description of the species "${speciesName}" including habitat, flowering season, and significance, in about 150 words.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: queryText,
    });

    return response?.text || "No details available.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Error fetching species details.";
  }
}
