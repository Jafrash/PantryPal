# Recipe Finder AI Application

## Overview

This is a full-stack React application that uses AI to detect ingredients from uploaded images and suggests recipes based on those ingredients. The app features a modern UI built with React and Tailwind CSS, a Node.js/Express backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured error handling
- **File Upload**: Multer middleware for image processing
- **Session Management**: Express sessions with PostgreSQL store

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Migration**: Drizzle Kit for database migrations
- **Connection**: Neon serverless driver with WebSocket support

## Key Components

### Core Features
1. **Image Upload & Processing**
   - Drag-and-drop image upload interface
   - File validation (type and size limits)
   - Image preview functionality

2. **AI Ingredient Detection**
   - Simulated computer vision service (YOLO-based simulation)
   - Confidence scoring for detected ingredients
   - Database storage of detection results

3. **Recipe Matching System**
   - Intelligent recipe matching based on detected ingredients
   - Match percentage calculation
   - Dietary preference filtering
   - Cook time constraints

4. **Recipe Management**
   - Comprehensive recipe database with ingredients
   - Detailed recipe cards with ratings and metadata
   - Interactive recipe details modal

5. **User Feedback System**
   - Star-based rating system
   - Comment functionality
   - Feedback analytics

### Database Schema
- **Users**: Basic user management
- **Ingredients**: Categorized ingredient catalog
- **Recipes**: Full recipe data with metadata (cook time, difficulty, dietary flags)
- **Recipe Ingredients**: Many-to-many relationship with amounts and units
- **Detected Ingredients**: Session-based detection results
- **User Feedback**: Recipe ratings and comments

### UI/UX Components
- Responsive design with mobile-first approach
- Orange and green color scheme for food-focused branding
- Loading states and error handling
- Toast notifications for user feedback
- Processing screen with animated steps

## Data Flow

1. **Image Upload Flow**
   - User uploads image via drag-and-drop or file picker
   - Frontend validates file type and size
   - Image sent to backend with session ID
   - Backend processes image through AI detection service
   - Results stored in database with confidence scores

2. **Recipe Search Flow**
   - Backend retrieves detected ingredients by session
   - Applies dietary preference and time filters
   - Calculates match percentages for available recipes
   - Returns sorted results with match metadata

3. **Recipe Interaction Flow**
   - User views recipe details in modal
   - Can submit ratings and feedback
   - Feedback stored with session tracking
   - Real-time UI updates via optimistic updates

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React, Wouter for routing
- **UI Components**: Radix UI primitives, shadcn/ui component library
- **Styling**: Tailwind CSS, class-variance-authority for component variants
- **Data Fetching**: TanStack Query for server state
- **Forms**: React Hook Form with Hookform resolvers
- **Utilities**: clsx, date-fns, lucide-react icons

### Backend Dependencies
- **Server**: Express.js with TypeScript
- **Database**: Drizzle ORM, Neon serverless PostgreSQL
- **File Handling**: Multer for uploads
- **Session**: express-session with connect-pg-simple
- **Validation**: Zod schemas
- **Utilities**: UUID generation, WebSocket support

### Development Tools
- **Build**: Vite with React plugin, esbuild for server
- **TypeScript**: Strict mode with path mapping
- **Linting**: ESLint configuration
- **Database**: Drizzle Kit for migrations and introspection

## Deployment Strategy

### Development Environment
- **Local Development**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend auto-restart
- **Database**: Automatic seeding on first run

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code as ESM
- **Database**: Migration-based schema management
- **Deployment**: Configured for Replit autoscale deployment

### Environment Configuration
- **Database**: Uses DATABASE_URL environment variable
- **Session**: Secure session configuration for production
- **File Storage**: Memory-based for development, configurable for production
- **CORS**: Configured for cross-origin development setup

The application uses a modern, type-safe stack with excellent developer experience and production-ready architecture patterns. The modular design allows for easy feature additions and maintenance.