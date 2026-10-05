# TradeCost Pro - Mobile Job Costing, Field CRM & Invoicing

Mobile web app built for plumbing, HVAC, electrical, auto detailing, solar, roofing, and general trade contractors.

Features:
- **Voice-to-Estimate**: Speak natural job notes on-site; AI extracts line items, hours, materials, and leakage alerts.
- **Paywall & Usage Limits**: 4 free estimates per day; Pro upgrade via GCash or Stripe.
- **Tap-to-Pay & GCash Invoicing**: Generate payment QR codes, SMS/WhatsApp invoice links, and client receipts.
- **Real-Time Margin & Leakage Alerts**: Catch forgotten fasteners, glue, tape, trip fees, and consumables.
- **Offline / PWA Ready**: Installable to Android / iOS home screens.

---

## 🚀 How to Deploy to Vercel (Step-by-Step)

### Option 1: Via GitHub (Recommended - 2 Minutes)
1. Unzip this folder and push to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial TradeCost Pro commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/tradecostpro.git
   git push -u origin main
   ```
2. Go to [https://vercel.com/new](https://vercel.com/new) and log in.
3. Import your `tradecostpro` repository.
4. Vercel will automatically detect **Vite**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* In **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key from Google AI Studio (optional; automatic fallback parser is built-in!)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key if enabling live credit cards.
6. Click **Deploy**! Your app will be live with a free `.vercel.app` domain!

---

### Option 2: Deploying via Vercel CLI (Super Fast)
1. Open your terminal in this project directory.
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the quick on-screen prompts (accept default settings).
4. For production deployment:
   ```bash
   npx vercel --prod
   ```

---

## 💻 Local Development
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
