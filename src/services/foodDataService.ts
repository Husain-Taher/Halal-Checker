import { ProductData } from '../types/halal';

/**
 * Service to query Open Food Facts API and USDA FoodData Central (FDC)
 */
export async function fetchProductByBarcode(
  barcode: string,
  usdaApiKey?: string
): Promise<ProductData | null> {
  const cleanBarcode = barcode.trim().replace(/^0+/, ''); // strip leading zeros for US UPC search

  // 1. Try Open Food Facts first (Fast, free, crowdsourced with US focus)
  try {
    const urls = [
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`,
    ];

    for (const url of urls) {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      if (data.status === 1 && data.product) {
        const prod = data.product;
        return {
          code: barcode,
          productName: prod.product_name || prod.product_name_en || 'Unknown Product',
          brands: prod.brands,
          imageUrl: prod.image_front_url || prod.image_url,
          ingredientsText: prod.ingredients_text_en || prod.ingredients_text || '',
          labels: (prod.labels_tags || []).map((l: string) => l.replace(/^en:/, '').toLowerCase()),
          additives: (prod.additives_tags || []).map((a: string) => a.replace(/^en:/, '').toLowerCase()),
          ingredientsAnalysisTags: prod.ingredients_analysis_tags || [],
          source: 'OpenFoodFacts',
        };
      }
    }
  } catch (err) {
    console.warn('OpenFoodFacts fetch error:', err);
  }

  // 2. Fallback: USDA FoodData Central (FDC) Branded Foods API
  try {
    const apiKey = usdaApiKey || 'DEMO_KEY';
    const usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
      cleanBarcode || barcode
    )}&dataType=Branded&pageSize=1`;

    const usdaRes = await fetch(usdaUrl);
    if (usdaRes.ok) {
      const usdaData = await usdaRes.json();
      if (usdaData.foods && usdaData.foods.length > 0) {
        const f = usdaData.foods[0];
        return {
          code: barcode,
          productName: f.description || 'Branded Food Item',
          brands: f.brandOwner || f.brandName,
          ingredientsText: f.ingredients || '',
          labels: [],
          additives: [],
          source: 'USDA',
        };
      }
    }
  } catch (err) {
    console.warn('USDA FDC fetch error:', err);
  }

  return null;
}

/**
 * Search products by keyword text on Open Food Facts
 */
export async function searchProductsByName(query: string): Promise<ProductData[]> {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      query
    )}&search_simple=1&action=process&json=1&page_size=10`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    if (!data.products || !Array.isArray(data.products)) return [];

    return data.products.map((prod: any) => ({
      code: prod.code || '',
      productName: prod.product_name || prod.product_name_en || 'Unknown Product',
      brands: prod.brands,
      imageUrl: prod.image_front_small_url || prod.image_front_url,
      ingredientsText: prod.ingredients_text_en || prod.ingredients_text || '',
      labels: (prod.labels_tags || []).map((l: string) => l.replace(/^en:/, '').toLowerCase()),
      additives: (prod.additives_tags || []).map((a: string) => a.replace(/^en:/, '').toLowerCase()),
      ingredientsAnalysisTags: prod.ingredients_analysis_tags || [],
      source: 'OpenFoodFacts',
    }));
  } catch (err) {
    console.warn('Product search error:', err);
    return [];
  }
}
