import { 
  users, 
  ingredients, 
  recipes, 
  recipeIngredients, 
  detectedIngredients, 
  userFeedback,
  type User, 
  type InsertUser,
  type Ingredient,
  type InsertIngredient,
  type Recipe,
  type InsertRecipe,
  type RecipeIngredient,
  type InsertRecipeIngredient,
  type DetectedIngredient,
  type InsertDetectedIngredient,
  type UserFeedback,
  type InsertUserFeedback,
  type RecipeWithIngredients,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Ingredient operations
  getAllIngredients(): Promise<Ingredient[]>;
  getIngredientByName(name: string): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;

  // Recipe operations
  getAllRecipes(): Promise<RecipeWithIngredients[]>;
  getRecipeById(id: number): Promise<RecipeWithIngredients | undefined>;
  getRecipesByIngredients(ingredientIds: number[], dietaryPreferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    keto?: boolean;
  }, maxCookTime?: number): Promise<RecipeWithIngredients[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  addRecipeIngredient(recipeIngredient: InsertRecipeIngredient): Promise<RecipeIngredient>;

  // Detection operations
  saveDetectedIngredients(detections: InsertDetectedIngredient[]): Promise<DetectedIngredient[]>;
  getDetectedIngredientsBySession(sessionId: string): Promise<(DetectedIngredient & { ingredient: Ingredient })[]>;

  // Feedback operations
  saveFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getFeedbackByRecipe(recipeId: number): Promise<UserFeedback[]>;

  // Seed data
  seedDatabase(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllIngredients(): Promise<Ingredient[]> {
    return await db.select().from(ingredients);
  }

  async getIngredientByName(name: string): Promise<Ingredient | undefined> {
    const [ingredient] = await db.select().from(ingredients).where(eq(ingredients.name, name.toLowerCase()));
    return ingredient || undefined;
  }

  async createIngredient(ingredient: InsertIngredient): Promise<Ingredient> {
    const [newIngredient] = await db
      .insert(ingredients)
      .values({ ...ingredient, name: ingredient.name.toLowerCase() })
      .returning();
    return newIngredient;
  }

  async getAllRecipes(): Promise<RecipeWithIngredients[]> {
    const recipesWithIngredients = await db
      .select()
      .from(recipes)
      .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
      .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id));

    const grouped = recipesWithIngredients.reduce((acc, row) => {
      const recipe = row.recipes;
      if (!acc[recipe.id]) {
        acc[recipe.id] = {
          ...recipe,
          recipeIngredients: [],
        };
      }
      if (row.recipe_ingredients && row.ingredients) {
        acc[recipe.id].recipeIngredients.push({
          ...row.recipe_ingredients,
          ingredient: row.ingredients,
        });
      }
      return acc;
    }, {} as Record<number, RecipeWithIngredients>);

    return Object.values(grouped);
  }

  async getRecipeById(id: number): Promise<RecipeWithIngredients | undefined> {
    const recipesWithIngredients = await db
      .select()
      .from(recipes)
      .leftJoin(recipeIngredients, eq(recipes.id, recipeIngredients.recipeId))
      .leftJoin(ingredients, eq(recipeIngredients.ingredientId, ingredients.id))
      .where(eq(recipes.id, id));

    if (recipesWithIngredients.length === 0) return undefined;

    const recipe = recipesWithIngredients[0].recipes;
    const result: RecipeWithIngredients = {
      ...recipe,
      recipeIngredients: recipesWithIngredients
        .filter(row => row.recipe_ingredients && row.ingredients)
        .map(row => ({
          ...row.recipe_ingredients!,
          ingredient: row.ingredients!,
        })),
    };

    return result;
  }

  async getRecipesByIngredients(
    ingredientIds: number[], 
    dietaryPreferences?: {
      vegetarian?: boolean;
      vegan?: boolean;
      glutenFree?: boolean;
      keto?: boolean;
    }, 
    maxCookTime?: number
  ): Promise<RecipeWithIngredients[]> {
    if (ingredientIds.length === 0) {
      return [];
    }

    // Get all recipes with their ingredients first
    const allRecipes = await this.getAllRecipes();
    
    // Filter recipes based on preferences
    let filteredRecipes = allRecipes.filter(recipe => {
      // Apply dietary filters
      if (dietaryPreferences?.vegetarian && !recipe.isVegetarian) return false;
      if (dietaryPreferences?.vegan && !recipe.isVegan) return false;
      if (dietaryPreferences?.glutenFree && !recipe.isGlutenFree) return false;
      if (dietaryPreferences?.keto && !recipe.isKeto) return false;
      
      // Apply cooking time filter
      if (maxCookTime && recipe.cookTime > maxCookTime) return false;
      
      return true;
    });

    // Calculate match percentages
    const recipesWithMatches = filteredRecipes.map(recipe => {
      const recipeIngredientIds = recipe.recipeIngredients.map(ri => ri.ingredientId);
      const matchedIngredientIds = recipeIngredientIds.filter(id => ingredientIds.includes(id));
      const matchedIngredients = recipe.recipeIngredients
        .filter(ri => ingredientIds.includes(ri.ingredientId))
        .map(ri => ri.ingredient.name);
      
      const matchPercentage = recipeIngredientIds.length > 0 
        ? Math.round((matchedIngredientIds.length / recipeIngredientIds.length) * 100)
        : 0;

      return {
        ...recipe,
        matchPercentage,
        matchedIngredients,
      };
    });

    // Filter out recipes with no matches and sort by match percentage
    return recipesWithMatches
      .filter(recipe => recipe.matchPercentage > 0)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db
      .insert(recipes)
      .values(recipe)
      .returning();
    return newRecipe;
  }

  async addRecipeIngredient(recipeIngredient: InsertRecipeIngredient): Promise<RecipeIngredient> {
    const [newRecipeIngredient] = await db
      .insert(recipeIngredients)
      .values(recipeIngredient)
      .returning();
    return newRecipeIngredient;
  }

  async saveDetectedIngredients(detections: InsertDetectedIngredient[]): Promise<DetectedIngredient[]> {
    if (detections.length === 0) return [];
    
    const result = await db
      .insert(detectedIngredients)
      .values(detections)
      .returning();
    return result;
  }

  async getDetectedIngredientsBySession(sessionId: string): Promise<(DetectedIngredient & { ingredient: Ingredient })[]> {
    const result = await db
      .select()
      .from(detectedIngredients)
      .leftJoin(ingredients, eq(detectedIngredients.ingredientId, ingredients.id))
      .where(eq(detectedIngredients.sessionId, sessionId))
      .orderBy(desc(detectedIngredients.confidence));

    return result.map(row => ({
      ...row.detected_ingredients,
      ingredient: row.ingredients!,
    }));
  }

  async saveFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const [newFeedback] = await db
      .insert(userFeedback)
      .values(feedback)
      .returning();
    return newFeedback;
  }

  async getFeedbackByRecipe(recipeId: number): Promise<UserFeedback[]> {
    return await db
      .select()
      .from(userFeedback)
      .where(eq(userFeedback.recipeId, recipeId))
      .orderBy(desc(userFeedback.createdAt));
  }

  async seedDatabase(): Promise<void> {
    // Seed ingredients
    const commonIngredients = [
      { name: "tomatoes", category: "vegetables" },
      { name: "basil", category: "herbs" },
      { name: "mozzarella", category: "dairy" },
      { name: "olive oil", category: "oils" },
      { name: "garlic", category: "vegetables" },
      { name: "onion", category: "vegetables" },
      { name: "pasta", category: "grains" },
      { name: "chicken breast", category: "meat" },
      { name: "bell peppers", category: "vegetables" },
      { name: "mushrooms", category: "vegetables" },
      { name: "cheese", category: "dairy" },
      { name: "eggs", category: "dairy" },
      { name: "flour", category: "grains" },
      { name: "butter", category: "dairy" },
      { name: "spinach", category: "vegetables" },
    ];

    const ingredientResults = await Promise.all(
      commonIngredients.map(async (ing) => {
        const existing = await this.getIngredientByName(ing.name);
        if (!existing) {
          return await this.createIngredient(ing);
        }
        return existing;
      })
    );

    // Create ingredient lookup map
    const ingredientMap = ingredientResults.reduce((acc, ing) => {
      acc[ing.name] = ing.id;
      return acc;
    }, {} as Record<string, number>);

    // Seed recipes
    const sampleRecipes = [
      {
        title: "Classic Margherita Pizza",
        description: "A traditional Italian pizza with fresh tomatoes, mozzarella, and aromatic basil leaves.",
        instructions: [
          "Preheat your oven to 475°F (245°C). If you have a pizza stone, place it in the oven while preheating.",
          "Roll out the pizza dough on a floured surface to your desired thickness. Transfer to a baking sheet or pizza peel.",
          "Slice tomatoes and arrange evenly over the dough. Add torn pieces of fresh mozzarella.",
          "Bake for 12-15 minutes until crust is golden and cheese is bubbly. Top with fresh basil leaves and serve immediately."
        ],
        cookTime: 25,
        servings: 4,
        difficulty: "Easy",
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
        isVegetarian: true,
        ingredients: [
          { name: "tomatoes", amount: "3", unit: "large" },
          { name: "mozzarella", amount: "8", unit: "oz" },
          { name: "basil", amount: "10", unit: "leaves" },
          { name: "flour", amount: "2", unit: "cups" },
          { name: "olive oil", amount: "2", unit: "tbsp" },
        ]
      },
      {
        title: "Fresh Caprese Salad", 
        description: "Light and refreshing salad with ripe tomatoes, creamy mozzarella, and fresh basil drizzled with balsamic.",
        instructions: [
          "Slice tomatoes and mozzarella into 1/4 inch thick rounds.",
          "Arrange alternating slices of tomato and mozzarella on a platter.",
          "Tuck fresh basil leaves between the slices.",
          "Drizzle with olive oil and balsamic vinegar. Season with salt and pepper to taste."
        ],
        cookTime: 10,
        servings: 2, 
        difficulty: "Easy",
        imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df",
        isVegetarian: true,
        ingredients: [
          { name: "tomatoes", amount: "2", unit: "large" },
          { name: "mozzarella", amount: "4", unit: "oz" },
          { name: "basil", amount: "6", unit: "leaves" },
          { name: "olive oil", amount: "2", unit: "tbsp" },
        ]
      },
      {
        title: "Garlic Mushroom Pasta",
        description: "Simple yet delicious pasta with sautéed mushrooms and garlic in a light olive oil sauce.",
        instructions: [
          "Cook pasta according to package directions until al dente.",
          "Heat olive oil in a large pan and sauté sliced mushrooms until golden.",
          "Add minced garlic and cook for 1 minute until fragrant.",
          "Toss cooked pasta with mushroom mixture and season with salt, pepper, and fresh herbs."
        ],
        cookTime: 20,
        servings: 3,
        difficulty: "Easy", 
        imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5",
        isVegetarian: true,
        ingredients: [
          { name: "pasta", amount: "12", unit: "oz" },
          { name: "mushrooms", amount: "8", unit: "oz" },
          { name: "garlic", amount: "4", unit: "cloves" },
          { name: "olive oil", amount: "3", unit: "tbsp" },
          { name: "basil", amount: "2", unit: "tbsp" },
        ]
      }
    ];

    // Insert recipes and their ingredients
    for (const recipeData of sampleRecipes) {
      const { ingredients: recipeIngredientsList, ...recipeInfo } = recipeData;
      
      // Check if recipe already exists
      const existingRecipes = await this.getAllRecipes();
      const recipeExists = existingRecipes.some(r => r.title === recipeInfo.title);
      
      if (!recipeExists) {
        const recipe = await this.createRecipe(recipeInfo);
        
        // Add recipe ingredients
        for (const ingredient of recipeIngredientsList) {
          const ingredientId = ingredientMap[ingredient.name];
          if (ingredientId) {
            await this.addRecipeIngredient({
              recipeId: recipe.id,
              ingredientId,
              amount: ingredient.amount,
              unit: ingredient.unit,
              isRequired: true,
            });
          }
        }
      }
    }
  }
}

export const storage = new DatabaseStorage();
