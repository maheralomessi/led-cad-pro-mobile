import { GoogleGenAI } from '@google/genai';
import { Preferences } from '@capacitor/preferences';

const KEY_NAME = 'gemini_api_key';

export const getGeminiKey = async (): Promise<string> => {
  const fromPrefs = await Preferences.get({ key: KEY_NAME });
  const k = (fromPrefs.value || '').trim();
  return k || (process.env.API_KEY || '').trim();
};

export const setGeminiKey = async (key: string): Promise<void> => {
  await Preferences.set({ key: KEY_NAME, value: key.trim() });
};

/**
 * Analyzes the LED design for manufacturing issues using Gemini.
 * If no API key is configured, returns an Arabic guidance message.
 */
export const analyzeDesignWithAI = async (imageB64: string, params: any) => {
  const apiKey = await getGeminiKey();
  if (!apiKey) {
    return 'لم يتم تعيين مفتاح Gemini. افتح الإعدادات داخل التطبيق ثم أضف API Key لتفعيل التقرير الذكي.';
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = 'gemini-3-pro-preview';

  const prompt = `
Analyze this signage image for manufacturing.
Target Canvas Size: ${params.canvasWidthCm}x${params.canvasHeightCm} cm.
LED Diameter: ${params.ledDiameterMm} mm.
Spacing: ${params.ledSpacingMm} mm.

Give a brief technical review of whether the LED spacing is appropriate for the complexity of the shape.
Point out potential issues with tight curves where LEDs might overlap.
Keep the response concise and in Arabic.
`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageB64.split(',')[1]
            }
          },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (err) {
    console.error('Gemini Error:', err);
    return 'حدث خطأ أثناء تحليل الذكاء الاصطناعي.';
  }
};
