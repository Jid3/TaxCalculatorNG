import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Database Schema for Nigerian Tax Calculator
 */
export default defineSchema({
    // Users table - stores user account information
    users: defineTable({
        email: v.string(),
        passwordHash: v.string(),
        name: v.string(),
        biometricEnabled: v.boolean(),
        profileImageId: v.optional(v.string()), // Storage ID for profile image
        createdAt: v.number(),
    }).index("by_email", ["email"]),

    // Tax calculation history - stores past calculations for each user
    calculations: defineTable({
        userId: v.id("users"),
        grossIncome: v.number(),
        incomeType: v.string(), // "monthly" or "annual"

        // Reliefs
        pensionRelief: v.number(),
        nhfRelief: v.number(),
        nhisRelief: v.number(),
        lifeInsuranceRelief: v.number(),
        rentRelief: v.number(),

        // Results
        taxableIncome: v.number(),
        totalTax: v.number(),
        netIncome: v.number(),

        createdAt: v.number(),
    }).index("by_user", ["userId"]),
});
