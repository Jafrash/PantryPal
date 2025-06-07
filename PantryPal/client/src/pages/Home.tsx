import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Camera, Play, Star, ChefHat } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";
import DietaryPreferences from "@/components/DietaryPreferences";
import ProcessingScreen from "@/components/ProcessingScreen";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

interface DietaryPrefs {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  keto: boolean;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessionId] = useState(() => uuidv4());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPrefs>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    keto: false,
  });
  const [maxCookTime, setMaxCookTime] = useState<number | undefined>();

  // Initialize database on component mount
  useEffect(() => {
    const initDatabase = async () => {
      try {
        await apiRequest("POST", "/api/seed");
      } catch (error) {
        console.log("Database already seeded or error occurred");
      }
    };
    initDatabase();
  }, []);

  const detectIngredientsMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('sessionId', sessionId);
      
      const response = await apiRequest("POST", "/api/detect-ingredients", formData);
      return response.json();
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      // Store detected ingredients in localStorage for the results page
      localStorage.setItem('detectedIngredients', JSON.stringify(data.ingredients.map((ing: any) => ing.name)));
      // Navigate to results page with session ID
      setLocation(`/results/${data.sessionId}`);
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      console.error("Error detecting ingredients:", error);
    },
  });

  const handleImageUpload = (file: File) => {
    setIsProcessing(true);
    // Store preferences in localStorage for the results page
    localStorage.setItem('dietaryPreferences', JSON.stringify(dietaryPreferences));
    localStorage.setItem('maxCookTime', maxCookTime?.toString() || '');
    detectIngredientsMutation.mutate(file);
  };

  if (isProcessing) {
    return <ProcessingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Utensils className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-neutral-900">PantryChef</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">How it Works</a>
              <a href="#" className="text-neutral-600 hover:text-primary transition-colors">Recipes</a>
              <Button className="bg-primary text-white hover:bg-orange-600">
                Get Started
              </Button>
            </nav>
            <Button variant="ghost" size="icon" className="md:hidden">
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-6 h-0.5 bg-neutral-600"></div>
                <div className="w-6 h-0.5 bg-neutral-600"></div>
                <div className="w-6 h-0.5 bg-neutral-600"></div>
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-6 leading-tight">
                Turn Your Ingredients Into{" "}
                <span className="text-primary">Delicious Recipes</span>
              </h2>
              <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
                Simply snap a photo of your ingredients and let our AI suggest the perfect recipes. 
                No more wondering what to cook with what you have!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-primary text-white hover:bg-orange-600 transform hover:scale-105 shadow-lg"
                  onClick={() => document.getElementById('upload-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Cooking
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-neutral-200 hover:border-primary hover:text-primary"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <Card className="mx-auto max-w-sm shadow-2xl">
                <CardContent className="p-6">
                  <div className="bg-neutral-100 rounded-xl h-64 flex items-center justify-center mb-4 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1506368249639-73a05d6f6488?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                      alt="Fresh vegetables and cooking ingredients" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-primary/10 rounded-lg"></div>
                    <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
                      <span className="text-sm font-medium text-neutral-700">📸 Tap to capture</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Detected Ingredients</span>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">3 found</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">Tomatoes</span>
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">Basil</span>
                      <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm">Mozzarella</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Image Upload Section */}
      <section className="py-16 bg-white" id="upload-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">Upload Your Ingredients</h3>
            <p className="text-lg text-neutral-600">Take a photo or upload an image of your available ingredients</p>
          </div>

          <ImageUpload onImageUpload={handleImageUpload} />

          <DietaryPreferences
            preferences={dietaryPreferences}
            onPreferencesChange={setDietaryPreferences}
            maxCookTime={maxCookTime}
            onMaxCookTimeChange={setMaxCookTime}
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <Utensils className="text-white text-lg" />
                </div>
                <h3 className="text-xl font-bold">PantryChef</h3>
              </div>
              <p className="text-neutral-400 mb-6 max-w-md">Transform your ingredients into delicious recipes with the power of AI. Never wonder what to cook again.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  <Star className="w-6 h-6" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  <Star className="w-6 h-6" />
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  <Star className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Download App</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-500">
            <p>&copy; 2024 PantryChef. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
