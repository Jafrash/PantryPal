import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { detectIngredientsSchema, searchRecipesSchema, insertUserFeedbackSchema } from "@shared/schema";
import { detectIngredientsWithGemini, generateRecipesWithGemini } from "./services/geminiAI";
import { v4 as uuidv4 } from "uuid";

// Auth schemas
const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { firstName, lastName, email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );
      
      res.json({
        message: "User created successfully",
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        token,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );
      
      res.json({
        message: "Login successful",
        user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
        token,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  // Google OAuth routes (placeholder for now)
  app.get("/api/auth/google", (req, res) => {
    res.status(501).json({ message: "Google OAuth not implemented yet. Please use email/password login." });
  });

  // Initialize database with seed data
  app.post("/api/seed", async (req, res) => {
    try {
      await storage.seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ message: "Failed to seed database" });
    }
  });

  // Upload image and detect ingredients with Gemini AI
  app.post("/api/detect-ingredients", upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const sessionId = req.body.sessionId || uuidv4();
      
      // Use Gemini AI for real ingredient detection
      const detectedIngredients = await detectIngredientsWithGemini(req.file.buffer);
      
      res.json({
        sessionId,
        ingredients: detectedIngredients.map((ingredient, index) => ({
          id: index + 1,
          name: ingredient.name,
          confidence: ingredient.confidence
        }))
      });
    } catch (error) {
      console.error("Error detecting ingredients:", error);
      res.status(500).json({ message: "Failed to detect ingredients" });
    }
  });

  // Get recipe suggestions using Gemini AI
  app.post("/api/recipes/search", async (req, res) => {
    try {
      const body = searchRecipesSchema.parse(req.body);
      
      // Extract ingredients from session ID (we'll get them from the request)
      const ingredients = req.body.ingredients || ['tomatoes', 'basil', 'mozzarella']; // fallback
      
      // Use Gemini AI to generate personalized recipes
      const recipes = await generateRecipesWithGemini(
        ingredients,
        body.dietaryPreferences,
        body.maxCookTime
      );
      
      res.json({ recipes });
    } catch (error) {
      console.error("Error generating recipes with Gemini:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate recipes" });
    }
  });

  // Get recipe details by ID
  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid recipe ID" });
      }
      
      const recipe = await storage.getRecipeById(id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json({ recipe });
    } catch (error) {
      console.error("Error getting recipe:", error);
      res.status(500).json({ message: "Failed to get recipe" });
    }
  });

  // Submit user feedback for a recipe
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedback = insertUserFeedbackSchema.parse(req.body);
      const savedFeedback = await storage.saveFeedback(feedback);
      res.json({ feedback: savedFeedback });
    } catch (error) {
      console.error("Error saving feedback:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save feedback" });
    }
  });

  // Get all ingredients
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getAllIngredients();
      res.json({ ingredients });
    } catch (error) {
      console.error("Error getting ingredients:", error);
      res.status(500).json({ message: "Failed to get ingredients" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
