import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { UploadedImage, CategorizedSuggestions } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates initial prompt ideas to help the user get started, now in categories.
 */
export async function generateInitialPromptSuggestions(): Promise<CategorizedSuggestions> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an AI assistant for a product mockup tool. Suggest creative and popular scene ideas for a product photo. Provide them in JSON format with categories. The categories should be "Environment", "Lighting", and "Style & Angle". Each category should have 2-3 short, descriptive phrases.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        Environment: { type: Type.ARRAY, items: { type: Type.STRING } },
                        Lighting: { type: Type.ARRAY, items: { type: Type.STRING } },
                        "Style & Angle": { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                },
            },
        });
        const text = response.text?.trim();
        if (!text) {
            throw new Error("API returned no text for initial suggestions.");
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating initial suggestions:", error);
        return {
            "Environment": ["On a rustic wooden table", "Minimalist studio background"],
            "Lighting": ["Soft, natural window light", "Dramatic, single spotlight"],
            "Style & Angle": ["Top-down flat lay", "Eye-level cinematic shot"],
        };
    }
}


/**
 * Takes a user's basic prompt and asks a text model to enhance it for better image generation results.
 */
export async function enhanceUserPrompt(userPrompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `User's prompt: "${userPrompt}"`,
            config: {
                systemInstruction: `You are an expert prompt writer for an AI image generation service, specializing in professional product photography. Your task is to take a user's simple description and expand it into a detailed, descriptive prompt.

**CRITICAL RULE: Identify any proper nouns, celebrity names, brand names, or copyrighted terms (e.g., 'Madonna', 'in the style of Stranger Things'). DO NOT use these literal terms. Instead, analyze the aesthetic, style, and mood associated with the term and translate it into descriptive language. For example, if the user says 'in the style of Madonna in the 80s', you might describe it as 'in a vibrant, rebellious 80s pop-music video style with bold fashion, neon lights, and a gritty urban feel'. This is crucial to avoid content restrictions.**

Incorporate professional photography concepts. Think about:
- **Lighting:** Is it soft, diffused natural light from a window? Is it dramatic studio lighting? Is it warm golden hour backlighting?
- **Composition & Angle:** Is it a top-down flat lay? An eye-level shot? A dynamic angle? A macro shot focusing on texture?
- **Lens & Camera Effects:** Mention a shallow depth of field for a beautifully blurred bokeh background that makes the product stand out.
- **Environment & Mood:** Describe surrounding props, textures (like marble, wood grain, linen), and the 'overall mood (e.g., minimalist and clean, rustic and cozy, elegant and luxurious).
Keep the user's core request, but elevate it to a professional photo shoot concept. Only output the rewritten prompt itself, with no preamble.`,
            }
        });
        return response.text?.trim() || userPrompt;
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        // Fallback to the original prompt in case of an error
        return userPrompt;
    }
}

/**
 * Generates contextual refinement suggestions based on the prompt used to create an image, now in categories.
 */
export async function generateRefinementSuggestions(basePrompt: string): Promise<CategorizedSuggestions> {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the product mockup prompt below, suggest creative refinement ideas. Provide them in JSON format with two categories: "Visuals" (changes to lighting, angle, style) and "Environment" (changes to the background or props). Each category should have 2 distinct, actionable ideas (3-5 words each).
            Prompt: "${basePrompt}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        Visuals: { type: Type.ARRAY, items: { type: Type.STRING }},
                        Environment: { type: Type.ARRAY, items: { type: Type.STRING }}
                    },
                },
            },
        });
        const text = response.text?.trim();
        if (!text) {
            throw new Error("API returned no text for refinement suggestions.");
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Error generating refinement suggestions:", error);
        return {
            "Visuals": ["Make the lighting warmer", "Try a different angle"],
            "Environment": ["Add more relevant props", "Change the background color"]
        };
    }
}

async function callImageGenerationAPI(
    contents: { parts: ({ inlineData: { data: string; mimeType: string; }; } | { text: string; })[] },
    errorContext: 'generate' | 'edit'
): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents,
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            const blockReason = response.promptFeedback?.blockReason;
            if (blockReason) {
                throw new Error(`Mockup generation failed because the prompt was blocked. Reason: ${blockReason}. Please modify your prompt and try again.`);
            }
            throw new Error("The model did not return any content. Please try a different prompt.");
        }

        const candidate = response.candidates[0];

        if (candidate.finishReason && (candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION')) {
             throw new Error(`Mockup generation was blocked because the response was flagged. Reason: ${candidate.finishReason}. Please modify your prompt and try again.`);
        }

        const parts = candidate.content?.parts;
        let foundImage: string | null = null;
        let foundText = '';

        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    foundImage = part.inlineData.data;
                    break;
                }
                if (part.text) {
                    foundText += part.text;
                }
            }
        }
        
        if (foundImage) {
            return foundImage;
        }

        const textResponse = foundText.trim() || response.text?.trim();
        if (textResponse) {
             throw new Error(`Model returned text instead of an image: "${textResponse}". This can happen if the prompt is unclear or blocked.`);
        }

        throw new Error("No image data found in the API response. The model may have had an issue generating the image.");
    } catch (error) {
        const action = errorContext === 'generate' ? 'generating' : 'editing';
        console.error(`Error ${action} mockup with Gemini API:`, error);
        if (error instanceof Error) {
            if (error.message.startsWith('Mockup generation failed') || error.message.startsWith('Mockup generation was blocked') || error.message.startsWith('Model returned text')) {
                throw error;
            }
            throw new Error(`Failed to ${errorContext} mockup: ${error.message}`);
        }
        throw new Error(`An unknown error occurred while ${action} the mockup.`);
    }
}

export async function generateFusedMockup(prompt: string, image: UploadedImage): Promise<string> {
    const imagePart = {
        inlineData: {
            data: image.base64,
            mimeType: image.mimeType,
        },
    };

    const textPart = {
        text: `Take the provided product image and place it realistically into the following scene: "${prompt}".
    
    CRITICAL INSTRUCTION: The features, details, and colors of the product in the provided image must be preserved with 100% accuracy. Do not change the product itself.
    
    Integrate the product into the scene by generating realistic contact shadows, subtle reflections on the surface, and ensuring the scene's lighting naturally wraps around the product. The final image should be a seamless, photorealistic composition.`,
    };

    return callImageGenerationAPI({ parts: [imagePart, textPart] }, 'generate');
}

export async function editGeneratedMockup(prompt: string, existingMockup: UploadedImage): Promise<string> {
    const imagePart = {
        inlineData: {
            data: existingMockup.base64,
            mimeType: existingMockup.mimeType,
        },
    };

    const textPart = {
        text: prompt,
    };

    return callImageGenerationAPI({ parts: [imagePart, textPart] }, 'edit');
}
