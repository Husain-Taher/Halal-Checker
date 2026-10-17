import { ProductData, ProductEvaluation, EvaluationItem } from '../types/halal';
import { parseIngredientText, flattenIngredients } from './ingredientParser';
import { findRuleForIngredient } from './ingredientDatabase';

// Recognized Halal certifying organizations & keywords
const HALAL_CERTIFIERS = [
  'halal',
  'ifanca',
  'isna',
  'hqc',
  'hfcaa',
  'sharia',
  'halal-certified',
  'certified-halal',
];

/**
 * 3-Tier Evaluation Pipeline:
 * Tier 1: Explicit Halal Certification check
 * Tier 2: Vegan/Vegetarian bypass resolution for emulsifiers & ambiguous fatty acids
 * Tier 3: Hierarchical ingredient database lookup (Haram vs Mushbooh vs Halal)
 */
export function evaluateProduct(product: ProductData): ProductEvaluation {
  const labels = product.labels || [];
  const analysisTags = product.ingredientsAnalysisTags || [];

  // ----------------------------------------------------
  // TIER 1: Halal Certification Check
  // ----------------------------------------------------
  const matchedCert = HALAL_CERTIFIERS.find((cert) =>
    labels.some((l) => l.includes(cert))
  );

  if (matchedCert) {
    return {
      status: 'HALAL',
      confidence: 1.0,
      reason: `Officially certified Halal (${matchedCert.toUpperCase()}).`,
      isCertifiedHalal: true,
      certifier: matchedCert.toUpperCase(),
      isVegan: false,
      isVegetarian: false,
      flaggedHaram: [],
      doubtfulMushbooh: [],
      permissibleHalal: [],
      unknownItems: [],
    };
  }

  // ----------------------------------------------------
  // TIER 2: Vegan / Plant-Based Flag Detection
  // ----------------------------------------------------
  const isVegan =
    labels.some((l) => l.includes('vegan') || l.includes('100%-plant') || l.includes('plant-based')) ||
    analysisTags.some((t) => t.includes('en:vegan'));

  const isVegetarian =
    isVegan ||
    labels.some((l) => l.includes('vegetarian')) ||
    analysisTags.some((t) => t.includes('en:vegetarian'));

  // ----------------------------------------------------
  // TIER 3: Ingredient Parsing & Rule Matching
  // ----------------------------------------------------
  const parsedTree = parseIngredientText(product.ingredientsText || '');
  const flattened = flattenIngredients(parsedTree);

  // Also include additives tags (e.g. "e330", "e471") from OpenFoodFacts
  const allAdditives = product.additives || [];
  for (const add of allAdditives) {
    const cleanAdd = add.replace(/^en:/, '');
    if (!flattened.some((f) => f.name.toLowerCase() === cleanAdd)) {
      flattened.push({ name: cleanAdd });
    }
  }

  const flaggedHaram: EvaluationItem[] = [];
  const doubtfulMushbooh: EvaluationItem[] = [];
  const permissibleHalal: EvaluationItem[] = [];
  const unknownItems: string[] = [];

  for (const item of flattened) {
    const rule = findRuleForIngredient(item.name);

    if (!rule) {
      // Check if it's an obviously safe basic food
      if (isBasicPermissibleFood(item.name)) {
        permissibleHalal.push({
          ingredient: item.name,
          status: 'HALAL',
          reason: 'Naturally plant, grain, or pure vegetable origin',
        });
      } else {
        unknownItems.push(item.name);
      }
      continue;
    }

    if (rule.status === 'HARAM') {
      flaggedHaram.push({
        ingredient: item.name,
        canonicalId: rule.canonicalId,
        status: 'HARAM',
        reason: rule.reason,
      });
    } else if (rule.status === 'MUSHBOOH') {
      if (isVegan && rule.resolvedByVegan) {
        permissibleHalal.push({
          ingredient: item.name,
          canonicalId: rule.canonicalId,
          status: 'HALAL',
          reason: `${rule.reason} (Resolved as Permissible: Certified Vegan/Plant-derived)`,
          resolvedByVegan: true,
        });
      } else {
        doubtfulMushbooh.push({
          ingredient: item.name,
          canonicalId: rule.canonicalId,
          status: 'MUSHBOOH',
          reason: rule.reason,
        });
      }
    } else {
      // HALAL
      permissibleHalal.push({
        ingredient: item.name,
        canonicalId: rule.canonicalId,
        status: 'HALAL',
        reason: rule.reason,
      });
    }
  }

  // ----------------------------------------------------
  // Compute Overall Verdict
  // ----------------------------------------------------
  if (flaggedHaram.length > 0) {
    return {
      status: 'HARAM',
      confidence: 0.95,
      reason: `Contains ${flaggedHaram.length} prohibited ingredient(s): ${flaggedHaram
        .map((h) => h.ingredient)
        .join(', ')}`,
      isCertifiedHalal: false,
      isVegan,
      isVegetarian,
      flaggedHaram,
      doubtfulMushbooh,
      permissibleHalal,
      unknownItems,
    };
  }

  if (doubtfulMushbooh.length > 0) {
    return {
      status: 'MUSHBOOH',
      confidence: 0.85,
      reason: `Contains ${doubtfulMushbooh.length} doubtful/source-dependent ingredient(s): ${doubtfulMushbooh
        .map((m) => m.ingredient)
        .join(', ')}`,
      isCertifiedHalal: false,
      isVegan,
      isVegetarian,
      flaggedHaram,
      doubtfulMushbooh,
      permissibleHalal,
      unknownItems,
    };
  }

  return {
    status: 'HALAL',
    confidence: unknownItems.length > 0 ? 0.8 : 0.95,
    reason: isVegan
      ? 'All ingredients permissible (Confirmed Vegan/Vegetarian)'
      : 'All ingredients permissible under standard screening criteria',
    isCertifiedHalal: false,
    isVegan,
    isVegetarian,
    flaggedHaram,
    doubtfulMushbooh,
    permissibleHalal,
    unknownItems,
  };
}

function isBasicPermissibleFood(name: string): boolean {
  const basic = [
    'water',
    'salt',
    'sugar',
    'cane sugar',
    'corn',
    'rice',
    'wheat',
    'oat',
    'flour',
    'tomato',
    'potato',
    'onion',
    'garlic',
    'pepper',
    'spice',
    'spices',
    'cocoa',
    'chocolate',
    'coffee',
    'tea',
    'apple',
    'lemon',
    'orange',
    'banana',
    'oil',
    'soy',
    'bean',
    'beans',
  ];
  const lower = name.toLowerCase();
  return basic.some((b) => lower.includes(b));
}
