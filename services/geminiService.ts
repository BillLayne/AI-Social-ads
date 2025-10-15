import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AdCreative, AspectRatio, SocialMediaCopy, ArtisticStyle, Platform, AdIdea, GroundingSource, TrendingAdIdeasResponse, TargetAudience } from "../types";

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

export const enhancePrompt = async (prompt: string, targetAudience: TargetAudience): Promise<string> => {
  try {
    const fullPrompt = `You are a master prompt engineer and creative director specializing in humorous, eye-catching, and brand-safe social media ads for an insurance company.

    Your task is to take a simple ad scene idea and expand it into a rich, detailed, and vivid prompt for an AI image generator. The enhanced prompt should guide the AI to create a visually stunning image that is funny, relatable, and subtly hints at the need for auto or home insurance.

    When enhancing, focus on:
    - **Humor:** Exaggerate the situation for comedic effect.
    - **Visual Detail:** Add specific details about the subject, setting (e.g., modern living room, suburban street), lighting (e.g., dramatic morning light, soft ambient glow), colors, and textures.
    - **Composition:** Suggest a camera angle or shot type (e.g., close-up, dynamic low-angle shot).
    - **Brand Safety:** Ensure the image is lighthearted and avoids depicting serious harm or distress.
    - **Audience Resonance:** The style and subject matter should resonate with the target audience: **${targetAudience}**. For example, for Gen Z, you might incorporate meme culture or vibrant, trendy aesthetics. For Boomers, a more classic, nostalgic feel might be appropriate.

    Keep the core idea intact. The output must be a single string, which is the enhanced prompt itself, without any extra text, labels, or quotation marks.

    Here's an example of how to transform an idea:

    **Original idea:** "A cat knocking over a vase."
    **Enhanced prompt:** "A cinematic, highly detailed close-up shot of a fluffy calico cat, eyes wide with comical guilt, caught mid-action with one paw extended towards a toppling antique porcelain vase. Shards of the vase are just beginning to fly, suspended in the air. The scene is set in a beautifully lit, elegant living room with soft morning light streaming through a window, highlighting the dust motes and the cat's fur. The style should be photorealistic with a slightly exaggerated, humorous expression on the cat's face."

    Now, enhance the following idea for a **${targetAudience}** audience:

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

export const generateAdVideo = async (creative: AdCreative): Promise<string> => {
  try {
    const corePrompt = `A humorous and eye-catching social media video ad scene for auto or home insurance. The scene depicts: ${creative.prompt}. The video must be short (5-10 seconds), shareable, and brand-safe. Style: ${creative.artisticStyle}. The aspect ratio should be ${creative.aspectRatio}.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: corePrompt,
      config: {
        numberOfVideos: 1,
      }
    });

    while (!operation.done) {
      // Wait for 10 seconds before checking the status again
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.response?.generatedVideos?.[0]?.video?.uri) {
      const downloadLink = operation.response.generatedVideos[0].video.uri;
      // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
      const response = await fetch(`${downloadLink}&key=${API_KEY}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.statusText}`);
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } else {
      throw new Error("Video generation completed, but no video URI was found.");
    }
  } catch (error: any) {
    console.error("Error generating video:", error);
    throw new Error(error.message || "Failed to generate video. Please try again.");
  }
};


export const editAdImage = async (base64Image: string, editPrompt: string): Promise<string> => {
    try {
        const imagePart = base64ToInlineData(base64Image);
        const textPart = { text: editPrompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
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
    const platformSpecificInstructions: Record<Platform, string> = {
      [Platform.INSTAGRAM]: `**Instagram:** Focus on a slightly longer, more story-driven caption. Use 3-5 relevant and engaging emojis. Generate a block of 10-15 strategic hashtags, including a mix of popular and niche ones.`,
      [Platform.FACEBOOK]: `**Facebook:** Write a versatile, conversational caption that encourages comments and shares (e.g., ask a question). Use 2-4 emojis. Generate 3-5 broad hashtags.`,
      [Platform.LINKEDIN]: `**LinkedIn:** Generate a professional, value-driven caption. Use minimal and professional emojis (e.g., 💡, ✅, 👉). Generate 3-5 industry-specific hashtags. The tone should be insightful and business-oriented.`,
      [Platform.X_TWITTER]: `**X/Twitter:** Create a very short, punchy, and direct caption (under 280 characters). Use 1-2 relevant emojis. Generate 2-3 key hashtags.`,
      [Platform.TIKTOK]: `**TikTok:** Write a short, trendy, and attention-grabbing caption. Use 2-3 trending emojis. Generate 4-6 relevant and trending hashtags. The caption should be concise and complement a video format.`
    };

    const audienceSpecificInstructions: Record<TargetAudience, string> = {
        [TargetAudience.GEN_Z]: `**Gen Z (18-26):** Use a very casual, ironic, or self-deprecating tone. Incorporate relevant slang (e.g., 'bet', 'no cap', 'iykyk', 'the vibes are off'). Use Gen Z-favored emojis like 💀, ✨, 🫠, 😭, 😂. Hashtags should tap into meme culture and TikTok trends. Keep captions short and punchy.`,
        [TargetAudience.MILLENNIALS]: `**Millennials (27-42):** Use relatable humor, often about 'adulting', nostalgia, or everyday struggles. A conversational, slightly longer caption works well. Emojis like 😂, 😭, 🤯, 👍 are common. Hashtags can be a mix of broad and niche community tags.`,
        [TargetAudience.GEN_X]: `**Gen X (43-58):** Adopt a straightforward, witty, or slightly sarcastic tone. Less is more with emojis; stick to classics like 👍, 😉, or none at all. Captions can be direct. Hashtags should be clear and to the point.`,
        [TargetAudience.BOOMERS]: `**Boomers (59+):** Use a clear, positive, and sincere tone. Keep language simple and direct. Use minimal, classic emojis like 👍, 😊. Captions should be easy to read. The call to action must be very explicit and straightforward.`,
    };

    const prompt = `
      You are an expert social media manager for a fun and modern insurance company.
      Your task is to create a social media post for an ad, specifically tailored for the **${adCreative.platform}** platform and a **${adCreative.targetAudience}** audience.

      **Ad Details:**
      - **Visual Description:** "${adCreative.prompt}"
      - **Text Overlay on Ad:** "${adCreative.adCopy}"

      **Platform-Specific Guidelines:**
      ${platformSpecificInstructions[adCreative.platform]}

      **Audience-Specific Tone & Style Guidelines:**
      ${audienceSpecificInstructions[adCreative.targetAudience]}

      Based on all this information, generate the following content in a single JSON object:
      1.  **caption:** The platform-optimized and audience-tailored caption.
      2.  **emojis:** A string of the generated emojis that fit the audience and platform.
      3.  **hashtags:** A string of the generated hashtags, starting with '#' and separated by spaces.
      4.  **cta:** A compelling and relevant call to action, phrased appropriately for the target audience.
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
              description: "A short, engaging caption (1-2 sentences) in the requested tone."
            },
            emojis: {
              type: Type.STRING,
              description: "A string of 3-5 relevant and fun emojis."
            },
            hashtags: {
              type: Type.STRING,
              description: "A string of 5-7 relevant hashtags, starting with '#' and separated by spaces."
            },
            cta: {
                type: Type.STRING,
                description: "A compelling and relevant call to action (CTA)."
            }
          },
          required: ["caption", "emojis", "hashtags", "cta"]
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

export const generateAdCopyFromPrompt = async (prompt: string, targetAudience: TargetAudience): Promise<string> => {
  try {
    const fullPrompt = `You are a witty copywriter for a modern insurance company. Based on the following ad scene description, generate a short, humorous, and clever text overlay (ad copy) for the image. The copy should be punchy, brand-safe, and subtly hint at the need for insurance. 

**CRITICAL:** The tone and humor must be tailored to a **${targetAudience}** audience.
- For Gen Z, be ironic or use slang.
- For Millennials, be relatable about 'adulting'.
- For Gen X, be witty or sarcastic.
- For Boomers, be straightforward and clever.

Keep it under 10 words. Return only the text string for the ad copy, with no extra labels or quotation marks.

Ad Scene: "${prompt}"`;
      
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
    });

    return response.text.trim().replace(/"/g, ''); // Remove quotes if the model adds them
  } catch (error: any) {
    console.error("Error generating ad copy:", error);
    throw new Error(error.message || "Failed to generate ad copy.");
  }
};

export const generateAdIdeasFromSubject = async (subject: string, targetAudience: TargetAudience): Promise<AdIdea[]> => {
  try {
    const prompt = `
      You are an expert creative director and prompt engineer specializing in creating viral social media ad concepts.
      Your task is to generate 4 distinct, highly-detailed, and creative text-to-image prompts based on the following subject: "${subject}".
      
      **CRITICAL:** The concepts must be specifically designed to resonate with a **${targetAudience}** audience.
      - For **Gen Z**, think memes, surreal humor, vibrant aesthetics, or TikTok trends.
      - For **Millennials**, focus on nostalgia (90s/00s), 'adulting' struggles, or relatable life moments.
      - For **Gen X**, use cultural references from the 80s/90s, subtle sarcasm, or a more independent, anti-establishment vibe.
      - For **Boomers**, lean into classic humor, family-oriented scenes, or nostalgic Americana.

      For each idea, you must adhere to the following prompt crafting guide:
      - **Core Structure:** [Subject with specific attributes] + [Action/Pose] + [Setting/Environment] + [Lighting/Atmosphere] + [Style/Artistic Reference] + [Technical Specifications].
      - **Subject:** Be hyper-specific. Instead of "a car", use "a sleek silver 1960s Jaguar E-Type convertible". Describe physical attributes, emotions, and context.
      - **Action/Pose:** Define specific movements or static poses. "mid-leap", "sitting thoughtfully".
      - **Setting:** Layer details. Include primary location, weather, and time period. "bustling Tokyo street during a gentle snowfall in a retro 1980s setting".
      - **Lighting/Atmosphere:** Be descriptive. "Bathed in golden hour sunlight", "dramatic side lighting creating strong shadows", "with dust particles floating in beams of light".
      - **Style:** Reference specific artists, films, or movements. "In the painterly style of Monet", "reminiscent of Wes Anderson's symmetrical compositions", "vibrant color palette of a Studio Ghibli film".
      - **Technical Specs:** Mention image qualities and composition. "Ultra-detailed 8K resolution", "shallow depth of field", "wide-angle perspective".

      For each of the 4 ideas, you must also provide the following accompanying assets for a social media post:
      1.  **prompt**: The final, detailed text-to-image prompt you've crafted.
      2.  **caption**: A short, catchy tagline or caption for the social media post.
      3.  **emoji**: A single, relevant emoji.
      4.  **hashtag**: A single, relevant hashtag (e.g., #HomeInsuranceFails).
      5.  **altDescription**: A short, concise accessibility description of the image concept.

      Return the result as a JSON array of objects, with each object representing one complete ad idea.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING, description: "The detailed text-to-image prompt." },
              caption: { type: Type.STRING, description: "A short, catchy tagline." },
              emoji: { type: Type.STRING, description: "A single relevant emoji." },
              hashtag: { type: Type.STRING, description: "A single relevant hashtag." },
              altDescription: { type: Type.STRING, description: "A short accessibility description." }
            },
            required: ["prompt", "caption", "emoji", "hashtag", "altDescription"]
          }
        }
      }
    });
    const jsonString = response.text;
    const ideas = JSON.parse(jsonString);
    return ideas as AdIdea[];
  } catch (error: any) {
    console.error("Error generating ad ideas:", error);
    throw new Error(error.message || "Failed to generate ad ideas. Please try again.");
  }
};

export const generateTrendingAdIdeas = async (): Promise<TrendingAdIdeasResponse> => {
    try {
        const prompt = `
            You are a creative director for a modern insurance company. Use Google Search to find current events, upcoming holidays (e.g., National Pet Day), and seasonal trends (e.g., Summer Road Trip Season) that are happening soon.

            Based on these timely topics, generate 4 distinct, creative, and humorous social media ad concepts that subtly hint at the need for home or auto insurance.

            For each of the 4 ideas, you must provide the following accompanying assets for a social media post:
            1.  **prompt**: A detailed text-to-image prompt for an AI image generator.
            2.  **caption**: A short, catchy tagline or caption for the social media post.
            3.  **emoji**: A single, relevant emoji.
            4.  **hashtag**: A single, relevant hashtag (e.g., #HomeInsuranceFails).
            5.  **altDescription**: A short, concise accessibility description of the image concept.

            **CRITICAL:** Your entire response must be ONLY a valid JSON array of objects, with each object representing one complete ad idea. Do not include any other text, explanations, or markdown formatting before or after the JSON array.
            For example:
            [
              {
                "prompt": "A detailed prompt...",
                "caption": "A catchy caption.",
                "emoji": "💡",
                "hashtag": "#TrendingTopic",
                "altDescription": "An accessibility description."
              }
            ]
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        let responseText = response.text.trim();
        let jsonString = responseText;

        // The model might return the JSON inside a markdown block. Let's extract it.
        const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            jsonString = jsonMatch[1];
        } else {
            // If no markdown block, try to find the JSON array directly.
            const arrayStartIndex = responseText.indexOf('[');
            const arrayEndIndex = responseText.lastIndexOf(']');
            if (arrayStartIndex !== -1 && arrayEndIndex !== -1) {
                jsonString = responseText.substring(arrayStartIndex, arrayEndIndex + 1);
            }
        }
        
        const ideas = JSON.parse(jsonString);

        const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources: GroundingSource[] = rawSources
            .filter((source: any) => source.web && source.web.uri && source.web.title)
            .map((source: any) => ({
                uri: source.web.uri,
                title: source.web.title,
            }))
            .filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.uri === value.uri
                ))
            );

        return { ideas, sources };
    } catch (error: any) {
        console.error("Error generating trending ad ideas:", error);
        if (error instanceof SyntaxError) {
            throw new Error("Failed to generate trending ideas due to an invalid format from the AI. Please try again.");
        }
        throw new Error(error.message || "Failed to generate trending ad ideas. Please try again.");
    }
};


export const generateSpriteSheet = async (base64Image: string, animationPrompt: string): Promise<SpriteSheetResponse> => {
    try {
        const imagePart = base64ToInlineData(base64Image);
        const textPart = { text: `Your task is to create a 3x3 sprite sheet for a short, looping animation based on the provided image.

**CRITICAL REQUIREMENT:** The animation MUST take place within the *exact same scene* as the original image. The background, camera angle, lighting, and any objects not directly involved in the animation must remain completely static and identical to the original image across all 9 frames. Do not change the scene. The only thing that should change is the specified action.

**Action to animate:** "${animationPrompt}"

**Output format:** A single image file containing a 3x3 grid of 9 sequential animation frames. The frames are ordered left-to-right, top-to-bottom.` };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
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