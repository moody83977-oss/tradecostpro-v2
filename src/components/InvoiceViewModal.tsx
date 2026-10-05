import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Download, 
  X, 
  Check, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  DollarSign,
  Copy,
  Receipt,
  MessageCircle,
  Smartphone,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Job, ContractorSettings } from '../types';
import { calculateJobFinancials, formatCurrency, playChime } from '../utils/calculations';
import { QRCodeDisplay } from './QRCodeDisplay';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  settings: ContractorSettings;
  onOpenPayment?: () => void;
}

export const InvoiceViewModal: React.FC<InvoiceViewModalProps> = ({
  isOpen,
  onClose,
  job,
  settings,
  onOpenPayment
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareBar, setShowShareBar] = useState(false);

  if (!isOpen) return null;

  const financials = calculateJobFinancials(job);
  const isPaid = job.status === 'paid';
  const currencySymbol = settings.currency === 'PHP' ? '₱' : '$';

  const handlePrint = () => {
    window.print();
  };

  const getInvoiceText = () => {
    return `📋 OFFICIAL INVOICE #${job.invoiceNumber}
🏢 Contractor: ${settings.businessName} (${settings.trade})
👤 Client: ${job.customerName}
📍 Address: ${job.jobAddress || 'On-site'}
🔨 Scope: ${job.title}

💰 Total Amount Due: ${currencySymbol}${financials.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
${isPaid ? '✅ Status: PAID IN FULL' : '⏳ Status: READY FOR PAYMENT'}
${settings.gcashActive && settings.gcashNumber ? `📱 GCash Payout: ${settings.gcashNumber} (${settings.gcashAccountName || settings.businessName})` : ''}

Thank you for your business!
⚡ Estimated & Invoiced using TradeCost Pro (Free Tool): https://tradecostpro-v2.vercel.app`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getInvoiceText());
    setCopied(true);
    playChime('success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareMessenger = () => {
    handleCopyText();
    window.open('https://www.messenger.com', '_blank');
  };

  const handleShareViber = () => {
    const text = encodeURIComponent(getInvoiceText());
    window.location.href = `viber://forward?text=${text}`;
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(getInvoiceText());
    const phone = job.customerPhone ? job.customerPhone.replace(/[^0-9+]/g, '') : '';
    window.location.href = `sms:${phone}?body=${text}`;
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: `Invoice #${job.invoiceNumber} - ${settings.businessName}`,
        text: getInvoiceText(),
        url: 'https://tradecostpro-v2.vercel.app'
      }).catch(() => {});
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:text-black print:max-w-none">
        
        {/* Actions Bar (hidden on print) */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-slate-200 text-sm">
              Invoice #{job.invoiceNumber}
            </span>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              isPaid
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isPaid ? 'PAID IN FULL' : 'READY TO BILL'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isPaid && onOpenPayment && (
              <button
                type="button"
                onClick={onOpenPayment}
                className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Collect Payment</span>
              </button>
            )}
            <button
              type="button"
              onClick={handlePrint}
              className="py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShareNative}
              className="py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1-Click Send to Client Bar (Messenger / Viber / SMS) */}
        <div className="px-5 py-2.5 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
          <span className="text-slate-400 font-semibold flex items-center gap-1.5 text-[11px]">
            <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
            Send to Customer:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareMessenger}
              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold transition flex items-center gap-1 text-[11px]"
              title="Copy invoice details & open Messenger"
            >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Messenger</span>
            </button>
            <button
              type="button"
              onClick={handleShareViber}
              className="px-2.5 py-1 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-bold transition flex items-center gap-1 text-[11px]"
              title="Share invoice directly via Viber"
            >
              <span>Viber</span>
            </button>
            <button
              type="button"
              onClick={handleShareSMS}
              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold transition flex items-center gap-1 text-[11px]"
              title="Send text message / SMS"
            >
              <Smartphone className="w-3 h-3" />
              <span>SMS</span>
            </button>
            <button
              type="button"
              onClick={handleCopyText}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium transition flex items-center gap-1 text-[11px]"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-6 sm:p-8 bg-slate-950 text-slate-100 print:bg-white print:text-black space-y-6 max-h-[82vh] overflow-y-auto print:max-h-none print:overflow-visible">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-slate-800 print:border-gray-300 pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 print:text-black tracking-tight">
                {settings.businessName}
              </h2>
              <p className="text-xs text-amber-400 font-semibold print:text-gray-700 mt-0.5">
                Licensed & Insured Trade Contractor • {job.trade}
              </p>
              <div className="text-xs text-slate-400 print:text-gray-600 space-y-0.5 mt-2">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3" />
                  <span>{settings.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3" />
                  <span>{settings.email}</span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="text-slate-400 print:text-gray-600">
                <span className="font-semibold text-slate-300 print:text-gray-800">Date:</span> {new Date(job.createdAt).toLocaleDateString()}
              </div>
              <div className="text-slate-400 print:text-gray-600">
                <span className="font-semibold text-slate-300 print:text-gray-800">Due:</span> Upon Completion
              </div>
              <div className="text-slate-400 print:text-gray-600">
                <span className="font-semibold text-slate-300 print:text-gray-800">Technician:</span> {settings.technicianName}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider block mb-1">
                Bill To:
              </span>
              <div className="font-bold text-slate-200 print:text-black text-sm">
                {job.customerName}
              </div>
              <div className="text-slate-400 print:text-gray-600 mt-0.5 flex items-start gap-1">
                <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{job.jobAddress || 'On-site service address on work order'}</span>
              </div>
              {job.customerPhone && (
                <div className="text-slate-400 print:text-gray-600 mt-0.5">
                  Phone: {job.customerPhone}
                </div>
              )}
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider block mb-1">
                Job Scope / Title:
              </span>
              <div className="font-semibold text-slate-200 print:text-black">
                {job.title}
              </div>
              <p className="text-slate-400 print:text-gray-600 mt-1 line-clamp-2">
                {job.description || 'Full trade service installation, repair, and diagnostic completed according to specifications.'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-slate-800 print:border-gray-300 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 print:bg-gray-100 text-slate-400 print:text-gray-700 font-semibold border-b border-slate-800 print:border-gray-300">
                <tr>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3 text-right">Qty / Hrs</th>
                  <th className="py-2.5 px-3 text-right">Unit Rate</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
                {job.lineItems.map((item) => (
                  <tr key={item.id} className="text-slate-300 print:text-gray-800">
                    <td className="py-2.5 px-3 font-medium">{item.description}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded ${
                        item.type === 'labor' 
                          ? 'bg-blue-500/10 text-blue-400 print:text-blue-700' 
                          : item.type === 'material'
                          ? 'bg-amber-500/10 text-amber-400 print:text-amber-800'
                          : 'bg-purple-500/10 text-purple-400 print:text-purple-700'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(item.unitCost)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold">
                      {formatCurrency(item.quantity * item.unitCost * (1 + (item.markupPercentage || 0) / 100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="w-full sm:w-1/2 space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider block">
                Payment Instructions:
              </span>
              <div className="p-3 bg-slate-900 print:bg-gray-100 rounded-xl border border-slate-800 print:border-gray-200 text-xs text-slate-400 print:text-gray-700 space-y-1">
                {settings.gcashActive && settings.gcashNumber ? (
                  <div>
                    <strong className="text-blue-400">GCash / QR Ph:</strong> Send to {settings.gcashNumber} ({settings.gcashAccountName || settings.businessName})
                  </div>
                ) : null}
                <div>
                  <strong className="text-slate-300 print:text-black">Accepted:</strong> GCash, Maya, QR Ph, Contactless Card, Cash
                </div>
              </div>
            </div>

            <div className="w-full sm:w-72 space-y-1.5 text-xs text-slate-400 print:text-gray-700">
              <div className="flex justify-between">
                <span>Labor Subtotal:</span>
                <span className="font-mono text-slate-200 print:text-black">{formatCurrency(financials.laborSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Materials Subtotal:</span>
                <span className="font-mono text-slate-200 print:text-black">{formatCurrency(financials.materialsSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Material Markup:</span>
                <span className="font-mono text-slate-200 print:text-black">{formatCurrency(financials.markupAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Sales Tax ({job.taxRate}%):</span>
                <span className="font-mono text-slate-200 print:text-black">{formatCurrency(financials.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-100 print:text-black pt-2 border-t border-slate-800 print:border-gray-300">
                <span>Total Due:</span>
                <span className="font-mono text-amber-400 print:text-black">{formatCurrency(financials.finalTotal)}</span>
              </div>
            </div>
          </div>

          {/* Signature & Payment Receipt Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 print:border-gray-300 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 print:text-gray-500 tracking-wider block mb-2">
                Customer Signature:
              </span>
              {job.signature ? (
                <div className="p-2 rounded-lg bg-slate-900 print:bg-white border border-slate-800 print:border-gray-300 inline-block">
                  <img src={job.signature} alt="Customer Signature" className="h-12 block" />
                  <span className="text-[9px] text-emerald-400 print:text-gray-600 font-mono block mt-1">
                    Digitally signed on-site
                  </span>
                </div>
              ) : (
                <div className="h-12 border-b border-dashed border-slate-700 print:border-gray-400 flex items-end">
                  <span className="text-[10px] text-slate-600 print:text-gray-400 italic">Signature on file</span>
                </div>
              )}
            </div>

            {isPaid && job.paymentDetails && (
              <div className="bg-slate-900/80 print:bg-gray-50 p-3 rounded-xl border border-slate-800 print:border-gray-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 print:text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Paid: {formatCurrency(job.paymentDetails.totalPaid)}</span>
                </div>
                <div className="text-[11px] text-slate-400 print:text-gray-600 flex items-center gap-1.5">
                  {job.paymentDetails.method.includes('GCash') && (
                    <span className="w-3.5 h-3.5 rounded-full bg-blue-500 text-white text-[8px] font-black flex items-center justify-center">G</span>
                  )}
                  <span>Method: {job.paymentDetails.method}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 print:text-gray-500">
                  {job.paymentDetails.gcashRefNumber ? (
                    <span>GCash Ref: <strong className="text-blue-400">{job.paymentDetails.gcashRefNumber}</strong></span>
                  ) : (
                    <span>Tx ID: {job.paymentDetails.transactionId}</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Viral Referral Badge (Both Onscreen & Print) */}
          <div className="pt-4 border-t border-slate-800 print:border-gray-300 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 print:text-gray-600 gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-amber-400">⚡</span>
              <span>Generated with <strong className="text-slate-300 print:text-black font-bold">TradeCost Pro</strong> • Free Invoicing & Estimator for Tradesmen</span>
            </div>
            <a 
              href="https://tradecostpro-v2.vercel.app" 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-400 hover:text-blue-300 print:text-gray-700 underline font-mono text-[10px] flex items-center gap-1"
            >
              <span>tradecostpro-v2.vercel.app</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
