import React, { useState } from 'react';
import {
  Camera,
  Search,
  ScanBarcode,
  Sparkles,
  History,
  FileText,
  Key,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ResultCard } from './components/ResultCard';
import { fetchProductByBarcode, searchProductsByName } from './services/foodDataService';
import { evaluateProduct } from './services/halalEngine';
import { analyzeAmbiguousIngredients } from './services/geminiService';
import { performOcrOnImage } from './services/ocrService';
import { ProductData, ProductEvaluation } from './types/halal';

export function App() {
  const [activeTab, setActiveTab] = useState<'scan' | 'ocr' | 'history'>('scan');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [manualIngredients, setManualIngredients] = useState('');
  const [manualProductName, setManualProductName] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(null);
  const [currentEvaluation, setCurrentEvaluation] = useState<ProductEvaluation | null>(null);
  const [history, setHistory] = useState<{ product: ProductData; evaluation: ProductEvaluation }[]>(
    []
  );

  const [geminiApiKey, setGeminiApiKey] = useState(
    () => localStorage.getItem('halal_gemini_api_key') || ''
  );
  const [usdaApiKey, setUsdaApiKey] = useState(
    () => localStorage.getItem('halal_usda_api_key') || ''
  );
  const [ocrLoading, setOcrLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Quick preset barcodes for easy testing
  const sampleBarcodes = [
    { label: 'Chicken Tortilla Soup', upc: '0011110038364' },
    { label: 'Nutella Ferrero', upc: '009800895007' },
    { label: 'Oreo Original Cookies', upc: '044000032029' },
    { label: 'Haribo Goldbears (US Gelatin)', upc: '042238303867' },
  ];

  const handleScanBarcode = async (barcode: string) => {
    setIsScannerOpen(false);
    setBarcodeInput(barcode);
    await lookupBarcode(barcode);
  };

  const lookupBarcode = async (barcode: string) => {
    if (!barcode.trim()) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const prod = await fetchProductByBarcode(barcode.trim(), usdaApiKey);
      if (!prod) {
        setErrorMessage(
          `Product UPC ${barcode} was not found in Open Food Facts. You can paste the ingredient text directly in the "Manual / OCR" tab to analyze it!`
        );
        setCurrentProduct(null);
        setCurrentEvaluation(null);
      } else {
        const evalResult = evaluateProduct(prod);
        setCurrentProduct(prod);
        setCurrentEvaluation(evalResult);

        // Add to history
        setHistory((prev) => [
          { product: prod, evaluation: evalResult },
          ...prev.filter((item) => item.product.code !== prod.code),
        ]);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error fetching product information.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = () => {
    if (!manualIngredients.trim()) {
      setErrorMessage('Please enter an ingredient list to analyze.');
      return;
    }

    setErrorMessage(null);
    const mockProd: ProductData = {
      code: 'MANUAL_OCR_' + Date.now().toString().slice(-4),
      productName: manualProductName.trim() || 'Custom Product / OCR Scan',
      ingredientsText: manualIngredients.trim(),
      source: 'Manual_OCR',
    };

    const evalResult = evaluateProduct(mockProd);
    setCurrentProduct(mockProd);
    setCurrentEvaluation(evalResult);
    setActiveTab('scan');

    setHistory((prev) => [
      { product: mockProd, evaluation: evalResult },
      ...prev,
    ]);
  };

  const handleRunAI = async () => {
    if (!currentProduct || !currentEvaluation) return;
    setLoadingAI(true);

    const ambiguousItems = [
      ...currentEvaluation.doubtfulMushbooh.map((d) => d.ingredient),
      ...currentEvaluation.unknownItems,
    ];

    const res = await analyzeAmbiguousIngredients(
      currentProduct.productName,
      currentProduct.ingredientsText || '',
      ambiguousItems.length > 0 ? ambiguousItems : ['Natural and Artificial Flavors'],
      geminiApiKey
    );

    setCurrentEvaluation((prev) =>
      prev
        ? {
            ...prev,
            llmUsed: true,
            llmAnalysis: res.analysis,
            status: res.revisedStatus || prev.status,
          }
        : null
    );

    setLoadingAI(false);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-slate-950 border-x border-slate-900 pb-20">
      {/* Top App Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ScanBarcode className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 flex items-center gap-1.5">
              HalalScan <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">US 3-TIER</span>
            </h1>
            <p className="text-[11px] text-slate-400">Barcode & OCR Grocery Screener</p>
          </div>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Settings & API Key"
        >
          <Key className="w-5 h-5" />
        </button>
      </header>

      {/* Settings Drawer / Modal */}
      {showSettings && (
        <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Gemini AI Settings
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Add a free Google Gemini API key to enable deep food-science semantic audits for ambiguous "Natural Flavors" and solvent carriers.
          </p>
          <input
            type="password"
            placeholder="Paste Gemini API Key (AIzaSy...)"
            value={geminiApiKey}
            onChange={(e) => {
              setGeminiApiKey(e.target.value);
              localStorage.setItem('halal_gemini_api_key', e.target.value);
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />

          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              USDA FoodData Central API Key (Optional)
            </span>
            <p className="text-[11px] text-slate-400 mb-2">
              Provides direct fallback to USDA Branded Foods database when a US barcode is not in Open Food Facts.
            </p>
            <input
              type="password"
              placeholder="Paste USDA API Key (Default: DEMO_KEY)"
              value={usdaApiKey}
              onChange={(e) => {
                setUsdaApiKey(e.target.value);
                localStorage.setItem('halal_usda_api_key', e.target.value);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="grid grid-cols-3 gap-1 p-3 bg-slate-900/50 border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'scan'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Barcode</span>
        </button>
        <button
          onClick={() => setActiveTab('ocr')}
          className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'ocr'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>OCR / Text</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'history'
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Content Area */}
      <main className="flex-1 p-4 space-y-4">
        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/50 rounded-2xl p-4 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* TAB 1: Barcode Scanner */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            {/* Camera Button */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-center space-x-3 shadow-lg shadow-emerald-600/20 cursor-pointer active:scale-[0.98] transition"
            >
              <Camera className="w-6 h-6" />
              <span className="text-base tracking-wide">Open Camera Barcode Scanner</span>
            </button>

            {/* Manual Barcode Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Or type UPC/EAN barcode number..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && lookupBarcode(barcodeInput)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-12 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              <button
                onClick={() => lookupBarcode(barcodeInput)}
                disabled={loading}
                className="absolute right-2 top-2 p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 transition"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Test Sample Barcodes */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Test Samples:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleBarcodes.map((item) => (
                  <button
                    key={item.upc}
                    onClick={() => {
                      setBarcodeInput(item.upc);
                      lookupBarcode(item.upc);
                    }}
                    className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2.5 py-1.5 rounded-xl transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center py-8 space-y-2">
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Fetching US product data & analyzing...</p>
              </div>
            )}

            {/* Active Result */}
            {currentProduct && currentEvaluation && !loading && (
              <ResultCard
                product={currentProduct}
                evaluation={currentEvaluation}
                onAskAI={handleRunAI}
                isLoadingAI={loadingAI}
              />
            )}
          </div>
        )}

        {/* TAB 2: OCR / Manual Ingredient List */}
        {activeTab === 'ocr' && (
          <div className="space-y-4">
            {/* Camera OCR Capture Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
              <label
                htmlFor="ocr-file-input"
                className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white transition cursor-pointer shadow-md ${
                  ocrLoading
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>
                  {ocrLoading ? 'Scanning Photo with OCR...' : 'Take Photo of Nutrition Label (OCR)'}
                </span>
              </label>
              <input
                id="ocr-file-input"
                type="file"
                accept="image/*"
                capture="environment"
                disabled={ocrLoading}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setOcrLoading(true);
                  setErrorMessage(null);
                  try {
                    const extracted = await performOcrOnImage(file);
                    if (extracted) {
                      setManualIngredients(extracted);
                    } else {
                      setErrorMessage('Could not detect readable ingredient text in the image. Try capturing closer to the INGREDIENTS section.');
                    }
                  } catch (err: any) {
                    setErrorMessage('OCR Error: ' + (err?.message || 'Failed to process image.'));
                  } finally {
                    setOcrLoading(false);
                  }
                }}
              />
              <p className="text-[11px] text-slate-400">
                Automatically extracts text from "INGREDIENTS:" up to allergens.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Product Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Vanilla Cream Cookies"
                value={manualProductName}
                onChange={(e) => setManualProductName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">
                Ingredients Text (From Camera OCR or Nutrition Label)
              </label>
              <textarea
                rows={6}
                placeholder="Paste or type ingredients: e.g. Enriched flour, palm oil, mono- and diglycerides (E471), natural vanilla extract (water, alcohol, vanilla extractives), pork gelatin..."
                value={manualIngredients}
                onChange={(e) => setManualIngredients(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
              />
            </div>

            {/* Quick Presets to test */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() =>
                  setManualIngredients(
                    'Enriched Flour (Wheat Flour, Niacin), Vegetable Shortening (Palm Oil, Mono and Diglycerides), Natural Vanilla Extract (Water, Alcohol (35%), Vanilla Bean Extractives)'
                  )
                }
                className="text-[11px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded-lg"
              >
                Sample: Alcohol Vanilla Extract
              </button>
              <button
                onClick={() =>
                  setManualIngredients(
                    'Sugar, Corn Syrup, Gelatin, Citric Acid, Carmine (Color), Artificial Flavors'
                  )
                }
                className="text-[11px] bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-2 py-1 rounded-lg"
              >
                Sample: Gelatin + Carmine (E120)
              </button>
            </div>

            <button
              onClick={handleManualAnalyze}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl text-xs shadow-md transition cursor-pointer"
            >
              Analyze Ingredients List (3-Tier Engine)
            </button>
          </div>
        )}

        {/* TAB 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No scanned products yet. Start scanning groceries to build your history!
              </div>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentProduct(item.product);
                    setCurrentEvaluation(item.evaluation);
                    setActiveTab('scan');
                  }}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt=""
                        className="w-10 h-10 object-contain rounded-xl bg-black/20"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                        N/A
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-xs text-slate-200 line-clamp-1">
                        {item.product.productName}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.product.code}</div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.evaluation.status === 'HALAL'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.evaluation.status === 'MUSHBOOH'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.evaluation.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Barcode Camera Modal */}
      {isScannerOpen && (
        <BarcodeScannerModal
          onScan={handleScanBarcode}
          onClose={() => setIsScannerOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
