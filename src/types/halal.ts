export type HalalStatus = 'HALAL' | 'HARAM' | 'MUSHBOOH';

export interface IngredientRule {
  canonicalId: string;
  names: string[];
  status: HalalStatus;
  category: 'alcohol' | 'pork' | 'animal' | 'emulsifier' | 'insect' | 'enzyme' | 'other';
  reason: string;
  resolvedByVegan: boolean; // If product is vegan, is this safe?
  references?: string;
}

export interface ParsedIngredient {
  raw: string;
  cleanName: string;
  canonicalId?: string;
  eNumber?: string;
  children?: ParsedIngredient[];
}

export interface EvaluationItem {
  ingredient: string;
  canonicalId?: string;
  status: HalalStatus;
  reason: string;
  resolvedByVegan?: boolean;
}

export interface ProductEvaluation {
  status: HalalStatus;
  confidence: number;
  reason: string;
  isCertifiedHalal: boolean;
  certifier?: string;
  isVegan: boolean;
  isVegetarian: boolean;
  flaggedHaram: EvaluationItem[];
  doubtfulMushbooh: EvaluationItem[];
  permissibleHalal: EvaluationItem[];
  unknownItems: string[];
  llmUsed?: boolean;
  llmAnalysis?: string;
}

export interface ProductData {
  code: string;
  productName: string;
  brands?: string;
  imageUrl?: string;
  ingredientsText?: string;
  labels?: string[];
  additives?: string[];
  ingredientsAnalysisTags?: string[];
  source: 'OpenFoodFacts' | 'USDA' | 'Manual_OCR' | 'Barcode';
}
