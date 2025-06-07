import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Star } from "lucide-react";

export default function Recipes() {
  // Sample featured recipes for the page
  const featuredRecipes = [
    {
      id: 1,
      title: "Mediterranean Quinoa Bowl",
      description: "Fresh and healthy bowl with quinoa, vegetables, and Mediterranean flavors",
      cookTime: 25,
      servings: 4,
      difficulty: "Easy",
      rating: 4.8,
      image: "🥗",
      tags: ["Vegetarian", "Healthy", "Mediterranean"]
    },
    {
      id: 2,
      title: "Spicy Thai Curry",
      description: "Aromatic and flavorful curry with coconut milk and fresh herbs",
      cookTime: 35,
      servings: 4,
      difficulty: "Medium",
      rating: 4.6,
      image: "🍛",
      tags: ["Spicy", "Thai", "Dairy-Free"]
    },
    {
      id: 3,
      title: "Classic Margherita Pizza",
      description: "Traditional Italian pizza with fresh tomatoes, mozzarella, and basil",
      cookTime: 45,
      servings: 4,
      difficulty: "Medium",
      rating: 4.7,
      image: "🍕",
      tags: ["Italian", "Vegetarian", "Classic"]
    },
    {
      id: 4,
      title: "Chocolate Chip Cookies",
      description: "Soft and chewy cookies with perfectly melted chocolate chips",
      cookTime: 30,
      servings: 24,
      difficulty: "Easy",
      rating: 4.9,
      image: "🍪",
      tags: ["Dessert", "Sweet", "Classic"]
    },
    {
      id: 5,
      title: "Grilled Salmon Salad",
      description: "Protein-rich salad with grilled salmon and fresh greens",
      cookTime: 20,
      servings: 2,
      difficulty: "Easy",
      rating: 4.5,
      image: "🐟",
      tags: ["Healthy", "Protein", "Low-Carb"]
    },
    {
      id: 6,
      title: "Vegetable Stir Fry",
      description: "Quick and colorful stir fry with seasonal vegetables",
      cookTime: 15,
      servings: 3,
      difficulty: "Easy",
      rating: 4.4,
      image: "🥬",
      tags: ["Vegan", "Quick", "Healthy"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold text-neutral-900">PantryChef</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-neutral-600 hover:text-primary font-medium">Home</Link>
              <Link href="/how-it-works" className="text-neutral-600 hover:text-primary font-medium">How it Works</Link>
              <Link href="/recipes" className="text-primary font-medium">Recipes</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            Featured Recipes
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Discover amazing recipes created by our AI chef and community
          </p>
          <Button size="lg" asChild>
            <Link href="/">Create Your Own Recipe</Link>
          </Button>
        </div>
      </section>

      {/* Recipes Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <Card key={recipe.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="text-4xl text-center mb-4">{recipe.image}</div>
                  <CardTitle className="text-xl">{recipe.title}</CardTitle>
                  <CardDescription className="text-base">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Recipe Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm text-neutral-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.cookTime}m</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{recipe.servings}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{recipe.rating}</span>
                    </div>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="mb-4">
                    <Badge variant={recipe.difficulty === 'Easy' ? 'default' : recipe.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {recipe.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    View Recipe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Want Personalized Recipes?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Upload a photo of your ingredients and get custom recipe recommendations just for you!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Upload Ingredients</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/how-it-works">Learn How It Works</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}