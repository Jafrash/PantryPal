// Simulated AI ingredient detection service
// In a real implementation, this would integrate with a computer vision model

export interface DetectedIngredient {
  name: string;
  confidence: number;
}

const commonIngredients = [
  "tomatoes", "basil", "mozzarella", "olive oil", "garlic", "onion", "pasta",
  "chicken breast", "bell peppers", "mushrooms", "cheese", "eggs", "flour",
  "butter", "spinach", "carrots", "potatoes", "broccoli", "lettuce", "cucumber",
  "avocado", "lemon", "lime", "parsley", "cilantro", "oregano", "thyme",
  "salmon", "beef", "pork", "rice", "bread", "milk", "yogurt", "cream"
];

export async function detectIngredients(imageBuffer: Buffer): Promise<DetectedIngredient[]> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate AI detection by randomly selecting 2-5 common ingredients
  const numIngredients = Math.floor(Math.random() * 4) + 2; // 2-5 ingredients
  const detectedIngredients: DetectedIngredient[] = [];
  
  const shuffled = [...commonIngredients].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, numIngredients);
  
  for (const ingredient of selected) {
    // Generate realistic confidence scores (0.6 - 0.95)
    const confidence = Math.random() * 0.35 + 0.6;
    detectedIngredients.push({
      name: ingredient,
      confidence: Math.round(confidence * 10000) / 10000 // Round to 4 decimal places
    });
  }
  
  // Sort by confidence (highest first)
  return detectedIngredients.sort((a, b) => b.confidence - a.confidence);
}
