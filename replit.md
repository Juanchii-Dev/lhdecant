# LH Decants - Perfume E-commerce Platform

## Overview

LH Decants is a modern e-commerce platform specializing in premium perfume decants (small samples). The application provides a luxurious shopping experience for fragrance enthusiasts, featuring a comprehensive catalog of perfumes, curated collections, and an admin panel for inventory management.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool for fast development and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management and caching
- **Tailwind CSS** with custom luxury theme (gold/black color scheme)
- **Shadcn/ui** components for consistent UI design
- **Framer Motion** for smooth animations and interactions

### Backend Architecture
- **Express.js** server with TypeScript
- **PostgreSQL** database with Neon serverless connection
- **Drizzle ORM** for type-safe database operations
- **Passport.js** with local strategy for authentication
- **Express-session** with PostgreSQL session store
- RESTful API design with proper error handling

### Database Schema
The application uses a well-structured PostgreSQL schema with the following main entities:
- **Users**: Admin authentication system
- **Perfumes**: Product catalog with pricing for 5ml and 10ml sizes
- **Collections**: Curated perfume bundles with themes
- **Cart Items**: Session-based shopping cart
- **Contact Messages**: Customer inquiry system
- **Orders**: Future order processing system

## Key Components

### Authentication System
- Session-based authentication using Passport.js
- Secure password hashing with scrypt
- Admin-only access control for management features
- Persistent sessions stored in PostgreSQL

### Shopping Cart
- Session-based cart management (no login required)
- Support for individual perfumes (5ml/10ml) and collections
- Real-time cart updates with optimistic UI
- Cart persistence across browser sessions

### Product Management
- Complete CRUD operations for perfumes
- Image URL support for product photos
- Category-based organization (masculine, feminine, unisex, niche)
- Stock management and pricing flexibility

### User Interface
- Responsive design optimized for all devices
- Luxury aesthetic with gold accents and dark theme
- Smooth animations and hover effects
- Loading states and error handling

## Data Flow

1. **Client requests** are routed through Wouter to appropriate page components
2. **TanStack Query** handles API calls with automatic caching and refetching
3. **Express routes** process requests and interact with database via Drizzle ORM
4. **PostgreSQL** stores all application data with proper relationships
5. **Session management** maintains user state and cart persistence

## External Dependencies

### Database
- **Neon PostgreSQL** - Serverless PostgreSQL database
- **Drizzle ORM** - Type-safe database operations
- **connect-pg-simple** - PostgreSQL session store

### UI/UX Libraries
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Development Tools
- **TypeScript** - Type safety across the stack
- **ESBuild** - Fast JavaScript bundler for server
- **PostCSS** - CSS processing

## Deployment Strategy

The application is configured for Replit deployment with:
- **Development**: `npm run dev` starts both client and server
- **Production Build**: Vite builds client assets, ESBuild bundles server
- **Port Configuration**: Server runs on port 5000, exposed on port 80
- **Environment Variables**: DATABASE_URL for PostgreSQL connection
- **Session Secret**: Configurable for security

## Changelog

Changelog:
- June 15, 2025. Initial setup
- June 15, 2025. Major collections system update: Added variable perfume sizes support, fixed JSON parsing errors, implemented collections visibility toggle, and added admin navigation
- June 16, 2025. Created complete perfume catalog page with advanced filtering and search capabilities
- June 16, 2025. Updated navigation structure: changed "Catálogo Completo" to "Catálogo Perfumes", made single "Ver Catálogo Completo" button below perfumes functional
- June 16, 2025. Updated catalog page aesthetic to match homepage design, enhanced filter visibility with prominent golden styling
- June 16, 2025. Removed rating system completely from all perfume cards and sort options across the application
- June 16, 2025. Implemented advanced admin features: homepage display selection, customizable offers system with dialog configuration, and smart catalog filtering based on stock levels
- June 17, 2025. Added navigation buttons to catalog page: functional cart button with drawer panel and back to home button
- June 17, 2025. Implemented custom pricing per ml for collections: added sizes and prices arrays to collections, size selection buttons like perfumes, and dynamic pricing system in admin panel
- June 18, 2025. Updated homepage and catalog layouts: changed from 3-column to 4-column grid display, removed rating field from perfume creation forms, and optimized container widths for better layout
- June 19, 2025. Enhanced collections management: added delete functionality with confirmation buttons, improved collection display with IDs and detailed information, and fixed configuration toggle for collections visibility on homepage

## User Preferences

Preferred communication style: Simple, everyday language.