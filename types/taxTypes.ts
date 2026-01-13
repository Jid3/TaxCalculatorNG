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
}

export interface TaxBreakdown {
    grossIncome: number;

    // Reliefs and Allowances
    pensionRelief: number;
    nhfRelief: number;
    nhisRelief: number;
    lifeInsuranceRelief: number;
    rentRelief: number; // Replaces CRA in 2026 Tax Act
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

export interface CalculationHistoryItem extends Partial<TaxBreakdown> {
    _id: string;
    createdAt: number;
    incomeType?: IncomeType;
}

export type IncomeType = 'monthly' | 'annual' | 'weekly';
