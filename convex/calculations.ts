import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Save a tax calculation to history
 */
export const saveCalculation = mutation({
    args: {
        userId: v.id("users"),
        grossIncome: v.number(),
        incomeType: v.string(),
        pensionRelief: v.number(),
        nhfRelief: v.number(),
        nhisRelief: v.number(),
        lifeInsuranceRelief: v.number(),
        rentRelief: v.number(),
        taxableIncome: v.number(),
        totalTax: v.number(),
        netIncome: v.number(),
    },
    handler: async (ctx, args) => {
        const calculationId = await ctx.db.insert("calculations", {
            userId: args.userId,
            grossIncome: args.grossIncome,
            incomeType: args.incomeType,
            pensionRelief: args.pensionRelief,
            nhfRelief: args.nhfRelief,
            nhisRelief: args.nhisRelief,
            lifeInsuranceRelief: args.lifeInsuranceRelief,
            rentRelief: args.rentRelief,
            taxableIncome: args.taxableIncome,
            totalTax: args.totalTax,
            netIncome: args.netIncome,
            createdAt: Date.now(),
        });

        return calculationId;
    },
});

/**
 * Update an existing tax calculation
 */
export const updateCalculation = mutation({
    args: {
        calculationId: v.id("calculations"),
        grossIncome: v.number(),
        incomeType: v.string(),
        pensionRelief: v.number(),
        nhfRelief: v.number(),
        nhisRelief: v.number(),
        lifeInsuranceRelief: v.number(),
        rentRelief: v.number(),
        taxableIncome: v.number(),
        totalTax: v.number(),
        netIncome: v.number(),
    },
    handler: async (ctx, args) => {
        const { calculationId, ...updates } = args;
        await ctx.db.patch(calculationId, updates);
        return { success: true };
    },
});

/**
 * Get calculation history for a user
 */
export const getCalculationHistory = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 50; // Increased limit for now

        const calculations = await ctx.db
            .query("calculations")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);

        return calculations;
    },
});

/**
 * Delete a calculation from history
 */
export const deleteCalculation = mutation({
    args: {
        calculationId: v.id("calculations"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.calculationId);
        return { success: true };
    },
});
