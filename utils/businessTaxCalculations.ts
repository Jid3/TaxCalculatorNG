/**
 * ============================================================================
 * NIGERIAN BUSINESS TAX CALCULATOR - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * This file contains all business tax calculation logic based on the 2026 Nigeria Tax Act.
 * All formulas are heavily commented to allow easy editing when tax laws change.
 * 
 * KEY BUSINESS TAX PROVISIONS IN 2026 TAX ACT:
 * - Small companies (turnover ≤ ₦50M, fixed assets ≤ ₦250M): 0% CIT (fully exempt)
 * - Medium/Large companies: 30% Company Income Tax (CIT)
 * - Development Levy: 4% on assessable profits (small companies exempt)
 * - Minimum Effective Tax Rate: 15% for very large companies (₦50B+ turnover)
 * - Startup exemption: Eligible startups are exempt from CIT
 * - Agricultural tax holiday: 5 years for crop/livestock/dairy businesses
 * - Rent Relief: 20% of annual rent, capped at ₦500,000 for business owners
 * 
 * IMPORTANT: You can easily modify tax rates and thresholds below
 * ============================================================================
 */

import {
    BusinessTaxReliefs,
    BusinessTaxBreakdown,
    CompanySize,
    BusinessType,
    CustomDeduction,
} from '../types/taxTypes';

/**
 * ============================================================================
 * COMPANY SIZE THRESHOLDS - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * These thresholds determine company classification and tax exemptions.
 * 
 * SMALL COMPANY CRITERIA (both must be met):
 * - Annual turnover ≤ ₦50,000,000
 * - Total fixed assets ≤ ₦250,000,000
 * 
 * Benefits: 0% CIT, 0% Development Levy, exempt from WHT
 * 
 * To update: Modify these values when tax laws change
 */
export const SMALL_COMPANY_TURNOVER_THRESHOLD = 50000000; // ₦50 million
export const SMALL_COMPANY_ASSETS_THRESHOLD = 250000000; // ₦250 million

/**
 * ============================================================================
 * BUSINESS TAX RATES - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * Company Income Tax (CIT) Rates:
 * - Small companies: 0% (fully exempt)
 * - Medium/Large companies: 30%
 * - Planned reduction to 25% for larger firms (not yet implemented)
 * 
 * Development Levy:
 * - Rate: 4% of assessable profits
 * - Replaces: Tertiary Education Tax, NITDA Levy, NASENI Levy, Police Trust Fund
 * - Small companies: Exempt (0%)
 * 
 * Minimum Effective Tax Rate:
 * - Rate: 15% for extremely large companies
 * - Applies to: Companies with ₦50B+ annual turnover or MNE groups with £750M+ turnover
 * 
 * To update: Modify these rates when tax laws change
 */
export const COMPANY_INCOME_TAX_RATE = 0.30; // 30% CIT for medium/large companies
export const DEVELOPMENT_LEVY_RATE = 0.04; // 4% Development Levy
export const MINIMUM_EFFECTIVE_TAX_RATE = 0.15; // 15% minimum ETR for very large companies
export const VERY_LARGE_COMPANY_THRESHOLD = 50000000000; // ₦50 billion turnover

/**
 * ============================================================================
 * RENT RELIEF FOR BUSINESS OWNERS - 2026 NIGERIA TAX ACT
 * ============================================================================
 * 
 * Business owners (self-employed) can claim rent relief:
 * - 20% of annual rent paid
 * - Capped at ₦500,000 (higher than personal income tax cap of ₦200,000)
 * 
 * To update: Modify these constants when the law changes
 */
export const BUSINESS_RENT_RELIEF_MAX = 500000; // Maximum rent relief: ₦500,000
export const BUSINESS_RENT_RELIEF_PERCENTAGE = 0.20; // 20% of annual rent paid

/**
 * ============================================================================
 * EMPLOYMENT & COMPENSATION RELIEF RATES
 * ============================================================================
 * 
 * Employment Relief:
 * - 50% deduction for salaries of new employees hired and retained for 3+ years
 * 
 * Compensation Relief:
 * - 50% additional deduction for salary increases, wage awards, or transport subsidies
 *   for low-income workers
 * 
 * To update: Modify these rates when tax laws change
 */
export const EMPLOYMENT_RELIEF_RATE = 0.50; // 50% deduction
export const COMPENSATION_RELIEF_RATE = 0.50; // 50% deduction

/**
 * ============================================================================
 * AGRICULTURAL TAX HOLIDAY PERIOD
 * ============================================================================
 * 
 * Agricultural businesses (crop production, livestock, dairy) enjoy:
 * - 5-year tax holiday from commencement
 * - 0% CIT during this period
 * 
 * To update: Modify this value when tax laws change
 */
export const AGRICULTURAL_TAX_HOLIDAY_YEARS = 5;

/**
 * ============================================================================
 * CHECK IF COMPANY QUALIFIES AS SMALL COMPANY
 * ============================================================================
 * 
 * A company is classified as "small" if BOTH conditions are met:
 * 1. Annual turnover ≤ ₦50,000,000
 * 2. Total fixed assets ≤ ₦250,000,000
 * 
 * Small companies are exempt from:
 * - Company Income Tax (CIT)
 * - Development Levy
 * - Capital Gains Tax
 * - Withholding Tax
 * 
 * Note: Professional service providers (lawyers, accountants, consultants) are
 * explicitly excluded from small company exemption regardless of revenue.
 * 
 * @param annualTurnover - Annual business turnover/revenue
 * @param totalFixedAssets - Total value of fixed assets (optional, defaults to 0)
 * @returns true if company qualifies as small company
 */
export function isSmallCompany(
    annualTurnover: number,
    totalFixedAssets: number = 0
): boolean {
    // Both conditions must be met
    return (
        annualTurnover <= SMALL_COMPANY_TURNOVER_THRESHOLD &&
        totalFixedAssets <= SMALL_COMPANY_ASSETS_THRESHOLD
    );
}

/**
 * ============================================================================
 * CHECK IF COMPANY IS VERY LARGE (FOR MINIMUM ETR)
 * ============================================================================
 * 
 * Very large companies must pay a minimum effective tax rate of 15%.
 * 
 * Criteria:
 * - Annual turnover ≥ ₦50,000,000,000 (₦50 billion), OR
 * - Part of Multinational Entity group with £750M+ turnover
 * 
 * For simplicity, we only check the Nigerian turnover threshold here.
 * 
 * @param annualTurnover - Annual business turnover/revenue
 * @returns true if company is very large
 */
export function isVeryLargeCompany(annualTurnover: number): boolean {
    return annualTurnover >= VERY_LARGE_COMPANY_THRESHOLD;
}

/**
 * ============================================================================
 * CALCULATE RENT RELIEF FOR BUSINESS
 * ============================================================================
 * 
 * Calculates rent relief for business owners based on annual rent paid.
 * Returns the LOWER of ₦500,000 or 20% of annual rent.
 * 
 * @param annualRentPaid - Total rent paid in a year
 * @returns Rent relief amount
 */
export function calculateBusinessRentRelief(annualRentPaid: number): number {
    if (!annualRentPaid || annualRentPaid <= 0) {
        return 0;
    }

    // Calculate 20% of annual rent
    const twentyPercentOfRent = annualRentPaid * BUSINESS_RENT_RELIEF_PERCENTAGE;

    // Return the lower of ₦500,000 or 20% of rent
    return Math.min(BUSINESS_RENT_RELIEF_MAX, twentyPercentOfRent);
}

/**
 * ============================================================================
 * CALCULATE BUSINESS TAX
 * ============================================================================
 * 
 * Main function to calculate business tax based on 2026 Nigeria Tax Act.
 * 
 * HOW IT WORKS:
 * 1. Determine company size and exemption status
 * 2. Calculate all reliefs and deductions (including custom deductions)
 * 3. Calculate taxable income
 * 4. Apply Company Income Tax (30% or 0% if exempt)
 * 5. Apply Development Levy (4% or 0% if exempt)
 * 6. Apply Minimum Effective Tax Rate if applicable (15%)
 * 7. Return detailed breakdown
 * 
 * @param grossIncome - Annual business income/turnover
 * @param companySize - Company size classification
 * @param businessType - Type of business (for exemptions)
 * @param reliefs - Object containing all relief and deduction amounts
 * @param totalFixedAssets - Total fixed assets (for small company determination)
 * @returns Detailed business tax breakdown
 */
export function calculateBusinessTax(
    grossIncome: number,
    companySize: CompanySize,
    businessType: BusinessType,
    reliefs: BusinessTaxReliefs = {},
    totalFixedAssets: number = 0
): BusinessTaxBreakdown {
    // ========================================
    // STEP 1: Determine Exemption Status
    // ========================================

    // Check if company qualifies as small company
    const isSmallCompanyExempt = companySize === 'small' && isSmallCompany(grossIncome, totalFixedAssets);

    // Check if startup is exempt (eligible startups are exempt from CIT)
    const isStartupExempt = businessType === 'startup';

    // Check if agricultural business is in tax holiday period (5 years)
    // Note: In a real app, you'd track the business start date and calculate years
    // For now, we assume agricultural businesses in the calculator are in their holiday period
    const isAgriculturalExempt = businessType === 'agricultural';

    // ========================================
    // STEP 2: Calculate Individual Reliefs
    // ========================================

    const pensionRelief = reliefs.pension || 0;
    const nhfRelief = reliefs.nhf || 0;
    const nhisRelief = reliefs.nhis || 0;

    // Calculate Rent Relief for business owners
    const rentRelief = calculateBusinessRentRelief(reliefs.rentPaid || 0);

    // Employment Relief: 50% deduction for new hires retained 3+ years
    const employmentRelief = (reliefs.employmentRelief || 0) * EMPLOYMENT_RELIEF_RATE;

    // Compensation Relief: 50% deduction for salary increases/transport subsidies
    const compensationRelief = (reliefs.compensationRelief || 0) * COMPENSATION_RELIEF_RATE;

    // ========================================
    // STEP 3: Process Custom Deductions
    // ========================================

    let customDeductionsTotal = 0;
    let customTaxableAdditions = 0;
    const customDeductions = reliefs.customDeductions || [];

    // Process each custom deduction
    customDeductions.forEach((deduction) => {
        if (deduction.isTaxable) {
            // If marked as taxable, it's added to taxable income (not a deduction)
            customTaxableAdditions += deduction.amount;
        } else {
            // If not taxable, it's a deduction from taxable income
            customDeductionsTotal += deduction.amount;
        }
    });

    // Total all deductions (excluding taxable items)
    const totalReliefs =
        pensionRelief +
        nhfRelief +
        nhisRelief +
        rentRelief +
        employmentRelief +
        compensationRelief +
        customDeductionsTotal;

    // ========================================
    // STEP 4: Calculate Taxable Income
    // ========================================

    // Taxable income = Gross income - Total reliefs + Custom taxable additions
    // Cannot be negative
    const taxableIncome = Math.max(0, grossIncome - totalReliefs + customTaxableAdditions);

    // ========================================
    // STEP 5: Calculate Company Income Tax (CIT)
    // ========================================

    let companyIncomeTax = 0;

    // Small companies, startups, and agricultural businesses (in holiday) are exempt
    if (isSmallCompanyExempt || isStartupExempt || isAgriculturalExempt) {
        companyIncomeTax = 0; // 0% CIT for exempt companies
    } else {
        // Medium/Large companies pay 30% CIT on taxable income
        companyIncomeTax = taxableIncome * COMPANY_INCOME_TAX_RATE;
    }

    // ========================================
    // STEP 6: Calculate Development Levy
    // ========================================

    let developmentLevy = 0;

    // Small companies are exempt from Development Levy
    if (isSmallCompanyExempt) {
        developmentLevy = 0;
    } else {
        // 4% Development Levy on assessable profits (taxable income)
        developmentLevy = taxableIncome * DEVELOPMENT_LEVY_RATE;
    }

    // ========================================
    // STEP 7: Calculate Total Tax
    // ========================================

    let totalTax = companyIncomeTax + developmentLevy;

    // ========================================
    // STEP 8: Apply Minimum Effective Tax Rate (if applicable)
    // ========================================

    let minimumEffectiveTax = 0;

    // Very large companies must pay at least 15% of taxable income
    if (isVeryLargeCompany(grossIncome)) {
        minimumEffectiveTax = taxableIncome * MINIMUM_EFFECTIVE_TAX_RATE;

        // If calculated tax is less than minimum, use minimum
        if (totalTax < minimumEffectiveTax) {
            totalTax = minimumEffectiveTax;
        }
    }

    // ========================================
    // STEP 9: Calculate Net Income
    // ========================================

    const netIncome = grossIncome - totalTax;

    // ========================================
    // STEP 10: Calculate Effective Tax Rate
    // ========================================

    // Effective tax rate = (Total tax / Gross income) × 100
    const effectiveTaxRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0;

    // ========================================
    // STEP 11: Return Complete Breakdown
    // ========================================

    return {
        grossIncome,
        companySize,
        businessType,
        pensionRelief,
        nhfRelief,
        nhisRelief,
        rentRelief,
        employmentRelief,
        compensationRelief,
        customDeductionsTotal,
        customDeductions,
        totalReliefs,
        taxableIncome,
        companyIncomeTax,
        developmentLevy,
        minimumEffectiveTax,
        totalTax,
        isSmallCompanyExempt,
        isStartupExempt,
        isAgriculturalExempt,
        netIncome,
        effectiveTaxRate,
    };
}

/**
 * ============================================================================
 * HELPER: CALCULATE STANDARD BUSINESS CONTRIBUTIONS
 * ============================================================================
 * 
 * Many businesses calculate contributions as percentages of employee salaries.
 * This helper calculates the common ones:
 * - Pension: 8% of total employee salaries (employer contribution)
 * - NHF: 2.5% of total employee salaries
 * 
 * @param totalEmployeeSalaries - Total annual employee salaries
 * @returns Object with calculated contribution amounts
 */
export function calculateStandardBusinessContributions(totalEmployeeSalaries: number): {
    pension: number;
    nhf: number;
} {
    return {
        pension: totalEmployeeSalaries * 0.08, // 8% pension contribution
        nhf: totalEmployeeSalaries * 0.025, // 2.5% NHF contribution
    };
}

/**
 * ============================================================================
 * CALCULATE BUSINESS TAX FROM MONTHLY INCOME
 * ============================================================================
 * 
 * Convenience function to calculate business tax when you have monthly income.
 * Converts monthly income to annual and calculates tax accordingly.
 * 
 * @param monthlyIncome - Monthly business income/turnover
 * @param companySize - Company size classification
 * @param businessType - Type of business (for exemptions)
 * @param reliefs - Object containing all relief and deduction amounts
 * @param totalFixedAssets - Total fixed assets (for small company determination)
 * @returns Detailed business tax breakdown with annual figures
 */
export function calculateBusinessTaxFromMonthly(
    monthlyIncome: number,
    companySize: CompanySize,
    businessType: BusinessType,
    reliefs: BusinessTaxReliefs = {},
    totalFixedAssets: number = 0
): BusinessTaxBreakdown {
    // Convert monthly income to annual (multiply by 12)
    const annualIncome = monthlyIncome * 12;

    // Calculate tax using annual income
    return calculateBusinessTax(annualIncome, companySize, businessType, reliefs, totalFixedAssets);
}

/**
 * ============================================================================
 * CALCULATE BUSINESS TAX FROM WEEKLY INCOME
 * ============================================================================
 * 
 * Convenience function to calculate business tax when you have weekly income.
 * Converts weekly income to annual and calculates tax accordingly.
 * 
 * @param weeklyIncome - Weekly business income/turnover
 * @param companySize - Company size classification
 * @param businessType - Type of business (for exemptions)
 * @param reliefs - Object containing all relief and deduction amounts
 * @param totalFixedAssets - Total fixed assets (for small company determination)
 * @returns Detailed business tax breakdown with annual figures
 */
export function calculateBusinessTaxFromWeekly(
    weeklyIncome: number,
    companySize: CompanySize,
    businessType: BusinessType,
    reliefs: BusinessTaxReliefs = {},
    totalFixedAssets: number = 0
): BusinessTaxBreakdown {
    // Convert weekly income to annual (multiply by 52)
    const annualIncome = weeklyIncome * 52;

    // Calculate tax using annual income
    return calculateBusinessTax(annualIncome, companySize, businessType, reliefs, totalFixedAssets);
}
