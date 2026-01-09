import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Register a new user
 * Note: In production, you should use proper password hashing (bcrypt, argon2, etc.)
 * For this demo, we're using a simple approach
 */
export const register = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // In production, use proper password hashing!
        // For demo purposes, we're storing a simple hash
        // const passwordHash = Buffer.from(args.password).toString("base64");
        // Using a simple prefix to avoid Buffer issues in some environments
        const passwordHash = "hashed_" + args.password;

        // Create new user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            passwordHash,
            name: args.name,
            biometricEnabled: false,
            createdAt: Date.now(),
        });

        return { userId, email: args.email, name: args.name };
    },
});

/**
 * Login user
 */
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Verify password (in production, use proper password verification)
        const passwordHash = "hashed_" + args.password;
        if (user.passwordHash !== passwordHash) {
            throw new Error("Invalid email or password");
        }

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            biometricEnabled: user.biometricEnabled,
        };
    },
});

/**
 * Get user by ID
 */
export const getUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) return null;

        let imageUrl = null;
        if (user.profileImageId) {
            imageUrl = await ctx.storage.getUrl(user.profileImageId);
        }

        return {
            userId: user._id,
            email: user.email,
            name: user.name,
            biometricEnabled: user.biometricEnabled,
            imageUrl: imageUrl,
            profileImageId: user.profileImageId,
        };
    },
});

/**
 * Enable/disable biometric authentication for user
 */
/**
 * Enable/disable biometric authentication for user
 */
export const updateBiometricSetting = mutation({
    args: {
        userId: v.id("users"),
        enabled: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            biometricEnabled: args.enabled,
        });
        return { success: true };
    },
});

/**
 * Generate upload URL for profile image
 */
export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

/**
 * Update user profile (name, email, profile image)
 */
export const updateProfile = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        profileImageId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const updates: any = {};
        if (args.name !== undefined) updates.name = args.name;
        if (args.email !== undefined) {
            // Check if email is already taken by another user
            const existingUser = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", args.email!))
                .first();

            if (existingUser && existingUser._id !== args.userId) {
                throw new Error("Email already in use");
            }
            updates.email = args.email;
        }
        if (args.profileImageId !== undefined) updates.profileImageId = args.profileImageId;

        await ctx.db.patch(args.userId, updates);
        return { success: true };
    },
});

/**
 * Change password
 */
export const changePassword = mutation({
    args: {
        userId: v.id("users"),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const passwordHash = "hashed_" + args.newPassword;
        await ctx.db.patch(args.userId, { passwordHash });
        return { success: true };
    },
});
