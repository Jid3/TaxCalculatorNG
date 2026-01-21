/**
 * Type definitions for Nigerian Tax Calculator
 * Based on 2026 Nigeria Tax Act
 */

export interface TaxBracket {
    min: number;
    max: number | null; // null means no upper limit
    rate: number; // percentage (e.g., 15 for 15%)
}

export interface TaxReliefs {
    pension?: number; // Pension contribution (typically 8% of basic salary)
    nhf?: number; // National Housing Fund (typically 2.5% of basic salary)
    nhis?: number; // National Health Insurance Scheme
    lifeInsurance?: number; // Life insurance premium
    rentPaid?: number; // Annual rent paid (for Rent Relief calculation)
    customDeductions?: CustomDeduction[]; // User-defined deductions
}

export interface TaxBreakdown {
    grossIncome: number;

    // Reliefs and Allowances
    pensionRelief: number;
    nhfRelief: number;
    nhisRelief: number;
    lifeInsuranceRelief: number;
    rentRelief: number; // Replaces CRA in 2026 Tax Act
    customDeductionsTotal: number;
    customDeductions: CustomDeduction[];
    totalReliefs: number;

    // Taxable Income
    taxableIncome: number;

    // Tax per bracket
    taxPerBracket: {
        bracket: string;
        taxableAmount: number;
        rate: number;
        tax: number;
    }[];

    // Total Tax
    totalTax: number;

    // Net Income
    netIncome: number;
}

export type IncomeType = 'monthly' | 'annual' | 'weekly';

/**
 * Tax mode - Personal or Business
 */
export type TaxMode = 'personal' | 'business';

/**
 * Company size classification for business tax
 */
export type CompanySize = 'small' | 'medium' | 'large';

/**
 * Business type for tax exemptions
 */
export type BusinessType = 'general' | 'startup' | 'agricultural';

/**
 * Custom deduction item
 */
export interface CustomDeduction {
    id: string;
    name: string;
    amount: number;
    isTaxable: boolean; // If true, this is added to taxable income; if false, it's a deduction
}

/**
 * Business tax reliefs and deductions
 */
export interface BusinessTaxReliefs {
    pension?: number;
    nhf?: number;
    nhis?: number;
    rentPaid?: number; // Annual rent paid (for rent relief)
    employmentRelief?: number; // 50% deduction for new hires
    compensationRelief?: number; // 50% deduction for salary increases
    customDeductions?: CustomDeduction[]; // User-defined deductions
}

/**
 * Business tax breakdown
 */
export interface BusinessTaxBreakdown {
    grossIncome: number;

    // Company classification
    companySize: CompanySize;
    businessType: BusinessType;

    // Reliefs and Deductions
    pensionRelief: number;
    nhfRelief: number;
    nhisRelief: number;
    rentRelief: number;
    employmentRelief: number;
    compensationRelief: number;
    customDeductionsTotal: number;
    customDeductions: CustomDeduction[];
    totalReliefs: number;

    // Taxable Income
    taxableIncome: number;

    // Tax Calculations
    companyIncomeTax: number; // CIT at 30% or 0% for small companies
    developmentLevy: number; // 4% levy or 0% for small companies
    minimumEffectiveTax: number; // 15% for very large companies
    totalTax: number;

    // Exemptions Applied
    isSmallCompanyExempt: boolean;
    isStartupExempt: boolean;
    isAgriculturalExempt: boolean;

    // Net Income
    netIncome: number;
    effectiveTaxRate: number; // Percentage
}

/**
 * Extended calculation history to support both personal and business
 */
export interface CalculationHistoryItem extends Partial<TaxBreakdown> {
    _id: string;
    createdAt: number;
    incomeType?: IncomeType;
    taxMode?: TaxMode; // 'personal' or 'business'

    // Business-specific fields (only present when taxMode === 'business')
    companySize?: CompanySize;
    businessType?: BusinessType;
    companyIncomeTax?: number;
    developmentLevy?: number;
    effectiveTaxRate?: number;
    employmentRelief?: number;
    compensationRelief?: number;
}
