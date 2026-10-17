/**
 * Gemini AI Semantic Disambiguation Service
 * Used for ambiguous phrases like "Natural and Artificial Flavors", "Natural Smoke Flavor",
 * or complex vanilla preparations when the user provides an API key or uses built-in evaluation.
 */
export async function analyzeAmbiguousIngredients(
  productName: string,
  ingredientsText: string,
  ambiguousItems: string[],
  apiKey?: string
): Promise<{ analysis: string; revisedStatus?: 'HALAL' | 'MUSHBOOH' | 'HARAM' }> {
  const key = apiKey || (import.meta as any).env?.VITE_GEMINI_API_KEY;

  if (!key) {
    return {
      analysis:
        'To enable deep AI semantic analysis for ambiguous "Natural Flavors" and solvent carriers, configure a Gemini API key in Settings.',
    };
  }

  const prompt = `
You are an expert Islamic Food Jurisprudence and Food Science AI Auditor.
Analyze the following food product ingredients for Halal compliance:

Product: "${productName}"
Full Ingredients: "${ingredientsText}"
Specific Ambiguous Items to Evaluate: ${JSON.stringify(ambiguousItems)}

Jurisprudence & Science Guidelines:
1. Examine "Natural Flavors" or ambiguous extracts for likely alcohol solvent carriers (ethanol) or animal-based derivatives (civet, castoreum, meat extracts).
2. Note if standard manufacturing for this specific category uses non-intoxicating trace carriers vs. prohibited animal extractions.
3. Strict rule: NEVER override a hard prohibited pork or direct intoxicating alcohol.

Return a concise analysis:
- Risk breakdown of the ambiguous item(s)
- Likelihood of animal vs plant vs synthetic source in US retail
- Final verdict recommendation: HALAL, MUSHBOOH, or HARAM.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let revisedStatus: 'HALAL' | 'MUSHBOOH' | 'HARAM' | undefined = undefined;
    if (text.includes('HARAM')) revisedStatus = 'HARAM';
    else if (text.includes('MUSHBOOH')) revisedStatus = 'MUSHBOOH';
    else if (text.includes('HALAL')) revisedStatus = 'HALAL';

    return { analysis: text, revisedStatus };
  } catch (err: any) {
    return {
      analysis: `AI Analysis unavailable: ${err.message || 'Network error'}`,
    };
  }
}
