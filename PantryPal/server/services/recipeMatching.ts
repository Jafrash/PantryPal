import { RecipeWithIngredients } from "@shared/schema";

export interface RecipeMatch {
  recipe: RecipeWithIngredients;
  matchPercentage: number;
  matchedIngredients: string[];
  missingIngredients: string[];
}

export function calculateRecipeMatches(
  recipes: RecipeWithIngredients[],
  userIngredientIds: number[]
): RecipeMatch[] {
  const matches: RecipeMatch[] = [];
  
  for (const recipe of recipes) {
    const recipeIngredientIds = recipe.recipeIngredients.map(ri => ri.ingredientId);
    const matchedIds = recipeIngredientIds.filter(id => userIngredientIds.includes(id));
    const missingIds = recipeIngredientIds.filter(id => !userIngredientIds.includes(id));
    
    const matchPercentage = Math.round((matchedIds.length / recipeIngredientIds.length) * 100);
    
    // Only include recipes with at least 25% match
    if (matchPercentage >= 25) {
      const matchedIngredients = recipe.recipeIngredients
        .filter(ri => matchedIds.includes(ri.ingredientId))
        .map(ri => ri.ingredient.name);
        
      const missingIngredients = recipe.recipeIngredients
        .filter(ri => missingIds.includes(ri.ingredientId))
        .map(ri => ri.ingredient.name);
      
      matches.push({
        recipe: {
          ...recipe,
          matchPercentage,
          matchedIngredients,
        },
        matchPercentage,
        matchedIngredients,
        missingIngredients,
      });
    }
  }
  
  // Sort by match percentage (highest first)
  return matches.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

export function scoreRecipe(
  recipe: RecipeWithIngredients,
  userIngredientIds: number[],
  userPreferences: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    keto?: boolean;
  } = {},
  maxCookTime?: number
): number {
  let score = 0;
  
  // Base score from ingredient match
  const recipeIngredientIds = recipe.recipeIngredients.map(ri => ri.ingredientId);
  const matchedCount = recipeIngredientIds.filter(id => userIngredientIds.includes(id)).length;
  const matchPercentage = (matchedCount / recipeIngredientIds.length) * 100;
  score += matchPercentage;
  
  // Bonus for dietary preferences alignment
  if (userPreferences.vegetarian && recipe.isVegetarian) score += 10;
  if (userPreferences.vegan && recipe.isVegan) score += 10;
  if (userPreferences.glutenFree && recipe.isGlutenFree) score += 10;
  if (userPreferences.keto && recipe.isKeto) score += 10;
  
  // Penalty for exceeding cook time preference
  if (maxCookTime && recipe.cookTime > maxCookTime) {
    score -= 20;
  }
  
  // Bonus for easier recipes
  if (recipe.difficulty === "Easy") score += 5;
  
  // Bonus for higher rated recipes
  const rating = parseFloat(recipe.rating || "0");
  score += rating * 2;
  
  return Math.max(0, score);
}
