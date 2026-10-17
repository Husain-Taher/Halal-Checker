import React from 'react';
import { ProductData, ProductEvaluation } from '../types/halal';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Leaf,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ResultCardProps {
  product: ProductData;
  evaluation: ProductEvaluation;
  onAskAI?: () => void;
  isLoadingAI?: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  product,
  evaluation,
  onAskAI,
  isLoadingAI,
}) => {
  const [showFullIngredients, setShowFullIngredients] = React.useState(false);

  const getStatusBadge = () => {
    switch (evaluation.status) {
      case 'HALAL':
        return (
          <div className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-full font-bold tracking-wide text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>HALAL (PERMISSIBLE)</span>
          </div>
        );
      case 'MUSHBOOH':
        return (
          <div className="flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-full font-bold tracking-wide text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>MUSHBOOH (DOUBTFUL)</span>
          </div>
        );
      case 'HARAM':
        return (
          <div className="flex items-center space-x-2 bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1.5 rounded-full font-bold tracking-wide text-sm">
            <XCircle className="w-5 h-5 text-rose-400" />
            <span>HARAM (PROHIBITED)</span>
          </div>
        );
    }
  };

  const borderClass =
    evaluation.status === 'HALAL'
      ? 'border-emerald-500/30 bg-emerald-950/10'
      : evaluation.status === 'MUSHBOOH'
      ? 'border-amber-500/30 bg-amber-950/10'
      : 'border-rose-500/30 bg-rose-950/10';

  return (
    <div
      className={`rounded-3xl border ${borderClass} p-5 backdrop-blur-xl transition-all shadow-xl space-y-5`}
    >
      {/* Top Header: Image, Title, Brand & Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="w-20 h-20 object-contain rounded-2xl bg-white/5 border border-white/10 p-1"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-400">
              No Image
            </div>
          )}
          <div>
            <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
              {product.brands || 'Brand Unspecified'}
            </span>
            <h2 className="text-lg font-bold text-slate-100 leading-snug">
              {product.productName}
            </h2>
            <p className="text-xs text-slate-400 mt-1">UPC/EAN: {product.code}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
        {getStatusBadge()}

        {evaluation.isCertifiedHalal && (
          <span className="flex items-center space-x-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Certified ({evaluation.certifier})</span>
          </span>
        )}

        {evaluation.isVegan && (
          <span className="flex items-center space-x-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5" />
            <span>Vegan Verified (Bypass Applied)</span>
          </span>
        )}
      </div>

      {/* Summary message */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800 text-sm text-slate-300">
        <p className="font-medium text-slate-200">{evaluation.reason}</p>
      </div>

      {/* Flagged Haram Breakdown */}
      {evaluation.flaggedHaram.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Prohibited Ingredients ({evaluation.flaggedHaram.length})
          </h3>
          <div className="space-y-2">
            {evaluation.flaggedHaram.map((item, idx) => (
              <div
                key={idx}
                className="bg-rose-950/30 border border-rose-800/40 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="font-bold text-rose-200 capitalize">{item.ingredient}</div>
                <div className="text-slate-300">{item.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flagged Mushbooh Breakdown */}
      {evaluation.doubtfulMushbooh.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Doubtful / Source-Dependent Ingredients (
            {evaluation.doubtfulMushbooh.length})
          </h3>
          <div className="space-y-2">
            {evaluation.doubtfulMushbooh.map((item, idx) => (
              <div
                key={idx}
                className="bg-amber-950/30 border border-amber-850/40 rounded-xl p-3 text-xs space-y-1"
              >
                <div className="font-bold text-amber-200 capitalize">{item.ingredient}</div>
                <div className="text-slate-300">{item.reason}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissible Breakdown */}
      {evaluation.permissibleHalal.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Permissible Ingredients (
            {evaluation.permissibleHalal.length})
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {evaluation.permissibleHalal.map((item, idx) => (
              <span
                key={idx}
                className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs px-2.5 py-1 rounded-lg"
                title={item.reason}
              >
                {item.ingredient}
                {item.resolvedByVegan && ' (Vegan plant source)'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full Ingredients Accordion */}
      {product.ingredientsText && (
        <div className="border-t border-slate-800 pt-3">
          <button
            onClick={() => setShowFullIngredients(!showFullIngredients)}
            className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 transition py-1"
          >
            <span className="flex items-center gap-1 font-semibold">
              <Info className="w-3.5 h-3.5 text-slate-400" /> Full Label Text
            </span>
            {showFullIngredients ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          {showFullIngredients && (
            <p className="mt-2 text-xs text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800 font-mono">
              {product.ingredientsText}
            </p>
          )}
        </div>
      )}

      {/* AI Disambiguation Section */}
      <div className="pt-2">
        <button
          onClick={onAskAI}
          disabled={isLoadingAI}
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-2.5 px-4 rounded-2xl text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>
            {isLoadingAI
              ? 'Analyzing with Gemini AI...'
              : 'Audit Ambiguous Flavors & Carriers with Gemini AI'}
          </span>
        </button>

        {evaluation.llmAnalysis && (
          <div className="mt-3 bg-violet-950/30 border border-violet-800/40 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-violet-300">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Gemini Jurisprudence & Food Science Analysis:</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {evaluation.llmAnalysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
