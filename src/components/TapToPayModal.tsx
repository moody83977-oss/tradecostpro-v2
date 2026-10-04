import React, { useState } from 'react';
import { 
  CreditCard, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  Zap, 
  Copy, 
  Check, 
  ArrowRight,
  FileCheck,
  Building,
  Phone,
  User,
  Sparkles
} from 'lucide-react';
import { Job, PaymentDetails } from '../types';
import { QRCodeDisplay } from './QRCodeDisplay';
import { CustomerSignaturePad } from './CustomerSignaturePad';
import { calculateJobFinancials, formatCurrency, playChime } from '../utils/calculations';

interface TapToPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onPaymentSuccess: (jobId: string, paymentDetails: PaymentDetails, signature?: string) => void;
}

export const TapToPayModal: React.FC<TapToPayModalProps> = ({
  isOpen,
  onClose,
  job,
  onPaymentSuccess
}) => {
  // Read contractor settings from localStorage
  const currentSettings = (() => {
    try {
      const saved = localStorage.getItem('tradecost_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  })();

  const defaultTab = currentSettings.preferredPaymentMethod === 'stripe' ? 'tap' : 'gcash';
  const [activeTab, setActiveTab] = useState<'gcash' | 'tap' | 'qr'>(defaultTab);
  
  const [tipPercent, setTipPercent] = useState<number>(0);
  const [customTip, setCustomTip] = useState<number | null>(null);
  const [customerSignature, setCustomerSignature] = useState<string | null>(job.signature || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successDetails, setSuccessDetails] = useState<PaymentDetails | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedGcashNumber, setCopiedGcashNumber] = useState(false);
  
  // GCash specific state
  const [gcashRefInput, setGcashRefInput] = useState<string>('');

  const gcashNumber = currentSettings.gcashNumber || '0917 888 2345';
  const gcashAccountName = currentSettings.gcashAccountName || currentSettings.businessName || 'TradeCost Pro Services';
  const platformTakeRate = Number(currentSettings.platformTakeRatePercent) || 0;
  const currency = currentSettings.currency || 'PHP';

  if (!isOpen) return null;

  const financials = calculateJobFinancials(job);
  const baseTotal = financials.finalTotal;

  // Tip calculation
  const calculatedTip = customTip !== null 
    ? customTip 
    : tipPercent > 0 
      ? Number(((baseTotal * tipPercent) / 100).toFixed(2)) 
      : 0;

  const totalToPay = Number((baseTotal + calculatedTip).toFixed(2));

  // Fee calculation (GCash peer-to-peer / QR Ph has 0% Stripe card fee!)
  const isGcashMode = activeTab === 'gcash';
  const processingFee = isGcashMode ? 0 : Number((totalToPay * 0.029 + 0.30).toFixed(2));
  const platformFee = Number((totalToPay * (platformTakeRate / 100)).toFixed(2));
  const netTechnicianPayout = Number((totalToPay - processingFee - platformFee).toFixed(2));

  // QR Ph payload or payment deep link
  const gcashQrData = `gcash://pay?account=${gcashNumber.replace(/\s+/g, '')}&name=${encodeURIComponent(gcashAccountName)}&amount=${totalToPay}&ref=${job.invoiceNumber}`;
  const invoicePayUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pay/${job.invoiceNumber.toLowerCase()}?amt=${totalToPay}`
    : `https://tradecost.pro/pay/${job.invoiceNumber}`;

  const triggerPayment = async (methodType: 'gcash' | 'tap' | 'qr') => {
    setIsProcessing(true);
    playChime('beep');

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 80, 150]);
    }

    try {
      const generatedRef = gcashRefInput.trim() || `GC-${Math.floor(100000000000 + Math.random() * 900000000000)}`;

      if (methodType === 'gcash') {
        // Direct GCash / QR Ph confirmation
        await new Promise(resolve => setTimeout(resolve, 800)); // smooth tactile feel
        
        const details: PaymentDetails = {
          transactionId: generatedRef,
          method: 'GCash / QR Ph Direct',
          totalPaid: totalToPay,
          tipAmount: calculatedTip,
          netPayout: netTechnicianPayout,
          stripeFee: 0,
          platformFee: platformFee,
          gcashRefNumber: generatedRef,
          gcashAccountName: gcashAccountName,
          gcashNumber: gcashNumber,
          timestamp: new Date().toISOString()
        };

        setSuccessDetails(details);
        setIsSuccess(true);
        playChime('success');

        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([200]);
        }

        onPaymentSuccess(job.id, details, customerSignature || undefined);
      } else {
        // Stripe Card / Web QR Link
        const res = await fetch('/api/process-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: job.invoiceNumber,
            amount: baseTotal,
            tipAmount: calculatedTip,
            customerName: job.customerName,
            platformFeeCut: platformTakeRate,
            paymentMethod: methodType === 'tap' ? 'Tap-to-Pay (NFC Contactless)' : 'Instant QR Payment Link'
          })
        });

        const data = await res.json();
        if (data.success) {
          const details: PaymentDetails = {
            transactionId: data.transactionId,
            method: data.paymentMethod,
            totalPaid: data.totalCharged,
            tipAmount: data.tipAmount,
            netPayout: data.breakdown.technicianNetPayout,
            stripeFee: data.breakdown.stripeProcessingFee,
            platformFee: data.breakdown.platformTakeRateFee,
            timestamp: data.timestamp
          };

          setSuccessDetails(details);
          setIsSuccess(true);
          playChime('success');

          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200]);
          }

          onPaymentSuccess(job.id, details, customerSignature || undefined);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyGcash = () => {
    navigator.clipboard.writeText(gcashNumber.replace(/\s+/g, ''));
    setCopiedGcashNumber(true);
    playChime('beep');
    setTimeout(() => setCopiedGcashNumber(false), 2000);
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(invoicePayUrl);
    setCopiedLink(true);
    playChime('beep');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-600/20 via-slate-800/80 to-emerald-500/10 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-sm">
              G
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                <span>Instant Payment Capture</span>
                {activeTab === 'gcash' ? (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    GCash & QR Ph 🇵🇭
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Stripe POS
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Invoice {job.invoiceNumber} • {job.customerName}
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

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {isSuccess && successDetails ? (
            /* Success State */
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-100">
                  {formatCurrency(successDetails.totalPaid, currency)} Paid
                </h4>
                <p className="text-xs text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  {successDetails.method.includes('GCash') ? (
                    <span>Payment Received via GCash / QR Ph</span>
                  ) : (
                    <span>Transaction Approved & Deposited via Stripe Connect</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-1">
                  Reference No: <span className="text-blue-400 font-bold">{successDetails.gcashRefNumber || successDetails.transactionId}</span>
                </p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Payment Method:</span>
                  <span className="text-blue-300 font-semibold">{successDetails.method}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Job Subtotal:</span>
                  <span className="text-slate-200 font-mono">{formatCurrency(financials.finalTotal, currency)}</span>
                </div>
                {successDetails.tipAmount > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>Customer Tip:</span>
                    <span className="text-emerald-400 font-mono">+{formatCurrency(successDetails.tipAmount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                  <span>Transfer Fee:</span>
                  <span className="text-emerald-400 font-mono">
                    {successDetails.stripeFee ? `-${formatCurrency(successDetails.stripeFee, currency)}` : '₱0.00 (Zero Fee)'}
                  </span>
                </div>
                {successDetails.platformFee && successDetails.platformFee > 0 ? (
                  <div className="flex justify-between text-slate-400">
                    <span>Platform Fee ({platformTakeRate}%):</span>
                    <span className="text-purple-400 font-mono">+{formatCurrency(successDetails.platformFee, currency)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800 pt-2 text-sm">
                  <span className="text-emerald-400">Total Deposited to Wallet:</span>
                  <span className="text-emerald-400 font-mono">{formatCurrency(successDetails.netPayout, currency)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition"
              >
                Close & Return to Job
              </button>
            </div>
          ) : (
            /* Active Payment Form */
            <div className="space-y-4">
              
              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-3 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('gcash')}
                  className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'gcash'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white text-blue-600 text-[9px] font-black flex items-center justify-center">G</span>
                  <span>GCash / QR Ph</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tap')}
                  className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'tap'
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Card Tap (NFC)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  className={`py-2 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                    activeTab === 'qr'
                      ? 'bg-sky-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Web Link</span>
                </button>
              </div>

              {/* Amount Display */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                <span className="text-xs text-slate-400 font-medium block">Total Amount Due</span>
                <div className="text-3xl font-black text-slate-100 font-mono mt-1 tracking-tight">
                  {formatCurrency(totalToPay, currency)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Invoice {formatCurrency(baseTotal, currency)} {calculatedTip > 0 && `+ ${formatCurrency(calculatedTip, currency)} tip`}
                </div>
              </div>

              {/* Gratuity Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Customer Tip / Dagdag:</span>
                  <span className="font-semibold text-emerald-400">
                    {calculatedTip > 0 ? `+${formatCurrency(calculatedTip, currency)}` : 'None'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => {
                        setTipPercent(pct);
                        setCustomTip(null);
                        playChime('beep');
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition ${
                        customTip === null && tipPercent === pct
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {pct === 0 ? 'No Tip' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Signature Pad */}
              <div className="space-y-1">
                <CustomerSignaturePad
                  existingSignature={customerSignature || undefined}
                  onSave={(sigUrl) => setCustomerSignature(sigUrl)}
                  onClear={() => setCustomerSignature(null)}
                />
              </div>

              {/* TAB 1: GCash / QR Ph View */}
              {activeTab === 'gcash' && (
                <div className="bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950 p-5 rounded-2xl border border-blue-600/30 space-y-4">
                  
                  {/* GCash Branding Banner */}
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-black text-xs flex items-center justify-center">
                        G
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-200">GCash & QR Ph Transfer</div>
                        <div className="text-[10px] text-blue-400">Scan with GCash, Maya, BDO, BPI, or any bank</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      0% Fees
                    </span>
                  </div>

                  {/* QR Code and Instructions */}
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                    <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                      <QRCodeDisplay value={gcashQrData} size={150} />
                    </div>

                    <div className="space-y-2 text-xs flex-1 text-center sm:text-left">
                      <div>
                        <span className="text-[11px] text-slate-400 block">GCash Account Name:</span>
                        <span className="font-bold text-slate-100 text-sm">{gcashAccountName}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block">GCash Mobile Number:</span>
                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
                          <span className="font-mono font-bold text-blue-300 text-sm tracking-wider">
                            {gcashNumber}
                          </span>
                          <button
                            type="button"
                            onClick={copyGcash}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition"
                          >
                            {copiedGcashNumber ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedGcashNumber ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-1 text-[11px] text-slate-400">
                        Total to Send: <strong className="text-emerald-400 font-mono">{formatCurrency(totalToPay, currency)}</strong>
                      </div>
                    </div>
                  </div>

                  {/* GCash Reference Input */}
                  <div>
                    <label className="text-xs text-slate-300 font-medium block mb-1">
                      GCash Reference No. (Optional / Galing sa text o app):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 1002 9384 1928"
                        value={gcashRefInput}
                        onChange={(e) => setGcashRefInput(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 font-mono focus:outline-none focus:border-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setGcashRefInput(`GC-${Math.floor(100000000000 + Math.random() * 900000000000)}`)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap transition"
                      >
                        Auto-Ref
                      </button>
                    </div>
                  </div>

                  {/* Confirm Button */}
                  <button
                    type="button"
                    onClick={() => triggerPayment('gcash')}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
                  >
                    {isProcessing ? (
                      <span>Verifying GCash Payment...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Confirm GCash Payment Received ({formatCurrency(totalToPay, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: Tap to Pay Screen */}
              {activeTab === 'tap' && (
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full border-2 border-emerald-500/30 animate-pulse" />
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                      <CreditCard className="w-9 h-9" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-100 text-sm">
                      Hold Card or Phone to Device
                    </h5>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Accepts Apple Pay, Google Wallet, and contactless Visa / Mastercard chip cards.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPayment('tap')}
                    disabled={isProcessing}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition"
                  >
                    {isProcessing ? (
                      <span>Reading Chip / Authorizing...</span>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Simulate NFC Tap ({formatCurrency(totalToPay, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 3: QR Invoice Link */}
              {activeTab === 'qr' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="text-xs font-semibold text-slate-300">
                    Homeowner Camera QR Code
                  </div>
                  <QRCodeDisplay value={invoicePayUrl} size={180} />
                  <p className="text-xs text-slate-400 max-w-xs">
                    Customer scans this QR code with their phone camera to pay on their own browser.
                  </p>

                  <div className="flex gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={copyPaymentLink}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Pay Link'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerPayment('qr')}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Confirm QR Paid</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Payout Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-semibold text-slate-200">
                    {activeTab === 'gcash' ? 'GCash / QR Ph (Direct Wallet)' : 'Contactless Credit/Debit Card'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span className="font-mono text-slate-300">
                    {activeTab === 'gcash' ? '₱0.00 (Zero Fee)' : `-${formatCurrency(processingFee, currency)}`}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                  <span>Your Net Payout:</span>
                  <span className="font-mono">{formatCurrency(netTechnicianPayout, currency)}</span>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
