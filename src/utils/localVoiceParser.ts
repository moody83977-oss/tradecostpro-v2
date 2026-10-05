import { LineItem, LeakageAlert } from '../types';

export interface ParseEstimateResult {
  detectedTrade: string;
  jobSummary: string;
  lineItems: LineItem[];
  leakageAlerts: LeakageAlert[];
  potentialSavingsRecovered: number;
  clientNotes: string;
}

export function parseVoiceLocally(
  text: string,
  trade: string,
  hourlyRate: number = 500,
  defaultMarkup: number = 30
): ParseEstimateResult {
  const lower = text.toLowerCase();
  const items: LineItem[] = [];
  const alerts: LeakageAlert[] = [];

  // 1. Detect Trade
  let detectedTrade = trade || 'General Trade';
  if (lower.includes('breaker') || lower.includes('outlet') || lower.includes('wire') || lower.includes('volt') || lower.includes('panel') || lower.includes('short circuit') || lower.includes('thhn')) {
    detectedTrade = 'Electrical';
  } else if (lower.includes('pvc') || lower.includes('pipe') || lower.includes('valve') || lower.includes('faucet') || lower.includes('drain') || lower.includes('trap') || lower.includes('sink')) {
    detectedTrade = 'Plumbing';
  } else if (lower.includes('capacitor') || lower.includes('freon') || lower.includes('refrigerant') || lower.includes('compressor') || lower.includes('ac') || lower.includes('aircon') || lower.includes('coil')) {
    detectedTrade = 'HVAC';
  } else if (lower.includes('detail') || lower.includes('ceramic') || lower.includes('polish') || lower.includes('wax') || lower.includes('wash')) {
    detectedTrade = 'Auto Detailing';
  } else if (lower.includes('solar') || lower.includes('panel') || lower.includes('roof') || lower.includes('inverter') || lower.includes('shingle')) {
    detectedTrade = 'Solar / Roofing';
  }

  // 2. Extract Labor Hours
  let hours = 2; // Default reasonable baseline
  const hoursWordMap: Record<string, number> = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'half': 0.5
  };
  
  const digitHourMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hours|hour|hrs|hr)/);
  if (digitHourMatch) {
    hours = parseFloat(digitHourMatch[1]);
  } else {
    for (const [word, val] of Object.entries(hoursWordMap)) {
      if (lower.includes(`${word} hour`) || lower.includes(`${word} hrs`)) {
        hours = val;
        break;
      }
    }
  }

  items.push({
    id: 'li-labor-1',
    name: `${detectedTrade} Diagnostic, Troubleshooting & Field Labor`,
    category: 'labor',
    quantity: hours,
    unit: 'hrs',
    estimatedWholesaleCost: Math.round(hourlyRate * 0.4),
    markupPercentage: 0,
    unitPrice: hourlyRate,
    total: hours * hourlyRate,
    taxable: false,
    supplierNote: 'Certified Technician On-Site Service'
  });

  // 3. Electrical Materials Extraction
  if (detectedTrade === 'Electrical' || lower.includes('breaker') || lower.includes('outlet') || lower.includes('wire')) {
    if (lower.includes('breaker')) {
      const ampMatch = lower.match(/(\d+)\s*(?:amp|a)\b/);
      const amp = ampMatch ? ampMatch[1] : '60';
      const cost = Number(amp) > 50 ? 450 : 280;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-brk',
        name: `${amp}A Main Circuit Breaker (Bolt-on/Plug-in)`,
        category: 'material',
        quantity: 1,
        unit: 'ea',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price,
        taxable: true,
        supplierNote: 'Electrical Hardware Supply'
      });
    }

    if (lower.includes('outlet') || lower.includes('receptacle')) {
      const qtyMatch = lower.match(/(three|\d+)\s*(?:new\s*)?(?:duplex\s*)?(?:wall\s*)?outlets?/i);
      const qty = qtyMatch ? (qtyMatch[1].toLowerCase() === 'three' ? 3 : parseInt(qtyMatch[1], 10) || 2) : 2;
      const cost = 85;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-out',
        name: 'Duplex Wall Outlets (Heavy Duty Commercial Grade)',
        category: 'material',
        quantity: qty,
        unit: 'ea',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price * qty,
        taxable: true,
        supplierNote: 'Standard Duplex 15A/20A'
      });
    }

    if (lower.includes('wire') || lower.includes('thhn')) {
      const mMatch = lower.match(/(\d+)\s*(?:meters|meter|m|ft|feet)/i);
      const len = mMatch ? parseInt(mMatch[1], 10) : 15;
      const costPerM = 48;
      const pricePerM = Math.round(costPerM * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-wire',
        name: `Stranded Copper Building Wire (Type THHN/THWN-2)`,
        category: 'material',
        quantity: len,
        unit: 'meters',
        estimatedWholesaleCost: costPerM,
        markupPercentage: defaultMarkup,
        unitPrice: pricePerM,
        total: pricePerM * len,
        taxable: true,
        supplierNote: 'Electrical Wire Wholesaler'
      });
    }

    if (lower.includes('junction') || lower.includes('box')) {
      const boxMatch = lower.match(/(two|\d+)\s*(?:pvc\s*)?junction\s*box/i);
      const qty = boxMatch ? (boxMatch[1].toLowerCase() === 'two' ? 2 : parseInt(boxMatch[1], 10) || 2) : 2;
      const cost = 65;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-jbox',
        name: 'PVC Utility / Junction Boxes with Cover',
        category: 'material',
        quantity: qty,
        unit: 'ea',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price * qty,
        taxable: true,
        supplierNote: 'Weatherproof / Indoor Utility'
      });
    }

    // Electrical Leakage Alerts
    alerts.push(
      {
        title: 'Wire Nuts & Electrical Insulating Tape',
        reason: 'Connecting 3 outlets and junction boxes consumes wire twist connectors and electrical tape ($120 retail).',
        suggestedCost: 80,
        suggestedPrice: 120,
        category: 'consumable'
      },
      {
        title: 'Dispatch & Truck Roll Tool Fee',
        reason: 'Standard truck inventory fee covering multimeter, fish tape, testing instruments, and fuel.',
        suggestedCost: 0,
        suggestedPrice: 250,
        category: 'service'
      }
    );
  }

  // 4. Plumbing Materials Extraction
  else if (detectedTrade === 'Plumbing' || lower.includes('pvc') || lower.includes('valve') || lower.includes('trap')) {
    if (lower.includes('valve') || lower.includes('angle stop')) {
      const cost = 280;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-val',
        name: '1/2 in. Lead-Free Brass Ball Shutoff Valve',
        category: 'material',
        quantity: 1,
        unit: 'ea',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price,
        taxable: true,
        supplierNote: 'Brass Quarter-Turn Ball Valve'
      });
    }

    if (lower.includes('pvc') || lower.includes('pipe') || lower.includes('trap')) {
      const cost = 160;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-pvc',
        name: '2 in. PVC Schedule 40 Pipe & Drainage Trap Assembly',
        category: 'material',
        quantity: 1,
        unit: 'kit',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price,
        taxable: true,
        supplierNote: 'DWV Drainage Fittings'
      });
    }

    alerts.push({
      title: 'PVC Solvent Cement & Primer',
      reason: 'Standard plumbing solvent and teflon thread sealant tape consumed on site.',
      suggestedCost: 95,
      suggestedPrice: 150,
      category: 'consumable'
    });
  }

  // 5. HVAC Materials Extraction
  else if (detectedTrade === 'HVAC' || lower.includes('capacitor') || lower.includes('refrigerant')) {
    if (lower.includes('capacitor')) {
      const cost = 320;
      const price = Math.round(cost * (1 + defaultMarkup / 100));
      items.push({
        id: 'li-mat-cap',
        name: 'Dual Round Motor Run Capacitor (45/5 MFD, 440V)',
        category: 'material',
        quantity: 1,
        unit: 'ea',
        estimatedWholesaleCost: cost,
        markupPercentage: defaultMarkup,
        unitPrice: price,
        total: price,
        taxable: true,
        supplierNote: 'HVAC Supplier Wholesale'
      });
    }

    alerts.push({
      title: 'Condenser Coil Foam Cleaner & Acid Wash',
      reason: 'Cleaning heavy dirt on condenser fins consumes specialized foaming coil cleaner.',
      suggestedCost: 150,
      suggestedPrice: 280,
      category: 'consumable'
    });
  }

  // Fallback generic item if none matched specifically
  if (items.length <= 1) {
    const cost = 250;
    const price = Math.round(cost * (1 + defaultMarkup / 100));
    items.push({
      id: 'li-mat-gen',
      name: `${detectedTrade} Replacement Parts & Hardware Supplies`,
      category: 'material',
      quantity: 1,
      unit: 'lot',
      estimatedWholesaleCost: cost,
      markupPercentage: defaultMarkup,
      unitPrice: price,
      total: price,
      taxable: true,
      supplierNote: 'Direct Trade Hardware'
    });
  }

  const potentialSavings = alerts.reduce((acc, a) => acc + a.suggestedPrice, 0);

  // Clean Summary
  const cleanSummary = text.length > 120 ? text.slice(0, 117) + '...' : text;

  return {
    detectedTrade,
    jobSummary: cleanSummary,
    lineItems: items,
    leakageAlerts: alerts,
    potentialSavingsRecovered: potentialSavings,
    clientNotes: `Work completed according to standard ${detectedTrade} specifications. Parts and labor verified on-site.`
  };
}
