import { ParsedIngredient } from '../types/halal';

/**
 * Parses nested ingredient strings like:
 * "Enriched Flour (Wheat Flour, Niacin, Reduced Iron), Vegetable Shortening (Palm Oil, Mono and Diglycerides), Natural Vanilla Extract (Water, Alcohol (35%), Vanilla Bean Extractives)"
 * into a structured tree of ingredients.
 */
export function parseIngredientText(rawText: string): ParsedIngredient[] {
  if (!rawText || !rawText.trim()) return [];

  // 1. Strip common prefix labels (e.g. "INGREDIENTS:", "CONTAINS 2% OR LESS OF:")
  let cleaned = rawText
    .replace(/^ingredients\s*:\s*/i, '')
    .replace(/^made with\s*:\s*/i, '');

  // Isolate allergens if "CONTAINS: ..." or "MAY CONTAIN: ..." appears at the end
  const allergenSplit = cleaned.split(/\b(?:contains|may contain|allergen information)\s*:/i);
  cleaned = allergenSplit[0];

  return parseLevel(cleaned);
}

function parseLevel(text: string): ParsedIngredient[] {
  const results: ParsedIngredient[] = [];
  let buffer = '';
  let depth = 0;
  let childBuffer = '';
  let parentName = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '(' || char === '[' || char === '{') {
      if (depth === 0) {
        parentName = buffer.trim();
        buffer = '';
      } else {
        childBuffer += char;
      }
      depth++;
    } else if (char === ')' || char === ']' || char === '}') {
      depth--;
      if (depth === 0) {
        const children = parseLevel(childBuffer);
        const cleanParent = cleanIngredientName(parentName);
        if (cleanParent) {
          results.push({
            raw: parentName + ' (' + childBuffer + ')',
            cleanName: cleanParent,
            children: children,
          });
        }
        parentName = '';
        childBuffer = '';
      } else {
        childBuffer += char;
      }
    } else if (depth > 0) {
      childBuffer += char;
    } else if (char === ',' || char === ';' || (char === '.' && i === text.length - 1)) {
      const clean = cleanIngredientName(buffer);
      if (clean) {
        results.push({
          raw: buffer.trim(),
          cleanName: clean,
        });
      }
      buffer = '';
    } else {
      buffer += char;
    }
  }

  // Final dangling buffer
  if (buffer.trim()) {
    const clean = cleanIngredientName(buffer);
    if (clean) {
      results.push({
        raw: buffer.trim(),
        cleanName: clean,
      });
    }
  }

  return results;
}

function cleanIngredientName(name: string): string {
  return name
    .replace(/\band\/or\b/gi, 'and')
    .replace(/\bcontains\s+(?:less\s+than|2%\s+or\s+less)\s+of\b/gi, '')
    .replace(/^[*•\-\s]+/, '')
    .replace(/[*]+$/, '')
    .trim();
}

/**
 * Recursively flattens an ingredient tree into individual checkable tokens.
 */
export function flattenIngredients(items: ParsedIngredient[]): { name: string; parent?: string }[] {
  const flat: { name: string; parent?: string }[] = [];

  function walk(list: ParsedIngredient[], parentName?: string) {
    for (const item of list) {
      if (item.cleanName) {
        flat.push({ name: item.cleanName, parent: parentName });
      }
      if (item.children && item.children.length > 0) {
        walk(item.children, item.cleanName);
      }
    }
  }

  walk(items);
  return flat;
}
