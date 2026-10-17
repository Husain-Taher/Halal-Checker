import { createWorker } from 'tesseract.js';

/**
 * Extracts and cleans ingredient text from a captured image/file.
 * Applies regex filters to isolate the text starting after "INGREDIENTS:"
 * up to the allergen warning ("CONTAINS: ...").
 */
export async function performOcrOnImage(
  imageFile: File | Blob,
  onProgress?: (progress: number, status: string) => void
): Promise<string> {
  const worker = await createWorker('eng');

  try {
    const ret = await worker.recognize(imageFile);
    await worker.terminate();

    const rawText = ret.data.text || '';
    return cleanOcrIngredients(rawText);
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

/**
 * Isolates and cleans the ingredient segment:
 * - Locates "INGREDIENTS:"
 * - Strips trailing allergen declarations ("CONTAINS: ...")
 * - Cleans OCR noise and line breaks
 */
export function cleanOcrIngredients(text: string): string {
  if (!text) return '';

  let normalized = text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ');

  // Look for "INGREDIENTS:"
  const ingMatch = normalized.search(/\b(?:ingredients|ingredienten|ingrédients)\s*:\s*/i);
  if (ingMatch !== -1) {
    normalized = normalized.substring(ingMatch).replace(/^\b(?:ingredients|ingredienten|ingrédients)\s*:\s*/i, '');
  }

  // Strip trailing "CONTAINS: ...", "MAY CONTAIN: ...", or nutrition facts headers
  const allergenMatch = normalized.search(/\b(?:contains|may contain|allergen|manufactured in|distributed by)\s*:/i);
  if (allergenMatch !== -1) {
    normalized = normalized.substring(0, allergenMatch);
  }

  return normalized.trim();
}
