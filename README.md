# A/B Testing MVP

A full-stack A/B testing platform built with Next.js, tRPC, Prisma, and TypeScript. This application allows you to create experiments, manage variants, and assign users to different test groups with weighted distribution.

## 🚀 Features

### 📊 Experiments Management
- **Create Experiments**: Set up new A/B tests with customizable names and statuses
- **Status Tracking**: Manage experiment lifecycle (Draft → Active → Paused → Completed)
- **CRUD Operations**: Full create, read, update, and delete functionality

### 🎯 Variants Management
- **Multiple Variants**: Create multiple test variations for each experiment
- **Weighted Distribution**: Assign custom weights to control traffic distribution
- **Active/Inactive States**: Enable or disable variants without deletion
- **Automatic Linking**: Variants are automatically associated with their parent experiments

### 👥 User Assignment System (_________________ TBD _________________)
- **Deterministic Assignment**: Users get consistent variant assignments based on hashing
- **Weighted Random Selection**: Respects variant weights for fair distribution
- **Assignment Tracking**: View and manage user-to-variant assignments
- **Assignment Dialog**: Easy interface to manually assign users to experiments

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: SQLite with [Prisma ORM](https://www.prisma.io/)
- **API**: [tRPC](https://trpc.io/) for type-safe APIs
- **UI**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query) via tRPC
- **Validation**: [Zod](https://zod.dev/) schemas

## 📁 Project Structure

```
src/
├── app/
│   ├── _components/          # React components
│   │   ├── experiments.tsx   # Experiments list and management
│   │   ├── experimentDialog.tsx # Create/edit experiments
│   │   ├── variants.tsx      # Variants list and management
│   │   ├── variantDialog.tsx # Create/edit variants
│   │   ├── assignments.tsx   # User assignments interface
│   │   └── assignmentDialog.tsx # Manual user assignment
│   ├── layout.tsx           # Root layout
│   └── page.tsx            # Main page with tabs
├── server/
│   ├── api/
│   │   ├── routers/         # tRPC routers
│   │   │   ├── experiment.ts # Experiment CRUD operations
│   │   │   ├── variant.ts   # Variant CRUD operations
│   │   │   └── assignment.ts # Assignment logic
│   │   ├── root.ts         # Main tRPC router
│   │   └── trpc.ts         # tRPC configuration
│   └── db.ts               # Prisma client setup
└── trpc/                   # tRPC client configuration
prisma/
├── schema.prisma           # Database schema
└── migrations/             # Database migrations
```

## 🗄 Database Schema

### Experiment
- `id`: Unique identifier (CUID)
- `name`: Experiment name (unique)
- `status`: Current status (draft, active, paused, completed)
- `createdAt`/`updatedAt`: Timestamps
- 'variants': Variant[]

### Variant
- `id`: Unique identifier (CUID)
- `experimentId`: Foreign key to experiment
- `key`: Variant identifier within experiment
- `weight`: Distribution weight (default: 1)
- `isActive`: Enable/disable flag

### Assignment
- `id`: Unique identifier (CUID)
- `userId`: User identifier
- `experimentId`: Foreign key to experiment
- `variantId`: Foreign key to assigned variant
- `createdAt`: Assignment timestamp

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ab-test-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database URL:
   ```
   DATABASE_URL="file:./db.sqlite"
   ```

4. **Initialize the database**
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating an Experiment
1. Go to the **Experiments** tab
2. Click **"Create new Experiment"**
3. Enter experiment name and select initial status
4. Submit to create the experiment

### Adding Variants
1. Go to the **Variants** tab
2. Click **"Create new Variant"**
3. Enter:
   - Variant key (e.g., "control", "treatment-a")
   - Experiment ID
   - Weight (higher = more traffic)
4. Submit to create the variant

### Assigning Users
1. Go to the **Assignments** tab
2. Click **"Assign User to Experiment"**
3. Enter User ID and Experiment ID
4. The system automatically assigns based on variant weights

### Assignment Algorithm
The system uses deterministic assignment based on:
```typescript
const seed = `${userId}:${experimentId}`;
// Hash the seed and use modulo for consistent assignment
```

This ensures:
- ✅ Same user always gets the same variant
- ✅ Respects variant weights
- ✅ Even distribution across users

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbo
npm run build        # Build for production
npm run start        # Start production server
npm run preview      # Build and start production server

# Database
npm run db:generate  # Generate Prisma client and run migrations
npm run db:migrate   # Deploy migrations to production
npm run db:push      # Push schema changes without migrations
npm run db:studio    # Open Prisma Studio

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors automatically
npm run typecheck    # Run TypeScript compiler check
npm run format:check # Check code formatting
npm run format:write # Format code with Prettier
npm run check        # Run both linting and type checking
```

## 🧪 API Endpoints (tRPC)

### Experiments
- `experiment.list` - Get all experiments
- `experiment.create` - Create new experiment
- `experiment.update` - Update experiment
- `experiment.delete` - Delete experiment

### Variants
- `variant.list` - Get all variants
- `variant.listByExperiment` - Get variants for specific experiment
- `variant.create` - Create new variant
- `variant.upsertMany` - Bulk create/update variants

### Assignments
- `assignment.get` - Get user's assignment for experiment
- `assignment.assign` - Assign user to experiment (auto-selects variant)

## 🎨 UI Components


## 🔒 Environment Variables

Create a `.env` file with:
```env
DATABASE_URL="file:./db.sqlite"
NODE_ENV="development"
```