import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Eye, ChefHat, Star } from "lucide-react";

export default function HowItWorks() {
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
              <Link href="/how-it-works" className="text-primary font-medium">How it Works</Link>
              <Link href="/recipes" className="text-neutral-600 hover:text-primary font-medium">Recipes</Link>
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
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6">
            How PantryChef Works
          </h1>
          <p className="text-xl text-neutral-600 mb-8">
            Transform your ingredients into amazing meals with AI-powered recipe suggestions
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">1. Upload Photo</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Take a photo of your ingredients or upload from your gallery. Our AI works with any image!
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">2. AI Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Our advanced AI identifies ingredients from your photo with high accuracy and confidence scores.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">3. Get Recipes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Receive 10 personalized recipes based on your ingredients, dietary preferences, and time constraints.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Step 4 */}
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">4. Cook & Enjoy</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  Follow detailed instructions, tips, and variations to create delicious meals with confidence!
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PantryChef?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">AI</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Detection</h3>
              <p className="text-neutral-600">
                Uses Google's Gemini AI for accurate ingredient recognition from any photo
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">10</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Recipes</h3>
              <p className="text-neutral-600">
                Get 10 diverse recipe suggestions with ratings, tips, and nutritional information
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">🥗</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Dietary Preferences</h3>
              <p className="text-neutral-600">
                Filter recipes by vegetarian, vegan, gluten-free, keto, and cooking time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-neutral-600 mb-8">
            Start discovering amazing recipes from your ingredients today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/">Try It Now</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/recipes">Browse Recipes</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}