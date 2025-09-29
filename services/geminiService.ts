
import { GoogleGenAI, Type } from "@google/genai";
import { AdCreative, AspectRatio, SocialMediaCopy } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateHumorousImage = async (prompt: string, aspectRatio: AspectRatio): Promise<string> => {
  try {
    const fullPrompt = `A humorous, eye-catching, high-resolution, photorealistic image for a social media ad about insurance. The scene depicts: ${prompt}. The image should be funny and shareable.`;
    
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please check your prompt or API key.");
  }
};

export const generateSocialMediaCopy = async (adCreative: AdCreative): Promise<SocialMediaCopy> => {
  try {
    const prompt = `
      You are a witty social media manager for a fun and modern insurance company.
      Your task is to create a social media post for an ad.

      The ad's visual is described as: "${adCreative.prompt}"
      The text overlay on the ad says: "${adCreative.adCopy}"

      Based on this, generate the following content in JSON format:
      1. A short, humorous, and engaging caption (1-2 sentences).
      2. A string of 3-5 relevant and fun emojis.
      3. A string of 5-7 relevant hashtags, starting with '#' and separated by spaces.

      The tone should be lighthearted, funny, and relatable.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            caption: {
              type: Type.STRING,
              description: "A short, humorous, and engaging caption (1-2 sentences)."
            },
            emojis: {
              type: Type.STRING,
              description: "A string of 3-5 relevant and fun emojis."
            },
            hashtags: {
              type: Type.STRING,
              description: "A string of 5-7 relevant hashtags, starting with '#' and separated by spaces."
            }
          },
          required: ["caption", "emojis", "hashtags"]
        }
      }
    });

    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed as SocialMediaCopy;

  } catch (error) {
    console.error("Error generating social media copy:", error);
    throw new Error("Failed to generate social media copy. Please try again.");
  }
};
