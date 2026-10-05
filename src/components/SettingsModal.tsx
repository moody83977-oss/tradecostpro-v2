import React, { useState } from 'react';
import { 
  Settings, 
  X, 
  Save, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Wrench, 
  Sun, 
  DollarSign, 
  Percent, 
  ShieldCheck,
  Check,
  CreditCard,
  ExternalLink,
  HelpCircle,
  Upload,
  QrCode,
  Trash2
} from 'lucide-react';
import { ContractorSettings, TradeType } from '../types';
import { playChime } from '../utils/calculations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ContractorSettings;
  onSave: (newSettings: ContractorSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave
}) => {
  const [formData, setFormData] = useState<ContractorSettings>(settings);
  const [savedToast, setSavedToast] = useState(false);

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormData(prev => ({ ...prev, gcashQrCodeUrl: result }));
        playChime('success');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    playChime('success');
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                Contractor Profile & Rates
              </h3>
              <p className="text-xs text-slate-400">
                Configure your business info, trade rates, and field preferences
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Business Info */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Business Identity
            </span>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Company / DBA Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Technician Name</label>
                <input
                  type="text"
                  value={formData.technicianName}
                  onChange={(e) => setFormData({ ...formData, technicianName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Primary Trade</label>
                <select
                  value={formData.trade}
                  onChange={(e) => setFormData({ ...formData, trade: e.target.value as TradeType })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="Plumbing">Plumbing</option>
                  <option value="HVAC">HVAC</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Auto Detailing">Auto Detailing</option>
                  <option value="Solar / Roofing">Solar / Roofing</option>
                  <option value="Handyman">Handyman</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1">Billing Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Currency Preference */}
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Default App Currency</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'PHP' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    formData.currency === 'PHP'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base font-black">₱</span>
                  <span>PHP (Philippine Peso)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, currency: 'USD' })}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    formData.currency === 'USD'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base font-black">$</span>
                  <span>USD (US Dollar)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Presets */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Default Job-Costing Rates
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Labor Rate ({formData.currency === 'PHP' ? '₱' : '$'}/hr)
                </label>
                <div className="relative">
                  <span className="text-xs text-slate-500 absolute left-2.5 top-2">
                    {formData.currency === 'PHP' ? '₱' : '$'}
                  </span>
                  <input
                    type="number"
                    value={formData.defaultHourlyRate}
                    onChange={(e) => setFormData({ ...formData, defaultHourlyRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-6 pr-2 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Material Markup</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.defaultMaterialMarkup}
                    onChange={(e) => setFormData({ ...formData, defaultMaterialMarkup: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-6 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-500 absolute right-2.5 top-2">%</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Tax Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-3 pr-6 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-xs text-slate-500 absolute right-2.5 top-2">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* GCash & QR Ph Direct Mobile Payments (Philippines) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">G</span>
                GCash & QR Ph Mobile Payouts 🇵🇭
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                Direct to GCash Wallet
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">GCash / QR Ph Active</div>
                  <div className="text-[10px] text-slate-400">Accept GCash, Maya, and QR Ph transfers from customers</div>
                </div>
                <div 
                  onClick={() => setFormData({ ...formData, gcashActive: !formData.gcashActive })}
                  className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${formData.gcashActive ? 'bg-blue-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition transform ${formData.gcashActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-900/40">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    Your GCash Mobile Number:
                  </label>
                  <input
                    type="text"
                    placeholder="0917 123 4567"
                    value={formData.gcashNumber || ''}
                    onChange={(e) => setFormData({ ...formData, gcashNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-blue-300 font-mono focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Customer sends payment here</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">
                    GCash Account Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Juan D."
                    value={formData.gcashAccountName || ''}
                    onChange={(e) => setFormData({ ...formData, gcashAccountName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-400"
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block">Shown on payment QR code</span>
                </div>
              </div>

              {/* Official GCash QR Image Uploader */}
              <div className="pt-2 border-t border-blue-900/40">
                <label className="text-[11px] text-slate-300 font-medium block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-blue-400" />
                    Official GCash / QR Ph Image:
                  </span>
                  {formData.gcashQrCodeUrl && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3 h-3" /> Image Loaded
                    </span>
                  )}
                </label>

                {formData.gcashQrCodeUrl ? (
                  <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-blue-500/30">
                    <img 
                      src={formData.gcashQrCodeUrl} 
                      alt="GCash QR Preview" 
                      className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-slate-700 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">Your Official QR Ph Image</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Customers can scan this directly using GCash, Maya, or any bank app</p>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, gcashQrCodeUrl: undefined }))}
                        className="mt-1.5 text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" /> Remove & use auto-generator
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-3 rounded-xl border-2 border-dashed border-blue-600/40 hover:border-blue-500 bg-blue-950/30 hover:bg-blue-950/50 cursor-pointer transition text-center group">
                    <Upload className="w-4 h-4 text-blue-400 group-hover:scale-110 transition mb-1" />
                    <span className="text-xs font-bold text-blue-200">
                      Upload Official GCash QR Image
                    </span>
                    <span className="text-[10px] text-blue-400/80 mt-0.5">
                      Screenshot from GCash app (QR ➜ Receive Money ➜ Save QR)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="text-[11px] text-slate-300 block mb-1">
                  Preferred Payment Method on Job Completion:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredPaymentMethod: 'gcash' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      formData.preferredPaymentMethod === 'gcash'
                        ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    GCash Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredPaymentMethod: 'both' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      formData.preferredPaymentMethod === 'both'
                        ? 'bg-blue-600/30 border-blue-400 text-blue-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Both (GCash + Card)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredPaymentMethod: 'stripe' })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                      formData.preferredPaymentMethod === 'stripe'
                        ? 'bg-purple-600/30 border-purple-400 text-purple-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Stripe Card Only
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Payouts & Commission Engine */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                Stripe Payouts & Commission Split
              </span>
              <a
                href="https://dashboard.stripe.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition"
              >
                <span>Stripe Dashboard</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Stripe Connect Active</div>
                  <div className="text-[10px] text-slate-400">Enables automated invoice split payouts & tap-to-pay capture</div>
                </div>
                <div 
                  onClick={() => setFormData({ ...formData, stripeConnectActive: !formData.stripeConnectActive })}
                  className={`w-10 h-5 rounded-full p-0.5 transition cursor-pointer ${formData.stripeConnectActive ? 'bg-purple-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition transform ${formData.stripeConnectActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Platform Fee Cut (%):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="5.0"
                      value={formData.platformTakeRatePercent ?? 1.0}
                      onChange={(e) => setFormData({ ...formData, platformTakeRatePercent: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-purple-400"
                    />
                    <span className="text-xs text-slate-500 absolute right-2.5 top-1.5">%</span>
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 block">Your commission cut per payment</span>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Stripe Account ID:
                  </label>
                  <input
                    type="text"
                    placeholder="acct_1..."
                    value={formData.stripeAccountId || ''}
                    onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[9px] text-slate-500 mt-0.5 block">Where commission is deposited</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Stripe Publishable Key (pk_live or pk_test):
                </label>
                <input
                  type="text"
                  placeholder="pk_live_51... or pk_test_51..."
                  value={formData.stripePublishableKey || ''}
                  onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {/* Field Display Mode */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Field Visibility
            </span>
            <div 
              onClick={() => setFormData({ ...formData, sunlightMode: !formData.sunlightMode })}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition"
            >
              <div className="flex items-center gap-2.5">
                <Sun className={`w-4 h-4 ${formData.sunlightMode ? 'text-amber-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-semibold text-slate-200">Sunlight / High-Contrast Mode</div>
                  <div className="text-[11px] text-slate-400">Maximizes visibility when working outdoors on sunny job sites</div>
                </div>
              </div>
              <div className={`w-10 h-5 rounded-full p-0.5 transition ${formData.sunlightMode ? 'bg-amber-400' : 'bg-slate-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-slate-950 transition transform ${formData.sunlightMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition"
            >
              {savedToast ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
