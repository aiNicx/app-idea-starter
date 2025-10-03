
import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import bcrypt from "bcryptjs";

// Hash password utility
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Verify password utility
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Helper functions per l'action
export const checkUserExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    return !!user;
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    passwordHash: v.string(),
    name: v.optional(v.string()),
    language: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Sign up - crea nuovo utente
export const signUp = action({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: true; userId: string }> => {
    const { email, password, name, language } = args;
    
    // Verifica se l'utente esiste già
    const existingUser: boolean = await ctx.runQuery(api.auth.checkUserExists, { email });
    
    if (existingUser) {
      throw new Error("User already exists");
    }
    
    // Hash della password
    const passwordHash: string = await hashPassword(password);
    
    // Crea nuovo utente
    const now: number = Date.now();
    const userId: string = await ctx.runMutation(api.auth.createUser, {
      email,
      passwordHash,
      name,
      language: language || "it",
      createdAt: now,
      updatedAt: now,
    });
    return { success: true, userId };
  },
});

// Sign in - verifica credenziali
export const signIn = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: true; user: { id: string; email: string; name?: string; language: string } }> => {
    const { email, password } = args;
    
    // Trova utente per email
    const user: any = await ctx.runQuery(api.auth.getUserByEmail, { email });
    
    if (!user) {
      throw new Error("Invalid credentials");
    }
    
    // Verifica password
    const isValidPassword: boolean = await verifyPassword(password, user.passwordHash);
    
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }
    
    return { 
      success: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        language: user.language,
      }
    };
  },
});

// Get current user (per verificare sessione)
export const getCurrentUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      language: user.language,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, name, language } = args;
    
    const updateData: any = {
      updatedAt: Date.now(),
    };
    
    if (name !== undefined) updateData.name = name;
    if (language !== undefined) updateData.language = language;
    
    await ctx.db.patch(userId, updateData);
    
    return { success: true };
  },
});

// Change password
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { userId, currentPassword, newPassword } = args;
    
    // Get user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new Error("Current password is incorrect");
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);
    
    // Update password
    await ctx.db.patch(userId, {
      passwordHash: newPasswordHash,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});
