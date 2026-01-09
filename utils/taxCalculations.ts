/**
 * ============================================================================
 * NIGERIAN TAX CALCULATOR - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * This file contains all tax calculation logic based on the 2026 Nigeria Tax Act.
 * All formulas are heavily commented to allow easy editing when tax laws change.
 * 
 * KEY CHANGES IN 2026 TAX ACT:
 * - Tax-free threshold increased to ₦800,000 annually
 * - New progressive rates: 0%, 15%, 18%, 21%, 23%, 25%
 * - Consolidated Relief Allowance (CRA) replaced with Rent Relief
 * - Rent Relief: Lower of ₦200,000 or 20% of annual rent paid
 * 
 * IMPORTANT: You can easily modify tax brackets and rates below
 * ============================================================================
 */

import { TaxBracket, TaxReliefs, TaxBreakdown } from '../types/taxTypes';

/**
 * ============================================================================
 * TAX BRACKETS - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * These are the official tax brackets for 2026.
 * To update: Simply modify the values below when tax laws change.
 * 
 * Format:
 * - min: Minimum income for this bracket (inclusive)
 * - max: Maximum income for this bracket (exclusive), null = no upper limit
 * - rate: Tax rate as a percentage (e.g., 15 = 15%)
 */
export const TAX_BRACKETS_2026: TaxBracket[] = [
    {
        min: 0,
        max: 800000,
        rate: 0, // First ₦800,000 is tax-free
    },
    {
        min: 800000,
        max: 3000000,
        rate: 15, // Next ₦2,200,000 (₦800k - ₦3M) taxed at 15%
    },
    {
        min: 3000000,
        max: 12000000,
        rate: 18, // Next ₦9,000,000 (₦3M - ₦12M) taxed at 18%
    },
    {
        min: 12000000,
        max: 25000000,
        rate: 21, // Next ₦13,000,000 (₦12M - ₦25M) taxed at 21%
    },
    {
        min: 25000000,
        max: 50000000,
        rate: 23, // Next ₦25,000,000 (₦25M - ₦50M) taxed at 23%
    },
    {
        min: 50000000,
        max: null,
        rate: 25, // Above ₦50,000,000 taxed at 25%
    },
];

/**
 * ============================================================================
 * RENT RELIEF CONSTANTS
 * ============================================================================
 * 
 * Rent Relief replaces the old Consolidated Relief Allowance (CRA).
 * The relief is the LOWER of:
 * 1. ₦200,000, OR
 * 2. 20% of annual rent paid
 * 
 * To update: Modify these constants when the law changes
 */
export const RENT_RELIEF_MAX = 200000; // Maximum rent relief: ₦200,000
export const RENT_RELIEF_PERCENTAGE = 0.20; // 20% of annual rent paid

/**
 * ============================================================================
 * RELIEF LIMITS
 * ============================================================================
 * 
 * These are the maximum allowable reliefs for various deductions.
 * Some reliefs have no limits (set to Infinity).
 * 
 * To update: Modify these values based on current tax regulations
 */
export const RELIEF_LIMITS = {
    pension: Infinity, // No limit on pension relief
    nhf: Infinity, // No limit on NHF relief
    nhis: Infinity, // No limit on NHIS relief
    lifeInsurance: Infinity, // No limit on life insurance relief
};

/**
 * ============================================================================
 * CALCULATE RENT RELIEF
 * ============================================================================
 * 
 * Calculates the Rent Relief based on annual rent paid.
 * Returns the LOWER of ₦200,000 or 20% of annual rent.
 * 
 * @param annualRentPaid - Total rent paid in a year
 * @returns Rent relief amount
 */
export function calculateRentRelief(annualRentPaid: number): number {
    if (!annualRentPaid || annualRentPaid <= 0) {
        return 0;
    }

    // Calculate 20% of annual rent
    const twentyPercentOfRent = annualRentPaid * RENT_RELIEF_PERCENTAGE;

    // Return the lower of ₦200,000 or 20% of rent
    return Math.min(RENT_RELIEF_MAX, twentyPercentOfRent);
}

/**
 * ============================================================================
 * CALCULATE TAX FOR A SPECIFIC INCOME
 * ============================================================================
 * 
 * This is the main tax calculation function.
 * It calculates tax using the progressive bracket system.
 * 
 * HOW IT WORKS:
 * 1. Calculate all reliefs (pension, NHF, NHIS, life insurance, rent)
 * 2. Subtract total reliefs from gross income to get taxable income
 * 3. Apply progressive tax rates to taxable income
 * 4. Return detailed breakdown
 * 
 * @param grossIncome - Total annual income before tax
 * @param reliefs - Object containing all relief amounts
 * @returns Detailed tax breakdown
 */
export function calculateTax(
    grossIncome: number,
    reliefs: TaxReliefs = {}
): TaxBreakdown {
    // ========================================
    // STEP 1: Calculate Individual Reliefs
    // ========================================

    const pensionRelief = Math.min(reliefs.pension || 0, RELIEF_LIMITS.pension);
    const nhfRelief = Math.min(reliefs.nhf || 0, RELIEF_LIMITS.nhf);
    const nhisRelief = Math.min(reliefs.nhis || 0, RELIEF_LIMITS.nhis);
    const lifeInsuranceRelief = Math.min(
        reliefs.lifeInsurance || 0,
        RELIEF_LIMITS.lifeInsurance
    );

    // Calculate Rent Relief (replaces CRA in 2026)
    const rentRelief = calculateRentRelief(reliefs.rentPaid || 0);

    // Total all reliefs
    const totalReliefs =
        pensionRelief + nhfRelief + nhisRelief + lifeInsuranceRelief + rentRelief;

    // ========================================
    // STEP 2: Calculate Taxable Income
    // ========================================

    // Taxable income = Gross income - Total reliefs
    // Cannot be negative
    const taxableIncome = Math.max(0, grossIncome - totalReliefs);

    // ========================================
    // STEP 3: Apply Progressive Tax Brackets
    // ========================================

    let totalTax = 0;
    const taxPerBracket: TaxBreakdown['taxPerBracket'] = [];
    let remainingIncome = taxableIncome;

    // Loop through each tax bracket
    for (const bracket of TAX_BRACKETS_2026) {
        // Skip if no remaining income to tax
        if (remainingIncome <= 0) break;

        // Calculate the amount of income in this bracket
        const bracketMin = bracket.min;
        const bracketMax = bracket.max || Infinity;

        // How much of the income falls in this bracket?
        let incomeInBracket = 0;

        if (taxableIncome > bracketMin) {
            // Income extends into this bracket
            const maxInBracket = Math.min(taxableIncome, bracketMax) - bracketMin;
            incomeInBracket = Math.max(0, maxInBracket);
        }

        // Calculate tax for this bracket
        const taxInBracket = (incomeInBracket * bracket.rate) / 100;
        totalTax += taxInBracket;

        // Record this bracket's contribution (only if there's income in it)
        if (incomeInBracket > 0) {
            const bracketLabel =
                bracket.max === null
                    ? `Above ₦${bracketMin.toLocaleString()}`
                    : `₦${bracketMin.toLocaleString()} - ₦${bracketMax.toLocaleString()}`;

            taxPerBracket.push({
                bracket: bracketLabel,
                taxableAmount: incomeInBracket,
                rate: bracket.rate,
                tax: taxInBracket,
            });
        }
    }

    // ========================================
    // STEP 4: Calculate Net Income
    // ========================================

    const netIncome = grossIncome - totalTax;

    // ========================================
    // STEP 5: Return Complete Breakdown
    // ========================================

    return {
        grossIncome,
        pensionRelief,
        nhfRelief,
        nhisRelief,
        lifeInsuranceRelief,
        rentRelief,
        totalReliefs,
        taxableIncome,
        taxPerBracket,
        totalTax,
        netIncome,
    };
}

/**
 * ============================================================================
 * CONVERT MONTHLY TO ANNUAL INCOME
 * ============================================================================
 * 
 * Simple helper to convert monthly income to annual.
 * 
 * @param monthlyIncome - Monthly income amount
 * @returns Annual income (monthly × 12)
 */
export function monthlyToAnnual(monthlyIncome: number): number {
    return monthlyIncome * 12;
}

/**
 * ============================================================================
 * CONVERT ANNUAL TO MONTHLY INCOME
 * ============================================================================
 * 
 * Simple helper to convert annual income to monthly.
 * 
 * @param annualIncome - Annual income amount
 * @returns Monthly income (annual ÷ 12)
 */
export function annualToMonthly(annualIncome: number): number {
    return annualIncome / 12;
}

/**
 * ============================================================================
 * CALCULATE TAX FROM MONTHLY INCOME
 * ============================================================================
 * 
 * Convenience function to calculate tax when you have monthly figures.
 * Converts monthly to annual, calculates tax, then shows monthly breakdown.
 * 
 * @param monthlyIncome - Monthly gross income
 * @param monthlyReliefs - Monthly relief amounts
 * @returns Tax breakdown with monthly and annual figures
 */
export function calculateTaxFromMonthly(
    monthlyIncome: number,
    monthlyReliefs: TaxReliefs = {}
): TaxBreakdown {
    // Convert monthly to annual
    const annualIncome = monthlyToAnnual(monthlyIncome);

    const annualReliefs: TaxReliefs = {
        pension: monthlyReliefs.pension ? monthlyToAnnual(monthlyReliefs.pension) : 0,
        nhf: monthlyReliefs.nhf ? monthlyToAnnual(monthlyReliefs.nhf) : 0,
        nhis: monthlyReliefs.nhis ? monthlyToAnnual(monthlyReliefs.nhis) : 0,
        lifeInsurance: monthlyReliefs.lifeInsurance
            ? monthlyToAnnual(monthlyReliefs.lifeInsurance)
            : 0,
        rentPaid: monthlyReliefs.rentPaid || 0, // Rent is already annual
    };

    // Calculate annual tax
    return calculateTax(annualIncome, annualReliefs);
}

/**
 * ============================================================================
 * HELPER: FORMAT CURRENCY
 * ============================================================================
 * 
 * Formats a number as Nigerian Naira currency.
 * 
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "₦1,234,567.89")
 */
export function formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

/**
 * ============================================================================
 * HELPER: CALCULATE STANDARD RELIEFS FROM BASIC SALARY
 * ============================================================================
 * 
 * Many employers calculate reliefs as percentages of basic salary.
 * This helper calculates the common ones:
 * - Pension: 8% of basic salary (employee contribution)
 * - NHF: 2.5% of basic salary
 * 
 * @param basicSalary - Monthly basic salary
 * @returns Object with calculated relief amounts
 */
export function calculateStandardReliefs(basicSalary: number): {
    pension: number;
    nhf: number;
} {
    return {
        pension: basicSalary * 0.08, // 8% pension contribution
        nhf: basicSalary * 0.025, // 2.5% NHF contribution
    };
}

/**
 * ============================================================================
 * HELPER: FORMAT NUMBER INPUT
 * ============================================================================
 * 
 * Formats a number string with commas for input display.
 * e.g., "10000" -> "10,000"
 * 
 * @param value - Raw input string
 * @returns Formatted string with commas
 */
export function formatNumber(value: string | number): string {
    if (!value && value !== 0) return '';

    // Remove existing commas to get raw number
    const rawValue = value.toString().replace(/,/g, '');

    if (rawValue === '') return '';
    if (isNaN(Number(rawValue))) return value.toString(); // Return original if NaN

    // Handle decimal point
    const parts = rawValue.split('.');

    // Format integer part
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // If there was a decimal point, rejoin
    if (parts.length > 1) {
        return `${integerPart}.${parts[1]}`;
    }

    return integerPart;
}

/**
 * ============================================================================
 * HELPER: PARSE NUMBER INPUT
 * ============================================================================
 * 
 * Removes commas from formatted string to get raw number for calculation.
 * e.g., "10,000" -> 10000
 * 
 * @param value - Formatted input string
 * @returns Raw number
 */
export function parseNumber(value: string): number {
    if (!value) return 0;
    // Remove commas and convert to float
    return parseFloat(value.toString().replace(/,/g, '')) || 0;
}
