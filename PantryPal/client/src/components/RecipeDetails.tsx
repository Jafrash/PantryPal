import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { X, Clock, Users, Star } from "lucide-react";
import { RecipeWithIngredients } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface RecipeDetailsProps {
  recipe: RecipeWithIngredients;
  sessionId: string;
  onClose: () => void;
}

export default function RecipeDetails({ recipe, sessionId, onClose }: RecipeDetailsProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const feedbackMutation = useMutation({
    mutationFn: async (feedback: { rating: number; comment?: string }) => {
      const response = await apiRequest("POST", "/api/feedback", {
        recipeId: recipe.id,
        sessionId,
        rating: feedback.rating,
        comment: feedback.comment,
        isHelpful: feedback.rating >= 4,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Thank you!",
        description: "Your feedback has been submitted successfully.",
      });
      setRating(0);
      setComment("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({
      rating,
      comment: comment.trim() || undefined,
    });
  };

  const instructions = Array.isArray(recipe.instructions) 
    ? recipe.instructions 
    : JSON.parse(recipe.instructions as string || "[]");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white border-b border-neutral-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-neutral-900">
            {recipe.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid lg:grid-cols-2 gap-8 p-6">
          <div>
            <img 
              src={recipe.imageUrl || `https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600&h=400&fit=crop`}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-xl mb-6"
            />
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{recipe.cookTime}</div>
                <div className="text-sm text-neutral-600">Minutes</div>
              </div>
              <div className="text-center p-4 bg-neutral-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{recipe.servings}</div>
                <div className="text-sm text-neutral-600">Servings</div>
              </div>
            </div>

            {/* User Feedback Section */}
            <div className="bg-neutral-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-neutral-900 mb-4">Rate this recipe</h4>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "text-yellow-400 fill-current"
                          : "text-neutral-300"
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600">
                  {rating > 0 ? `${rating} out of 5 stars` : "Click to rate"}
                </span>
              </div>
              <Textarea 
                placeholder="Share your experience with this recipe..."
                className="resize-none h-20 mb-3"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <Button 
                onClick={handleSubmitFeedback}
                disabled={feedbackMutation.isPending}
                className="bg-primary text-white hover:bg-orange-600"
              >
                {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
          
          <div>
            {/* Ingredients Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-neutral-900 mb-4">Ingredients</h4>
              <div className="space-y-3">
                {(recipe.ingredients || recipe.recipeIngredients || []).map((ingredient: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <span className="text-neutral-700">
                        {ingredient.name || ingredient.ingredient?.name || ingredient}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-500">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions Section */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-neutral-900 mb-4">Instructions</h4>
              <div className="space-y-4">
                {instructions.map((step: string, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <p className="text-neutral-700 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            {(recipe as any).tips && (recipe as any).tips.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-neutral-900 mb-4">💡 Cooking Tips</h4>
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  {(recipe as any).tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <p className="text-blue-800 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variations Section */}
            {(recipe as any).variations && (recipe as any).variations.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-semibold text-neutral-900 mb-4">🎨 Variations</h4>
                <div className="bg-green-50 rounded-xl p-4 space-y-2">
                  {(recipe as any).variations.map((variation: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <p className="text-green-800 text-sm">{variation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Info */}
            {(recipe as any).nutritionalInfo && (
              <div>
                <h4 className="text-xl font-semibold text-neutral-900 mb-4">📊 Nutrition Facts</h4>
                <div className="bg-neutral-50 rounded-xl p-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{(recipe as any).nutritionalInfo.calories}</div>
                    <div className="text-sm text-neutral-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-700">{(recipe as any).nutritionalInfo.protein}</div>
                    <div className="text-sm text-neutral-600">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-700">{(recipe as any).nutritionalInfo.carbs}</div>
                    <div className="text-sm text-neutral-600">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-neutral-700">{(recipe as any).nutritionalInfo.fat}</div>
                    <div className="text-sm text-neutral-600">Fat</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
