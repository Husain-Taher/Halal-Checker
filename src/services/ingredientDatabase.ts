import { IngredientRule } from '../types/halal';

export const INGREDIENT_DATABASE: IngredientRule[] = [
  // ==========================================
  // 1. Alcohol & Intoxicants (Haram / Mushbooh)
  // ==========================================
  {
    canonicalId: 'ALCOHOL_ETHANOL',
    names: ['alcohol', 'ethanol', 'ethyl alcohol', 'spirit', 'liquor', 'hard liquor'],
    status: 'HARAM',
    category: 'alcohol',
    reason: 'Pure alcohol or ethanol added as an intoxicating ingredient is Haram.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'ALCOHOL_BEVERAGES',
    names: ['wine', 'white wine', 'red wine', 'beer', 'rum', 'whiskey', 'bourbon', 'vodka', 'champagne', 'brandy', 'cooking wine', 'mirin', 'sake', 'liqueur'],
    status: 'HARAM',
    category: 'alcohol',
    reason: 'Alcoholic beverages or wine-derived ingredients used directly in food are Haram.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'WINE_VINEGAR',
    names: ['wine vinegar', 'red wine vinegar', 'white wine vinegar'],
    status: 'HALAL',
    category: 'alcohol',
    reason: 'Vinegar produced through complete acetic fermentation from wine is permissible (Hadith: The best condiment is vinegar).',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'VANILLA_EXTRACT',
    names: ['vanilla extract', 'pure vanilla extract', 'natural vanilla extract'],
    status: 'MUSHBOOH',
    category: 'alcohol',
    reason: 'Standard US FDA vanilla extract requires minimum 35% alcohol carrier. Mushbooh/Haram unless verified non-alcoholic or trace compliant.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'VANILLIN',
    names: ['vanillin', 'artificial vanilla flavor', 'ethyl vanillin'],
    status: 'HALAL',
    category: 'other',
    reason: 'Synthetic aroma compound, usually alcohol-free.',
    resolvedByVegan: true,
  },

  // ==========================================
  // 2. Pork Derivatives (Strictly Haram)
  // ==========================================
  {
    canonicalId: 'PORK_MEAT_FAT',
    names: ['pork', 'porcine', 'lard', 'pork fat', 'bacon', 'ham', 'swine', 'pork belly', 'pork sausage', 'pork gelatin'],
    status: 'HARAM',
    category: 'pork',
    reason: 'Pork and all of its derivatives and fats are explicitly prohibited (Quran 2:173).',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'PEPSIN_PORCINE',
    names: ['pepsin', 'porcine pepsin'],
    status: 'HARAM',
    category: 'pork',
    reason: 'Digestive enzyme almost exclusively sourced commercially from pig stomach mucosa.',
    resolvedByVegan: false,
  },

  // ==========================================
  // 3. Animal-Derived (Non-Pork - Mushbooh unless certified / plant source)
  // ==========================================
  {
    canonicalId: 'E441',
    names: ['gelatin', 'gelatine', 'e441', 'ins441'],
    status: 'MUSHBOOH',
    category: 'animal',
    reason: 'Gelatin in US retail is predominantly porcine or non-dhabihah bovine unless specified fish/bovine Halal or Kosher.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'TALLOW_SUET',
    names: ['tallow', 'beef tallow', 'animal tallow', 'suet', 'animal shortening', 'animal fat'],
    status: 'MUSHBOOH',
    category: 'animal',
    reason: 'Rendered animal fat; requires Halal zabiha/dhabihah slaughter to be permissible.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'WHEY_POWDER',
    names: ['whey', 'whey powder', 'whey protein', 'whey permeate', 'sweet whey'],
    status: 'MUSHBOOH',
    category: 'animal',
    reason: 'Produced during cheese curdling. Permissible if microbial rennet or Halal calf rennet is used; doubtful if porcine/animal rennet was used.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'E542',
    names: ['bone phosphate', 'edible bone phosphate', 'e542', 'ins542'],
    status: 'MUSHBOOH',
    category: 'animal',
    reason: 'Derived from defatted animal bones. Haram if from pig or non-halal cattle.',
    resolvedByVegan: true,
  },

  // ==========================================
  // 4. Emulsifiers, Fatty Acids & Glycerol
  // ==========================================
  {
    canonicalId: 'E471',
    names: ['mono- and diglycerides', 'mono and diglycerides', 'monoglycerides', 'diglycerides', 'e471', 'ins471', 'mono and diglycerides of fatty acids'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Derived from either plant oils (soy, palm) or animal tallow. Permissible if product is certified Halal or 100% Vegan.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E472',
    names: ['esters of mono- and diglycerides', 'e472', 'e472a', 'e472b', 'e472c', 'e472e', 'datem'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Fatty acid esters derived from vegetable oils or animal fats. Resolved by vegan status.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E422',
    names: ['glycerol', 'glycerin', 'glycerine', 'e422', 'ins422'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Humectant that can be produced from petroleum, vegetable oil, or animal tallow.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E481',
    names: ['sodium stearoyl lactylate', 'ssl', 'e481', 'ins481'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Prepared from stearic acid and lactic acid. Stearic acid can be bovine tallow or vegetable oil.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E482',
    names: ['calcium stearoyl lactylate', 'csl', 'e482', 'ins482'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Synthesized from stearic acid (plant or animal fat source).',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E570',
    names: ['stearic acid', 'fatty acid', 'e570', 'ins570'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Extracted from animal tallow or palm oil.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E432_436',
    names: ['polysorbate 60', 'polysorbate 80', 'polysorbate 65', 'polysorbates', 'e432', 'e433', 'e434', 'e435', 'e436'],
    status: 'MUSHBOOH',
    category: 'emulsifier',
    reason: 'Contains fatty acids (stearic, oleic, palmitic) which can be animal or plant sourced.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'SOY_LECITHIN',
    names: ['soy lecithin', 'sunflower lecithin', 'rapeseed lecithin', 'lecithin', 'e322', 'ins322'],
    status: 'HALAL',
    category: 'emulsifier',
    reason: 'Commercial lecithin is overwhelmingly plant-derived (soybeans, sunflower). Permissible.',
    resolvedByVegan: true,
  },

  // ==========================================
  // 5. Insects & Secretions
  // ==========================================
  {
    canonicalId: 'E120',
    names: ['carmine', 'cochineal', 'cochineal extract', 'carminic acid', 'natural red 4', 'crimson lake', 'e120', 'ins120'],
    status: 'HARAM',
    category: 'insect',
    reason: 'Red dye extracted by crushing female cochineal scale insects. Deemed Haram/Mushbooh under Hanafi, Shafi\'i, and Hanbali schools.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'E904',
    names: ['shellac', 'confectioner\'s glaze', 'resinous glaze', 'pure food glaze', 'lac resin', 'e904', 'ins904'],
    status: 'MUSHBOOH',
    category: 'insect',
    reason: 'Glaze secreted by the female lac insect. Ruled impermissible/doubtful by major jurisprudential bodies.',
    resolvedByVegan: false,
  },

  // ==========================================
  // 6. Enzymes & Amino Acids
  // ==========================================
  {
    canonicalId: 'RENNET',
    names: ['rennet', 'animal rennet', 'chymosin'],
    status: 'MUSHBOOH',
    category: 'enzyme',
    reason: 'Curdling enzyme extracted from fourth stomach of unweaned calves. If microbial/vegetarian it is Halal; if animal it requires halal slaughter.',
    resolvedByVegan: false,
  },
  {
    canonicalId: 'MICROBIAL_ENZYMES',
    names: ['microbial enzymes', 'microbial rennet', 'fungal enzymes', 'plant enzymes', 'vegetable enzymes', 'bacterial enzymes'],
    status: 'HALAL',
    category: 'enzyme',
    reason: 'Biotechnological or plant-based enzymes, 100% Halal.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'E920',
    names: ['l-cysteine', 'cysteine', 'l-cysteine hydrochloride', 'e920', 'ins920'],
    status: 'MUSHBOOH',
    category: 'enzyme',
    reason: 'Flour treatment agent often derived from duck feathers or human/hog hair. Synthetic/bacterial fermentation is Halal.',
    resolvedByVegan: true,
  },

  // ==========================================
  // 7. Common Safe Ingredients (Halal)
  // ==========================================
  {
    canonicalId: 'CITRIC_ACID',
    names: ['citric acid', 'e330', 'ins330'],
    status: 'HALAL',
    category: 'other',
    reason: 'Citrus acid produced via Aspergillus niger fermentation of molasses.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'PALM_OIL',
    names: ['palm oil', 'palm kernel oil', 'vegetable oil', 'canola oil', 'olive oil', 'corn oil'],
    status: 'HALAL',
    category: 'other',
    reason: '100% plant-extracted vegetable fat.',
    resolvedByVegan: true,
  },
  {
    canonicalId: 'AGAR_PECTIN',
    names: ['agar', 'agar-agar', 'pectin', 'carrageenan', 'guar gum', 'xanthan gum', 'e406', 'e440', 'e407', 'e412', 'e415'],
    status: 'HALAL',
    category: 'other',
    reason: 'Plant, seaweed, or microbiological plant gelling agents (halal alternatives to gelatin).',
    resolvedByVegan: true,
  },
];

// Fast normalized Map for canonical lookups
const LOOKUP_MAP = new Map<string, IngredientRule>();
for (const rule of INGREDIENT_DATABASE) {
  LOOKUP_MAP.set(rule.canonicalId.toLowerCase(), rule);
  for (const name of rule.names) {
    LOOKUP_MAP.set(name.toLowerCase().trim(), rule);
  }
}

export function findRuleForIngredient(ingredientName: string): IngredientRule | undefined {
  const normalized = ingredientName
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Direct match
  if (LOOKUP_MAP.has(normalized)) {
    return LOOKUP_MAP.get(normalized);
  }

  // 2. E-number / INS pattern check (e.g. "e-471" -> "e471")
  const eMatch = normalized.match(/\b(?:e|ins)[-\s]?(\d{3,4}[a-z]?)\b/);
  if (eMatch) {
    const eCode = `e${eMatch[1]}`.toLowerCase();
    if (LOOKUP_MAP.has(eCode)) {
      return LOOKUP_MAP.get(eCode);
    }
  }

  // 3. Substring matching for known critical markers
  for (const rule of INGREDIENT_DATABASE) {
    for (const alias of rule.names) {
      if (alias.length >= 4 && normalized.includes(alias)) {
        return rule;
      }
    }
  }

  return undefined;
}
