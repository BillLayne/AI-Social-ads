

import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AdCreative, AspectRatio, SocialMediaCopy, ArtisticStyle } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface SpriteSheetResponse {
  spriteSheet: string;
  frameDuration: number;
}

const base64ToInlineData = (base64: string) => {
    const [header, data] = base64.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1];
    if (!mimeType || !data) {
        throw new Error("Invalid base64 image format");
    }
    return { inlineData: { data, mimeType } };
};

export const enhancePrompt = async (prompt: string): Promise<string> => {
  try {
    const fullPrompt = `You are a master prompt engineer and creative director specializing in humorous, eye-catching, and brand-safe social media ads for an insurance company.

    Your task is to take a simple ad scene idea and expand it into a rich, detailed, and vivid prompt for an AI image generator. The enhanced prompt should guide the AI to create a visually stunning image that is funny, relatable, and subtly hints at the need for auto or home insurance.

    When enhancing, focus on:
    - **Humor:** Exaggerate the situation for comedic effect.
    - **Visual Detail:** Add specific details about the subject, setting (e.g., modern living room, suburban street), lighting (e.g., dramatic morning light, soft ambient glow), colors, and textures.
    - **Composition:** Suggest a camera angle or shot type (e.g., close-up, dynamic low-angle shot).
    - **Brand Safety:** Ensure the image is lighthearted and avoids depicting serious harm or distress.

    Keep the core idea intact. The output must be a single string, which is the enhanced prompt itself, without any extra text, labels, or quotation marks.

    Here's an example of how to transform an idea:

    **Original idea:** "A cat knocking over a vase."
    **Enhanced prompt:** "A cinematic, highly detailed close-up shot of a fluffy calico cat, eyes wide with comical guilt, caught mid-action with one paw extended towards a toppling antique porcelain vase. Shards of the vase are just beginning to fly, suspended in the air. The scene is set in a beautifully lit, elegant living room with soft morning light streaming through a window, highlighting the dust motes and the cat's fur. The style should be photorealistic with a slightly exaggerated, humorous expression on the cat's face."

    Now, enhance the following idea:

    **Original idea:** "${prompt}"
    `;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text.trim();
  } catch (error: any) {
    console.error("Error enhancing prompt:", error);
    throw new Error(error.message || "Failed to enhance the prompt. Please try again.");
  }
};

export const generateAdImage = async (creative: AdCreative): Promise<string[]> => {
  try {
    const corePrompt = `A humorous and eye-catching social media ad scene for auto or home insurance. The scene depicts: ${creative.prompt}. The image must be shareable and brand-safe.`;

    const stylePrompts: Partial<Record<ArtisticStyle, string>> = {
      [ArtisticStyle.THREE_D_RENDER]: `A hyperrealistic, cinematic 8K masterpiece of an insurance ad scene. Shot on 70mm film with a prime lens creating a shallow depth of field and beautiful bokeh. The scene is rendered with photorealistic precision, emulating an Unreal Engine 5 render with advanced ray tracing. Features ultra-detailed textures, intricate subsurface scattering, and volumetric lighting. ${corePrompt}. The composition adheres to the rule of thirds. The scene is bathed in dramatic, cinematic lighting (e.g., golden hour or moody studio lights) with strong rim lighting to highlight contours. The color grading is rich and deep. Every detail is in tack-sharp focus.`,
      [ArtisticStyle.PIXAR]: `A whimsical 4D Pixar-Disney animation style 3D cartoon image, emulating the look of a high-end animated film. The scene is clear, sharp, and detailed, with contrasting light and exaggerated deep shadows creating a sense of depth. The color palette is vibrant and clean, avoiding any yellow tint. The image features realistic framing, a shallow depth of field, and natural lighting to enhance the cartoon-realistic style. ${corePrompt}`,
      [ArtisticStyle.CARICATURE]: `A hyper-realistic 3D caricature. The main subject should have an oversized expressive head and a smaller body, in a dynamic and funny pose. Rendered with studio lighting, cartoonish proportions, Pixar-style 3D rendering, and ultra-detailed textures on fabric and skin. 8K resolution. ${corePrompt}`,
      [ArtisticStyle.ACTION_FIGURE]: `A highly detailed, articulated action figure in its original plastic and cardboard packaging. The packaging has colorful, retro-style graphics and branding. The action figure is posed dynamically inside the plastic bubble. The scene has professional studio lighting, creating sharp highlights and soft shadows, making the toy look brand new and collectible. ${corePrompt}`,
    };

    const fullPrompt = stylePrompts[creative.artisticStyle] || `An eye-catching, high-resolution, ${creative.artisticStyle.toLowerCase()} image for a social media ad. ${corePrompt}`;
    
    const config: any = {
      numberOfImages: creative.numberOfImages,
      outputMimeType: 'image/jpeg',
      aspectRatio: creative.aspectRatio,
    };

    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: fullPrompt,
      config: config,
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error: any) {
    console.error("Error generating image:", error);
    throw new Error(error.message || "Failed to generate image. Please check your prompt or API key.");
  }
};

export const editAdImage = async (base64Image: string, editPrompt: string): Promise<string> => {
    try {
        const imagePart = base64ToInlineData(base64Image);
        const textPart = { text: editPrompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        throw new Error("No edited image was returned from the API.");

    } catch (error: any) {
        console.error("Error editing image:", error);
        throw new Error(error.message || "Failed to edit the image. Please try again.");
    }
};

export const generateSocialMediaCopy = async (adCreative: AdCreative): Promise<SocialMediaCopy> => {
  try {
    const prompt = `
      You are a witty social media manager for a fun and modern insurance company.
      Your task is to create a social media post for a humorous ad.

      The ad's visual is described as: "${adCreative.prompt}"
      The text overlay on the ad says: "${adCreative.adCopy}"

      Based on this, generate the following content in JSON format:
      1. A short, engaging, and humorous caption (1-2 sentences).
      2. A string of 3-5 relevant and fun emojis.
      3. A string of 5-7 relevant hashtags, starting with '#' and separated by spaces.
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
              description: "A short, engaging, and humorous caption (1-2 sentences)."
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
        },
      },
    });

    const jsonString = response.text;
    const parsed = JSON.parse(jsonString);
    return parsed as SocialMediaCopy;

  } catch (error: any) {
    console.error("Error generating social media copy:", error);
    throw new Error(error.message || "Failed to generate social media copy. Please try again.");
  }
};

export const generateAdIdeas = async (): Promise<string[]> => {
  try {
    const prompt = `
      You are a creative director for an insurance company that has a humorous and modern brand voice.
      Generate a list of 5 funny, clever, and brand-safe ad scene ideas for social media.
      The ideas should subtly hint at the need for home or auto insurance without being scary or negative.
      Focus on relatable, everyday mishaps that can be exaggerated for comedic effect.

      Examples:
      - A raccoon hosting a rave in an attic.
      - A self-driving car that has developed a rebellious teenage personality and refuses to park properly.
      - A garden gnome that has come to life and is redecorating the entire lawn in a tacky way.

      Return the ideas as a JSON array of strings.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    const jsonString = response.text;
    const ideas = JSON.parse(jsonString);
    return ideas as string[];

  } catch (error: any) {
    console.error("Error generating ad ideas:", error);
    throw new Error(error.message || "Failed to generate ad ideas. Please try again.");
  }
};

export const generateSpriteSheet = async (base64Image: string, animationPrompt: string): Promise<SpriteSheetResponse> => {
    try {
        const imagePart = base64ToInlineData(base64Image);
        const textPart = { text: `Based on this starting image, create a 3x3 sprite sheet of a short, looping animation that illustrates the following action: "${animationPrompt}". The sprite sheet should show 9 sequential frames, arranged in a 3x3 grid, read from left-to-right, top-to-bottom. The animation should be subtle and smooth. The background and static elements of the original image should remain consistent across all frames. Output a single JPG image containing the full 3x3 sprite sheet.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const spriteSheet = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    // Assuming a standard frame duration, as the model doesn't return this.
                    const frameDuration = 120; // in milliseconds
                    return { spriteSheet, frameDuration };
                }
            }
        }
        
        throw new Error("No sprite sheet was returned from the API.");

    } catch (error: any) {
        console.error("Error generating sprite sheet:", error);
        throw new Error(error.message || "Failed to generate the animation. The model may not have been able to fulfill the request.");
    }
};