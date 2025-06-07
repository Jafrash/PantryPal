import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Utensils } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetails from "@/components/RecipeDetails";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { RecipeWithIngredients } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DietaryPrefs {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  keto: boolean;
}

export default function Results() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithIngredients | null>(null);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPrefs>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    keto: false,
  });
  const [maxCookTime, setMaxCookTime] = useState<number | undefined>();
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);

  // Load preferences and detected ingredients from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('dietaryPreferences');
    const savedCookTime = localStorage.getItem('maxCookTime');
    const savedIngredients = localStorage.getItem('detectedIngredients');
    
    if (savedPrefs) {
      setDietaryPreferences(JSON.parse(savedPrefs));
    }
    if (savedCookTime && savedCookTime !== '') {
      setMaxCookTime(parseInt(savedCookTime));
    }
    if (savedIngredients) {
      setDetectedIngredients(JSON.parse(savedIngredients));
    }
  }, []);

  // Search for recipes based on detected ingredients
  const searchRecipesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/recipes/search", {
        sessionId,
        dietaryPreferences,
        maxCookTime,
        ingredients: detectedIngredients,
      });
      return response.json();
    },
  });

  const { data: detectedData, isLoading: isLoadingDetected } = useQuery({
    queryKey: ['/api/ingredients'],
    enabled: false, // We'll trigger the search manually
  });

  // Trigger recipe search when component mounts and ingredients are loaded
  useEffect(() => {
    if (sessionId && detectedIngredients.length > 0) {
      searchRecipesMutation.mutate();
    }
  }, [sessionId, detectedIngredients]);

  const recipes = searchRecipesMutation.data?.recipes || [];
  const isLoading = searchRecipesMutation.isPending;
  const error = searchRecipesMutation.error;

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-xl font-bold text-red-600 mb-4">Error Loading Recipes</h1>
            <p className="text-neutral-600 mb-4">
              There was an error loading recipe suggestions. Please try again.
            </p>
            <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-orange-600">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setLocation("/")}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Utensils className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">PantryChef</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Recipe Results */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">Recipe Suggestions</h3>
            <p className="text-lg text-neutral-600">
              Based on your ingredients:{" "}
              <span className="font-medium text-primary">
                {detectedIngredients.length > 0 ? detectedIngredients.join(", ") : "Loading..."}
              </span>
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recipes.length === 0 ? (
            <div className="text-center py-12">
              <h4 className="text-xl font-semibold text-neutral-900 mb-4">No Recipes Found</h4>
              <p className="text-neutral-600 mb-8">
                We couldn't find any recipes matching your ingredients and preferences. 
                Try uploading a different image or adjusting your dietary preferences.
              </p>
              <Button onClick={() => setLocation("/")} className="bg-primary hover:bg-orange-600">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Recipe Cards Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recipes.map((recipe: RecipeWithIngredients) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onViewRecipe={() => setSelectedRecipe(recipe)}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {recipes.length >= 6 && (
                <div className="text-center mt-12">
                  <Button 
                    variant="outline"
                    className="border border-neutral-300 hover:border-primary hover:text-primary"
                  >
                    Load More Recipes
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Recipe Details Modal */}
      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          sessionId={sessionId!}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
