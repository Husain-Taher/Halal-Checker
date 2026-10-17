# HalalScan — US Grocery Barcode & OCR Screener

A fast, mobile-first Halal food screening web application built according to your multi-tier architecture specification.

## Features

- **Live Camera Barcode Scanner**: Scans UPC-A, EAN-13, and QR codes using your phone's camera.
- **Open Food Facts API**: Instant US retail product retrieval with nutrition labels, ingredient lists, and additive E-numbers.
- **Hierarchical 3-Tier Rule Engine**:
  1. **Tier 1 (Certified Halal)**: Checks for official certifying bodies (IFANCA, ISNA, HQC, HFCAA, etc.).
  2. **Tier 2 (Vegan Bypass)**: Automatically resolves ambiguous emulsifiers and fatty acids (E471, glycerol, stearic acid, polysorbates) if the item is certified 100% vegan / plant-based.
  3. **Tier 3 (Database Screening)**: Granular classification across 7 critical risk categories (Alcohol/intoxicants, Pork derivatives, Non-pork animal fats, Emulsifiers & fatty acids, Insects/carmine/shellac, Microbial vs animal enzymes, and L-cysteine).
- **OCR / Manual Ingredient Analyzer**: Paste or scan ingredient labels directly for products without barcodes.
- **Gemini AI Semantic Auditor**: Disambiguates ambiguous phrases like *"Natural and Artificial Flavors"* or complex vanilla preparations with food-science jurisprudence reasoning.
- **PWA Ready**: Can be installed to your iPhone or Android home screen for one-tap daily grocery shopping.

## How to Run & Use on Your Phone

1. **On your computer:**
   ```bash
   npm run dev
   ```
2. **On your phone (connected to same Wi-Fi network):**
   Open your phone's browser and go to your local network address:
   ```
   http://192.168.1.72:3000/
   ```
3. **Add to Phone Home Screen (PWA):**
   - **iPhone (Safari):** Tap the **Share** button $\rightarrow$ **Add to Home Screen**.
   - **Android (Chrome):** Tap the **Three Dots Menu** $\rightarrow$ **Add to Home screen** / **Install App**.

## Architecture & File Structure

- `src/types/halal.ts`: Core data contracts for products, evaluations, rules, and verdicts.
- `src/services/ingredientDatabase.ts`: Taxonomy of E-codes, pork derivatives, intoxicants, animal fats, and halal alternatives.
- `src/services/ingredientParser.ts`: Recursive parenthetical tree parser that handles nested sub-ingredients.
- `src/services/foodDataService.ts`: Integration with Open Food Facts API with fallback queries.
- `src/services/halalEngine.ts`: 3-Tier evaluation logic (Halal certification $\rightarrow$ Vegan bypass $\rightarrow$ Taxonomy lookup).
- `src/services/geminiService.ts`: AI semantic fallback auditor using Gemini 2.5 Flash.
- `src/components/BarcodeScannerModal.tsx`: Real-time camera barcode scanner powered by `html5-qrcode`.
- `src/components/ResultCard.tsx`: Color-coded breakdown of Halal, Mushbooh, and Haram ingredients with detailed rationales.
