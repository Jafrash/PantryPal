import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star, Signal } from "lucide-react";
import { RecipeWithIngredients } from "@shared/schema";

interface RecipeCardProps {
  recipe: RecipeWithIngredients;
  onViewRecipe: () => void;
}

export default function RecipeCard({ recipe, onViewRecipe }: RecipeCardProps) {
  const rating = parseFloat(recipe.rating || "0");
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img 
          src={recipe.imageUrl || `https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400&h=250&fit=crop`}
          alt={recipe.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 shadow-md">
          <span className="text-sm font-semibold text-primary">
            {recipe.matchPercentage || 0}% match
          </span>
        </div>
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          <Clock className="w-3 h-3 inline mr-1" />
          <span>{recipe.cookTime} min</span>
        </div>
      </div>
      
      <CardContent className="p-6">
        <h4 className="text-xl font-bold text-neutral-900 mb-2">{recipe.title}</h4>
        <p className="text-neutral-600 mb-4 line-clamp-2">{recipe.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-neutral-500">
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {recipe.servings} servings
            </span>
            <span className="flex items-center">
              <Signal className="w-3 h-3 mr-1" />
              {recipe.difficulty}
            </span>
          </div>
          <div className="flex items-center text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i}
                className={`w-3 h-3 ${
                  i < fullStars 
                    ? "fill-current" 
                    : i === fullStars && hasHalfStar 
                    ? "fill-current opacity-50" 
                    : "text-neutral-300"
                }`}
              />
            ))}
            <span className="text-neutral-500 text-sm ml-1">({rating.toFixed(1)})</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.matchedIngredients?.slice(0, 3).map((ingredient) => (
            <Badge 
              key={ingredient}
              variant="secondary" 
              className="bg-secondary/10 text-secondary hover:bg-secondary/20"
            >
              {ingredient}
            </Badge>
          ))}
          {(recipe.matchedIngredients?.length || 0) > 3 && (
            <Badge variant="outline" className="border-neutral-300 text-neutral-600">
              +{(recipe.matchedIngredients?.length || 0) - 3} more
            </Badge>
          )}
        </div>
        
        <Button 
          onClick={onViewRecipe}
          className="w-full bg-primary text-white hover:bg-orange-600"
        >
          View Recipe
        </Button>
      </CardContent>
    </Card>
  );
}
