/**
 * Deterministic Indian income-tax engine — FY 2025-26 (AY 2026-27),
 * New Tax Regime (Budget 2025). All arithmetic happens here, never via the LLM,
 * so the numbers are always correct and reproducible.
 */

export interface TaxInput {
  salary: number;
  tds: number;
  otherIncome: number; // taxed at slab (incl. debt MF / interest)
  equitySTCG: number; // sec 111A — 20%
  equityLTCG: number; // sec 112A — 12.5% above ₹1.25L
}

export interface SlabRow {
  range: string;
  rate: number; // %
  taxable: number; // amount falling in this slab
  tax: number;
}

export interface TaxResult {
  standardDeduction: number;
  salaryTaxable: number;
  normalIncome: number; // slab-taxed income
  slabs: SlabRow[];
  slabTax: number;
  rebate87A: number;
  marginalRelief: number;
  normalTaxAfterRebate: number;
  equitySTCGTax: number;
  ltcgExemptionUsed: number;
  equityLTCGTax: number;
  capitalGainsTax: number;
  taxBeforeCess: number;
  cess: number;
  totalLiability: number;
  tds: number;
  netPayable: number; // positive = pay, negative = refund
  isRefund: boolean;
}

const STD_DEDUCTION = 75000;
const REBATE_LIMIT = 1200000; // 87A: nil tax up to ₹12L normal income
const LTCG_EXEMPTION = 125000;

// FY 2025-26 new-regime slabs
const SLABS: { upTo: number; rate: number }[] = [
  { upTo: 400000, rate: 0 },
  { upTo: 800000, rate: 5 },
  { upTo: 1200000, rate: 10 },
  { upTo: 1600000, rate: 15 },
  { upTo: 2000000, rate: 20 },
  { upTo: 2400000, rate: 25 },
  { upTo: Infinity, rate: 30 },
];

function round(n: number) {
  return Math.round(n);
}

export function computeTax(input: TaxInput): TaxResult {
  const salary = Math.max(0, input.salary || 0);
  const otherIncome = Math.max(0, input.otherIncome || 0);
  const equitySTCG = Math.max(0, input.equitySTCG || 0);
  const equityLTCG = Math.max(0, input.equityLTCG || 0);
  const tds = Math.max(0, input.tds || 0);

  const standardDeduction = salary > 0 ? Math.min(STD_DEDUCTION, salary) : 0;
  const salaryTaxable = Math.max(0, salary - standardDeduction);
  const normalIncome = salaryTaxable + otherIncome;

  // slab tax + per-slab breakdown
  const slabs: SlabRow[] = [];
  let lower = 0;
  let slabTax = 0;
  for (const s of SLABS) {
    const upper = Math.min(normalIncome, s.upTo);
    const taxable = Math.max(0, upper - lower);
    const tax = (taxable * s.rate) / 100;
    if (s.rate > 0) {
      slabs.push({
        range: s.upTo === Infinity ? `Above ₹${(lower / 100000).toFixed(0)}L` : `₹${(lower / 100000).toFixed(0)}L – ₹${(s.upTo / 100000).toFixed(0)}L`,
        rate: s.rate,
        taxable: round(taxable),
        tax: round(tax),
      });
    }
    slabTax += tax;
    lower = s.upTo;
    if (normalIncome <= s.upTo) break;
  }

  // Section 87A rebate + marginal relief
  let normalTaxAfterRebate = slabTax;
  let rebate87A = 0;
  let marginalRelief = 0;
  if (normalIncome <= REBATE_LIMIT) {
    rebate87A = slabTax;
    normalTaxAfterRebate = 0;
  } else {
    const excessOverLimit = normalIncome - REBATE_LIMIT;
    if (slabTax > excessOverLimit) {
      marginalRelief = slabTax - excessOverLimit;
      normalTaxAfterRebate = excessOverLimit;
    }
  }

  // capital gains (special rates; 87A does NOT apply here)
  const equitySTCGTax = equitySTCG * 0.2;
  const ltcgExemptionUsed = Math.min(LTCG_EXEMPTION, equityLTCG);
  const equityLTCGTax = Math.max(0, equityLTCG - LTCG_EXEMPTION) * 0.125;
  const capitalGainsTax = equitySTCGTax + equityLTCGTax;

  const taxBeforeCess = normalTaxAfterRebate + capitalGainsTax;
  const cess = taxBeforeCess * 0.04;
  const totalLiability = taxBeforeCess + cess;
  const netPayable = totalLiability - tds;

  return {
    standardDeduction: round(standardDeduction),
    salaryTaxable: round(salaryTaxable),
    normalIncome: round(normalIncome),
    slabs,
    slabTax: round(slabTax),
    rebate87A: round(rebate87A),
    marginalRelief: round(marginalRelief),
    normalTaxAfterRebate: round(normalTaxAfterRebate),
    equitySTCGTax: round(equitySTCGTax),
    ltcgExemptionUsed: round(ltcgExemptionUsed),
    equityLTCGTax: round(equityLTCGTax),
    capitalGainsTax: round(capitalGainsTax),
    taxBeforeCess: round(taxBeforeCess),
    cess: round(cess),
    totalLiability: round(totalLiability),
    tds: round(tds),
    netPayable: round(netPayable),
    isRefund: netPayable < 0,
  };
}

export const inr = (n: number) =>
  "₹" + Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* --------------------------- Old regime + compare --------------------------- */
// Old regime slabs (FY 2025-26) — unchanged for years.
const OLD_SLABS: { upTo: number; rate: number }[] = [
  { upTo: 250000, rate: 0 },
  { upTo: 500000, rate: 5 },
  { upTo: 1000000, rate: 20 },
  { upTo: Infinity, rate: 30 },
];
const OLD_STD_DEDUCTION = 50000;

function slabTaxOf(income: number, slabs: { upTo: number; rate: number }[]) {
  let lower = 0;
  let tax = 0;
  for (const s of slabs) {
    const upper = Math.min(income, s.upTo);
    tax += (Math.max(0, upper - lower) * s.rate) / 100;
    lower = s.upTo;
    if (income <= s.upTo) break;
  }
  return tax;
}

export interface OldRegimeResult {
  standardDeduction: number;
  deductions: number;
  taxable: number;
  slabTax: number;
  rebate87A: number;
  capitalGainsTax: number;
  cess: number;
  totalLiability: number;
}

export function computeOldTax(input: TaxInput, deductions: number): OldRegimeResult {
  const salary = Math.max(0, input.salary || 0);
  const otherIncome = Math.max(0, input.otherIncome || 0);
  const ded = Math.max(0, deductions || 0);
  const equitySTCG = Math.max(0, input.equitySTCG || 0);
  const equityLTCG = Math.max(0, input.equityLTCG || 0);

  const standardDeduction = salary > 0 ? Math.min(OLD_STD_DEDUCTION, salary) : 0;
  const taxable = Math.max(0, salary - standardDeduction + otherIncome - ded);
  const slabTax = slabTaxOf(taxable, OLD_SLABS);
  const rebate87A = taxable <= 500000 ? Math.min(slabTax, 12500) : 0;
  const normalTax = slabTax - rebate87A;
  const capitalGainsTax = equitySTCG * 0.2 + Math.max(0, equityLTCG - 125000) * 0.125;
  const beforeCess = normalTax + capitalGainsTax;
  const cess = beforeCess * 0.04;
  const r = Math.round;
  return {
    standardDeduction: r(standardDeduction),
    deductions: r(ded),
    taxable: r(taxable),
    slabTax: r(slabTax),
    rebate87A: r(rebate87A),
    capitalGainsTax: r(capitalGainsTax),
    cess: r(cess),
    totalLiability: r(beforeCess + cess),
  };
}

export interface Comparison {
  newTotal: number;
  oldTotal: number;
  better: "new" | "old" | "same";
  saving: number;
}
export function compareRegimes(input: TaxInput, deductions: number): Comparison {
  const newTotal = computeTax(input).totalLiability;
  const oldTotal = computeOldTax(input, deductions).totalLiability;
  return {
    newTotal,
    oldTotal,
    better: newTotal < oldTotal ? "new" : oldTotal < newTotal ? "old" : "same",
    saving: Math.abs(newTotal - oldTotal),
  };
}
