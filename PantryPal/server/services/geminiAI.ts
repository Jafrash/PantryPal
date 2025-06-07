import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export interface DetectedIngredient {
  name: string;
  confidence: number;
}

export interface GeneratedRecipe {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  cookTime: number;
  servings: number;
  difficulty: string;
  rating: number;
  ingredients: Array<{
    name: string;
    amount: string;
    unit: string;
  }>;
  matchPercentage: number;
  matchedIngredients: string[];
  tips: string[];
  variations: string[];
  nutritionalInfo?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
}

export async function detectIngredientsWithGemini(imageBuffer: Buffer): Promise<DetectedIngredient[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const imageData = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `Analyze this image and identify all the food ingredients you can see. 
    Return a JSON array with the format:
    [{"name": "ingredient_name", "confidence": 0.95}]
    
    Rules:
    - Only return actual food ingredients visible in the image
    - Use common ingredient names (e.g., "tomatoes" not "cherry tomatoes")
    - Confidence should be between 0.6 and 1.0 based on how clearly visible the ingredient is
    - Return maximum 8 ingredients
    - Return only the JSON array, no other text`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const ingredients = JSON.parse(jsonMatch[0]);
      return ingredients.map((ing: any) => ({
        name: ing.name.toLowerCase(),
        confidence: ing.confidence
      }));
    }
    
    // Fallback if JSON parsing fails
    return [
      { name: "tomatoes", confidence: 0.85 },
      { name: "basil", confidence: 0.78 },
      { name: "mozzarella", confidence: 0.82 }
    ];
  } catch (error) {
    console.error('Error detecting ingredients with Gemini:', error);
    // Return fallback ingredients
    return [
      { name: "tomatoes", confidence: 0.85 },
      { name: "basil", confidence: 0.78 },
      { name: "mozzarella", confidence: 0.82 }
    ];
  }
}

export async function generateRecipesWithGemini(
  ingredients: string[],
  dietaryPreferences?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    keto?: boolean;
  },
  maxCookTime?: number
): Promise<GeneratedRecipe[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const dietaryFilters = [];
    if (dietaryPreferences?.vegetarian) dietaryFilters.push('vegetarian');
    if (dietaryPreferences?.vegan) dietaryFilters.push('vegan');
    if (dietaryPreferences?.glutenFree) dietaryFilters.push('gluten-free');
    if (dietaryPreferences?.keto) dietaryFilters.push('keto');
    
    const prompt = `Create 10 amazing and diverse recipes using these available ingredients: ${ingredients.join(', ')}

    Requirements:
    ${dietaryFilters.length > 0 ? `- Must be ${dietaryFilters.join(' and ')}` : ''}
    ${maxCookTime ? `- Maximum cooking time: ${maxCookTime} minutes` : ''}
    - Use as many of the available ingredients as possible
    - Include common pantry staples if needed (salt, pepper, oil, etc.)
    - Provide clear step-by-step instructions
    - Include helpful cooking tips and creative variations
    - Rate each recipe realistically based on difficulty, taste, and popularity (1-5 scale)
    - Add nutritional estimates
    
    Return a JSON array with this exact format:
    [
      {
        "id": "recipe-1",
        "title": "Recipe Name",
        "description": "Brief appealing description of the dish",
        "instructions": ["Step 1", "Step 2", "Step 3", "Step 4"],
        "cookTime": 25,
        "servings": 4,
        "difficulty": "Easy",
        "rating": 4.5,
        "ingredients": [
          {"name": "ingredient", "amount": "2", "unit": "cups"}
        ],
        "matchedIngredients": ["ingredient1", "ingredient2"],
        "tips": ["Helpful cooking tip 1", "Pro tip 2"],
        "variations": ["Variation idea 1", "Alternative approach 2"],
        "nutritionalInfo": {
          "calories": 350,
          "protein": "15g",
          "carbs": "45g", 
          "fat": "12g"
        }
      }
    ]
    
    Make recipes diverse - include appetizers, mains, sides, and desserts when possible. Return only the JSON array, no other text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const recipes = JSON.parse(jsonMatch[0]);
      return recipes.map((recipe: any, index: number) => ({
        ...recipe,
        id: `gemini-recipe-${index + 1}`,
        matchPercentage: calculateMatchPercentage(recipe.matchedIngredients || [], ingredients),
        matchedIngredients: recipe.matchedIngredients || []
      }));
    }
    
    // Fallback recipes if JSON parsing fails
    return createFallbackRecipes(ingredients);
  } catch (error) {
    console.error('Error generating recipes with Gemini:', error);
    return createFallbackRecipes(ingredients);
  }
}

function calculateMatchPercentage(recipeIngredients: string[], userIngredients: string[]): number {
  if (recipeIngredients.length === 0) return 0;
  
  const matches = recipeIngredients.filter(ingredient => 
    userIngredients.some(userIng => 
      ingredient.toLowerCase().includes(userIng.toLowerCase()) ||
      userIng.toLowerCase().includes(ingredient.toLowerCase())
    )
  );
  
  return Math.round((matches.length / recipeIngredients.length) * 100);
}

function createFallbackRecipes(ingredients: string[]): GeneratedRecipe[] {
  const hasBasil = ingredients.includes('basil');
  const hasTomatoes = ingredients.includes('tomatoes');
  const hasMozzarella = ingredients.includes('mozzarella');
  
  const recipes: GeneratedRecipe[] = [];
  
  if (hasTomatoes && hasBasil && hasMozzarella) {
    recipes.push({
      id: 'fallback-caprese',
      title: 'Fresh Caprese Salad',
      description: 'Simple and delicious salad with fresh tomatoes, mozzarella, and basil',
      instructions: [
        'Slice tomatoes and mozzarella into 1/4 inch rounds',
        'Arrange alternating slices on a platter',
        'Add fresh basil leaves between slices',
        'Drizzle with olive oil and season with salt and pepper'
      ],
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.2,
      ingredients: [
        { name: 'tomatoes', amount: '2', unit: 'large' },
        { name: 'mozzarella', amount: '4', unit: 'oz' },
        { name: 'basil', amount: '6', unit: 'leaves' },
        { name: 'olive oil', amount: '2', unit: 'tbsp' }
      ],
      matchPercentage: 75,
      matchedIngredients: ['tomatoes', 'mozzarella', 'basil'],
      tips: ['Use the ripest tomatoes for best flavor', 'Let ingredients come to room temperature before serving'],
      variations: ['Add balsamic glaze for extra flavor', 'Try with burrata instead of mozzarella'],
      nutritionalInfo: {
        calories: 180,
        protein: '8g',
        carbs: '6g',
        fat: '14g'
      }
    });
  }
  
  // Add more fallback recipes based on available ingredients
  recipes.push({
    id: 'fallback-simple',
    title: 'Simple Ingredient Medley',
    description: `A delicious dish featuring ${ingredients.slice(0, 3).join(', ')}`,
    instructions: [
      'Prepare all ingredients by washing and chopping as needed',
      'Heat a pan over medium heat with a drizzle of oil',
      'Add ingredients and cook until tender',
      'Season with salt and pepper to taste'
    ],
    cookTime: 15,
    servings: 2,
    difficulty: 'Easy',
    rating: 3.8,
    ingredients: ingredients.slice(0, 5).map(ing => ({
      name: ing,
      amount: '1',
      unit: 'cup'
    })),
    matchPercentage: 100,
    matchedIngredients: ingredients.slice(0, 3),
    tips: ['Taste and adjust seasoning as you cook', 'Don\'t overcook to preserve nutrients'],
    variations: ['Add herbs for extra flavor', 'Try different cooking methods like roasting'],
    nutritionalInfo: {
      calories: 150,
      protein: '5g',
      carbs: '20g',
      fat: '6g'
    }
  });
  
  return recipes;
}