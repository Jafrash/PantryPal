import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  instructions: jsonb("instructions").notNull(), // Array of instruction steps
  cookTime: integer("cook_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  imageUrl: text("image_url"),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isKeto: boolean("is_keto").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const recipeIngredients = pgTable("recipe_ingredients", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id),
  amount: text("amount").notNull(),
  unit: text("unit"),
  isRequired: boolean("is_required").default(true),
});

export const detectedIngredients = pgTable("detected_ingredients", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  ingredientId: integer("ingredient_id").notNull().references(() => ingredients.id),
  confidence: decimal("confidence", { precision: 5, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  recipeId: integer("recipe_id").notNull().references(() => recipes.id),
  sessionId: text("session_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isHelpful: boolean("is_helpful"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const recipesRelations = relations(recipes, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  feedback: many(userFeedback),
}));

export const ingredientsRelations = relations(ingredients, ({ many }) => ({
  recipeIngredients: many(recipeIngredients),
  detectedIngredients: many(detectedIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  ingredient: one(ingredients, {
    fields: [recipeIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const detectedIngredientsRelations = relations(detectedIngredients, ({ one }) => ({
  ingredient: one(ingredients, {
    fields: [detectedIngredients.ingredientId],
    references: [ingredients.id],
  }),
}));

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  recipe: one(recipes, {
    fields: [userFeedback.recipeId],
    references: [recipes.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
  rating: true,
});

export const insertRecipeIngredientSchema = createInsertSchema(recipeIngredients).omit({
  id: true,
});

export const insertDetectedIngredientSchema = createInsertSchema(detectedIngredients).omit({
  id: true,
  createdAt: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
});

// Ingredient detection request schema
export const detectIngredientsSchema = z.object({
  sessionId: z.string(),
});

// Recipe search request schema
export const searchRecipesSchema = z.object({
  sessionId: z.string(),
  dietaryPreferences: z.object({
    vegetarian: z.boolean().default(false),
    vegan: z.boolean().default(false),
    glutenFree: z.boolean().default(false),
    keto: z.boolean().default(false),
  }).default({}),
  maxCookTime: z.number().optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = z.infer<typeof insertIngredientSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type InsertRecipeIngredient = z.infer<typeof insertRecipeIngredientSchema>;

export type DetectedIngredient = typeof detectedIngredients.$inferSelect;
export type InsertDetectedIngredient = z.infer<typeof insertDetectedIngredientSchema>;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;

export type DetectIngredientsRequest = z.infer<typeof detectIngredientsSchema>;
export type SearchRecipesRequest = z.infer<typeof searchRecipesSchema>;

// Recipe with ingredients type for API responses
export type RecipeWithIngredients = Recipe & {
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[];
  matchPercentage?: number;
  matchedIngredients?: string[];
};
