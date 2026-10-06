import React, { useState } from 'react';
import { 
  Zap, 
  Check, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  X,
  Sliders,
  Award,
  Layers,
  Copy,
  Coffee,
  Heart
} from 'lucide-react';
import { ContractorSettings } from '../types';
import { formatCurrency, playChime } from '../utils/calculations';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ContractorSettings;
  onUpdateTier: (tier: 'starter' | 'pro' | 'elite') => void;
  totalRecoveredLeakage: number;
  monthlyVolumeProcessed: number;
  limitReachedNotice?: boolean;
}

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateTier,
  totalRecoveredLeakage,
  monthlyVolumeProcessed,
  limitReachedNotice = false
}) => {
  const [jobsPerMonth, setJobsPerMonth] = useState<number>(28);
  const [avgLeakagePerJob, setAvgLeakagePerJob] = useState<number>(38);
  const [hoursSavedPerJob, setHoursSavedPerJob] = useState<number>(0.5);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'elite'>('pro');
  const [gcashRef, setGcashRef] = useState<string>('');
  const [copiedGcash, setCopiedGcash] = useState<boolean>(false);
  const [tipSuccess, setTipSuccess] = useState<string | null>(null);
  const [qrImgFailed, setQrImgFailed] = useState<boolean>(false);

  const creatorGcashNumber = settings.gcashNumber || '0916 768 5173';
  const creatorAccountName = settings.gcashAccountName || 'TradeCost Pro';

  if (!isOpen) return null;

  const handleCopyCreatorGcash = () => {
    navigator.clipboard.writeText(creatorGcashNumber.replace(/\s+/g, ''));
    setCopiedGcash(true);
    playChime('beep');
    setTimeout(() => setCopiedGcash(false), 2000);
  };

  const handleVerifyGcashPayment = (tier: 'starter' | 'pro' | 'elite') => {
    if (!gcashRef.trim()) {
      alert('Pakilagay po ang GCash Reference Number mula sa inyong resibo upang ma-activate ang Pro!');
      return;
    }
    onUpdateTier(tier);
    playChime('success');
    alert(`🎉 Maraming salamat! Na-activate na ang iyong TradeCost Pro Unlimited Plan! (Ref #${gcashRef}). Bukas na ang unli voice estimates mo!`);
    setGcashRef('');
    onClose();
  };

  const handleSendTip = (amount: number) => {
    playChime('beep');
    setTipSuccess(`Salamat po sa ₱${amount} tip! I-send po ito sa GCash: ${creatorGcashNumber}`);
  };

  // ROI Calculations
  const monthlyPartsRecovered = jobsPerMonth * avgLeakagePerJob;
  const hoursSavedMonthly = Number((jobsPerMonth * hoursSavedPerJob).toFixed(1));
  const hourlyRate = settings.defaultHourlyRate || 115;
  const laborAdminSavings = Number((hoursSavedMonthly * hourlyRate).toFixed(2));
  const totalMonthlyGain = monthlyPartsRecovered + laborAdminSavings;

  const currentTierPrice = settings.subscriptionTier === 'starter' ? 19 : settings.subscriptionTier === 'pro' ? 29 : 49;
  const netMonthlyROI = totalMonthlyGain - currentTierPrice;
  const roiMultiplier = Math.round(totalMonthlyGain / currentTierPrice);

  // Fintech Take-Rate
  const fintechVolume = monthlyVolumeProcessed > 0 ? monthlyVolumeProcessed : jobsPerMonth * 450;
  const platformCutAmount = Number((fintechVolume * 0.0075).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-slate-800/60 to-emerald-500/10 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <span>Micro-SaaS & Fintech Economics</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Dual-Engine Monetization
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Subscription ($19–$49/mo) + Stripe Connect Fintech Take-Rate (0.75%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Daily 4-Estimate Limit Notice (Shown when triggered by daily cap) */}
          {limitReachedNotice && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-red-500/20 via-amber-500/20 to-red-500/20 border-2 border-amber-400 text-amber-200 shadow-lg shadow-amber-500/10 space-y-2 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h4 className="font-extrabold text-white text-sm sm:text-base">
                  Daily Free Limit Reached (4/4 Voice Estimates Used Today)
                </h4>
              </div>
              <p className="text-xs text-slate-200 font-medium leading-relaxed">
                Naubos mo na ang iyong <strong>4 na libreng estimates para sa araw na ito</strong>. Para maging <strong>UNLIMITED</strong> ang iyong Voice AI, Tap-to-Pay, at Invoicing araw-araw, mag-upgrade sa <strong>TradeCost Pro</strong> gamit ang GCash!
              </p>
            </div>
          )}

          {/* Key Value Proposition Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-emerald-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Why This Micro-SaaS Wins With Contractors</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              &quot;B2B trade contractors readily pay <strong className="text-amber-400">$29/month</strong> because TradeCost Pro recovers <strong className="text-emerald-400">$200+ every single week</strong> in forgotten fittings, primer, seals, and markup leakage, while cutting 2 hours of painful evening paperwork into a 15-second voice memo.&quot;
            </p>
          </div>

          {/* Subscription Tiers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span>1. Monthly Plans & Pro Upgrades</span>
              <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Direct GCash Supported 🇵🇭
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'starter',
                  name: 'Solo Tech',
                  pricePhp: 149,
                  priceUsd: 19,
                  desc: 'Handyman, aircon cleaning & detailers',
                  features: ['Voice AI Estimator (15/mo)', 'Tap-to-Pay & GCash QR', 'Auto Markup Calculator', 'PDF Invoices']
                },
                {
                  id: 'pro',
                  name: 'Pro Contractor',
                  pricePhp: 299,
                  priceUsd: 29,
                  popular: true,
                  desc: 'High-volume field service pro',
                  features: ['Unlimited Voice AI Estimator', 'Material Cost Lookup', 'Customer Signature Pad', 'Official QR Ph Image Upload', 'Profit Leakage Detector']
                },
                {
                  id: 'elite',
                  name: 'Lifetime Pass',
                  pricePhp: 499,
                  priceUsd: 49,
                  desc: 'One-time payment, lifetime access',
                  features: ['Lifetime Access (No Monthly Fees)', 'All Current & Future Features', 'Custom Business Branding', 'Priority VIP Cloud Support', 'Unlimited Invoices']
                }
              ].map((tier) => {
                const isCurrent = settings.subscriptionTier === tier.id;
                const isSelected = selectedPlan === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedPlan(tier.id as any)}
                    className={`relative p-4 rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/80 ring-2 ring-amber-500/40 shadow-xl'
                        : isCurrent
                        ? 'bg-slate-900/90 border-blue-500/50'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 shadow-md">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <div className="text-sm font-bold text-slate-100 flex items-center justify-between">
                        <span>{tier.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{tier.desc}</div>
                      <div className="mt-3 flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-amber-400 font-mono">₱{tier.pricePhp}</span>
                        <span className="text-xs text-slate-400">
                          {tier.id === 'elite' ? 'one-time' : '/buwan'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">(${tier.priceUsd})</span>
                      </div>

                      <div className="mt-3 space-y-1.5 border-t border-slate-800/80 pt-3">
                        {tier.features.map((f, i) => (
                          <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(tier.id as any);
                        onUpdateTier(tier.id as any);
                        playChime('success');
                      }}
                      className={`w-full mt-4 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : isSelected
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isCurrent ? 'Active Plan' : `Piliin (₱${tier.pricePhp})`}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct GCash Payment Box to Platform Creator */}
          <div className="bg-gradient-to-br from-blue-950/40 via-slate-950 to-slate-900 p-4 rounded-xl border border-blue-600/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">G</span>
                Bayaran Gamit ang GCash (Diretso sa Creator)
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                0% Transaction Fees
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              I-send ang bayad sa napiling plano (<strong className="text-amber-400 font-bold">{selectedPlan.toUpperCase()}</strong>) sa GCash number sa ibaba, at i-enter ang Reference Number para ma-unlock agad:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800">
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">GCash Account Name:</span>
                <span className="font-black text-slate-100 text-sm">{creatorAccountName}</span>
                
                <span className="text-[10px] text-slate-400 block uppercase font-mono mt-3">Creator GCash Mobile Number:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono font-black text-blue-300 text-base tracking-wider">
                    {creatorGcashNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCreatorGcash}
                    className="px-2.5 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-[10px] font-bold flex items-center gap-1 transition shadow-sm"
                  >
                    {copiedGcash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedGcash ? 'Kopyado!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* QR Code image preview */}
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-mono mb-1">Scan QR via GCash App</span>
                {!qrImgFailed ? (
                  <img
                    src="/gcash-qr.jpg"
                    alt="TradeCost Pro GCash QR"
                    onError={() => setQrImgFailed(true)}
                    className="w-28 h-28 object-contain rounded-md border border-slate-700 bg-white p-1"
                  />
                ) : (
                  <div className="w-28 h-28 bg-blue-950/50 border border-blue-800/40 rounded-md flex flex-col items-center justify-center p-1 text-[10px] text-blue-300">
                    <span className="font-mono font-black">0916 768 5173</span>
                    <span className="text-[8px] text-slate-400 mt-1">TradeCost Pro</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="I-type ang GCash Reference # (hal. 100982736412)"
                value={gcashRef}
                onChange={(e) => setGcashRef(e.target.value)}
                className="w-full flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => handleVerifyGcashPayment(selectedPlan)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-emerald-950"
              >
                <Check className="w-4 h-4" />
                <span>I-verify & I-unlock</span>
              </button>
            </div>
          </div>

          {/* ☕ Buy the Creator a Coffee / Tip Box */}
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-400" />
                Suportahan ang Developer / Mag-Kape (GCash Tip)
              </span>
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20" />
            </div>
            <p className="text-[11px] text-slate-300">
              Nakatulong ba sa hanapbuhay mo ang libreng app na ito? Pwede kang mag-abot ng tip o pambili ng kape via GCash:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {[20, 50, 100, 200].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSendTip(amt)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 border border-amber-700/50 text-amber-300 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>☕ ₱{amt}</span>
                </button>
              ))}
            </div>
            {tipSuccess && (
              <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 p-2 rounded-lg font-medium">
                {tipSuccess}
              </div>
            )}
          </div>

          {/* Interactive ROI & Leakage Calculator */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-sky-400" />
                Technician Value & ROI Simulator
              </span>
              <span className="text-xs font-extrabold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {roiMultiplier}x Annualized ROI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Jobs Per Month: <strong className="text-slate-200 font-mono">{jobsPerMonth}</strong>
                </label>
                <input
                  type="range"
                  min={10}
                  max={80}
                  value={jobsPerMonth}
                  onChange={(e) => setJobsPerMonth(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Forgotten Parts/Job: <strong className="text-slate-200 font-mono">${avgLeakagePerJob}</strong>
                </label>
                <input
                  type="range"
                  min={15}
                  max={100}
                  step={5}
                  value={avgLeakagePerJob}
                  onChange={(e) => setAvgLeakagePerJob(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-amber-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Admin Saved/Job: <strong className="text-slate-200 font-mono">{hoursSavedPerJob} hr</strong>
                </label>
                <input
                  type="range"
                  min={0.25}
                  max={1.5}
                  step={0.25}
                  value={hoursSavedPerJob}
                  onChange={(e) => setHoursSavedPerJob(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-emerald-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Simulation Results Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Recovered Parts:</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                  {formatCurrency(monthlyPartsRecovered)}/mo
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Billing Time Saved:</span>
                <span className="text-sm sm:text-base font-bold text-sky-400 font-mono">
                  {hoursSavedMonthly} hrs ({formatCurrency(laborAdminSavings)})
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Net Tech Gain:</span>
                <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
                  +{formatCurrency(netMonthlyROI)}/mo
                </span>
              </div>
            </div>
          </div>

          {/* 2. Fintech Take-Rate (Stripe Connect Engine) */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                2. Fintech Take-Rate (0.75% Stripe Connect Cut)
              </span>
              <span className="text-emerald-400 font-mono text-[11px] font-bold">
                Connected & Verified
              </span>
            </div>
            <p className="text-xs text-slate-400">
              On every tap-to-pay or QR invoice transaction, TradeCost Pro earns a 0.75% platform fee via Stripe Connect Application Fees.
            </p>
            <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Monthly Invoice Volume:</span>
                <span className="font-mono font-bold text-slate-200">{formatCurrency(fintechVolume)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">SaaS Fintech Earnings:</span>
                <span className="font-mono font-bold text-purple-400">+{formatCurrency(platformCutAmount)}/mo</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
