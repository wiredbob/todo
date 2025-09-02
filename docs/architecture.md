# Intelligent To-Do App Fullstack Architecture Document

## Introduction

This document outlines the complete fullstack architecture for the **Intelligent To-Do App**, a revolutionary task management system that transforms complex tasks into achievable actions through AI-powered breakdown. The architecture supports both immediate MVP delivery via rule-based intelligence and future evolution to full AI integration.

This unified approach addresses the core product vision: eliminating "cognitive overwhelm" by converting complex task lists into manageable action sequences. The architecture must support 40% user retention goals while maintaining sub-2-second response times and zero operational AI costs during MVP phase.

### Starter Template or Existing Project

N/A - Greenfield project

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-01 | 1.0 | Initial architecture document | Clifton (Architect) |

## High Level Architecture

### Technical Summary

The Intelligent To-Do App employs a **serverless-first architecture** deployed entirely on no-commitment free tiers, optimizing for zero upfront costs while maintaining the sub-2-second response requirements. The **React + TypeScript frontend** on Vercel provides the signature single-input interface, while **Vercel Functions** power the backend API with rule-based task breakdown intelligence. **Supabase** serves as the managed PostgreSQL database with built-in authentication, eliminating the need for separate auth infrastructure. This architecture supports the hybrid intelligence strategy through service abstractions that can seamlessly evolve from rule-based templates to AI integration without platform migration, directly addressing the "fulfillment over productivity" user experience through intelligent task parsing and hierarchical breakdown capabilities.

### Platform and Infrastructure Choice

**Platform:** Vercel + Supabase  
**Key Services:** Vercel Functions, Supabase PostgreSQL, Supabase Auth, Vercel CDN  
**Deployment Host and Regions:** Global edge deployment (Vercel CDN), US-East database (Supabase)

### Repository Structure

**Structure:** Monorepo with serverless-optimized organization  
**Monorepo Tool:** Native npm workspaces (simpler than Nx/Turborepo for this scale)  
**Package Organization:** Frontend app, shared types, API functions, and configuration packages

### High Level Architecture Diagram

```mermaid
graph TB
    User[User Browser] --> Vercel[Vercel Frontend]
    Vercel --> Functions[Vercel API Functions]
    Functions --> Supabase[(Supabase PostgreSQL)]
    Functions --> Auth[Supabase Auth]
    
    subgraph "Vercel Platform"
        Vercel
        Functions
        CDN[Global CDN]
    end
    
    subgraph "Supabase Platform"  
        Supabase
        Auth
        Realtime[Real-time Subscriptions]
    end
    
    Functions --> Intelligence[Rule-Based Task Intelligence]
    Intelligence --> Templates[(Template Library)]
    
    User --> CDN
    Vercel -.-> Realtime
```

### Architectural Patterns

- **Serverless Architecture:** Function-based API endpoints with automatic scaling - _Rationale:_ Zero infrastructure management and perfect cost scaling for MVP validation phase
- **Component-Based UI:** React functional components with TypeScript - _Rationale:_ Matches PRD requirements and provides excellent developer experience for the single-input interface
- **Database-per-Service Pattern:** Supabase as single data source with service-specific schemas - _Rationale:_ Simplified for MVP while allowing future service separation
- **API Gateway Pattern:** Vercel Functions as unified API entry point - _Rationale:_ Built-in routing, authentication, and monitoring without additional infrastructure
- **Template-Based Intelligence:** Rule engine with pattern matching templates - _Rationale:_ Delivers the core AI-like experience without API costs, preparing for future AI integration
- **Event-Driven Updates:** Supabase real-time for live task updates - _Rationale:_ Enhanced user experience for collaborative features and immediate feedback on task breakdowns

### Migration Strategy to AWS Production Architecture

#### Migration Trigger Points:
- **User Scale**: Approaching 10K+ DAU (Supabase/Vercel limits)
- **Revenue Milestone**: $10K+ MRR justifies infrastructure investment
- **Feature Complexity**: Need for real-time AI processing, advanced analytics, or enterprise features
- **Performance Requirements**: Sub-200ms response times globally
- **Compliance Needs**: SOC2, HIPAA, or enterprise security requirements

#### AWS Production Architecture Diagram

```mermaid
graph TB
    Users[Users] --> Route53[Route53 DNS]
    Route53 --> CloudFront[CloudFront CDN]
    CloudFront --> S3Web[S3 Static Website]
    
    Users --> ALB[Application Load Balancer]
    ALB --> ECS1[ECS Task 1<br/>NestJS API]
    ALB --> ECS2[ECS Task 2<br/>NestJS API]
    
    ECS1 --> RDSProxy[RDS Proxy]
    ECS2 --> RDSProxy
    RDSProxy --> RDS[(RDS PostgreSQL<br/>Multi-AZ)]
    
    ECS1 --> ElastiCache[ElastiCache Redis<br/>Cluster Mode]
    ECS2 --> ElastiCache
    
    ECS1 --> Cognito[Amazon Cognito<br/>User Pools]
    ECS2 --> Cognito
    
    subgraph "AWS Production Architecture"
        subgraph "Frontend Layer"
            CloudFront
            S3Web
        end
        
        subgraph "API Layer"
            ALB
            ECS1
            ECS2
        end
        
        subgraph "Data Layer"
            RDS
            RDSProxy
            ElastiCache
        end
        
        subgraph "Auth & Security"
            Cognito
            WAF[AWS WAF]
        end
        
        subgraph "AI/ML Services"
            Bedrock[Amazon Bedrock<br/>AI Task Breakdown]
            SageMaker[SageMaker<br/>Custom Models]
        end
        
        subgraph "Monitoring"
            CloudWatch[CloudWatch<br/>Metrics & Logs]
            XRay[X-Ray<br/>Distributed Tracing]
        end
    end
    
    CloudFront --> WAF
    ECS1 -.-> Bedrock
    ECS2 -.-> SageMaker
    
    ECS1 --> CloudWatch
    ECS2 --> XRay
```

#### Migration Timeline and Costs

**Timeline**: 6-8 weeks with 1-2 engineers
**Estimated Monthly AWS Costs** (10K DAU):

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| RDS PostgreSQL | db.r6g.large Multi-AZ | $400 |
| ECS Fargate | 2 vCPU, 4GB RAM x2 tasks | $120 |
| Application Load Balancer | Standard | $25 |
| CloudFront + S3 | 1TB transfer, 100GB storage | $50 |
| ElastiCache | cache.r6g.large | $200 |
| Cognito | 10K MAU | $55 |
| CloudWatch + X-Ray | Standard monitoring | $100 |
| **Total** | | **~$950/month** |

## Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.0+ | Type-safe frontend development | Matches PRD requirements, shared types with backend |
| Frontend Framework | React | 18+ | Component-based UI framework | PRD specified, excellent ecosystem, hooks for state management |
| UI Component Library | Headless UI + Tailwind CSS | Latest | Accessible components + utility CSS | Rapid development, accessibility compliance, matches PRD design goals |
| State Management | TanStack Query + Zustand | Latest | Server state + client state | Efficient API state management, simple client state |
| Backend Language | TypeScript | 5.0+ | Type-safe backend development | Shared types, reduced integration bugs |
| Backend Framework | Vercel Functions | Latest | Serverless API endpoints | Zero infrastructure management, automatic scaling |
| API Style | REST | - | HTTP-based API endpoints | Simple, well-understood, easy testing |
| Database | Supabase PostgreSQL | 14+ | Managed relational database | No credit card required, built-in auth, real-time |
| Cache | Supabase Edge Functions | - | Edge caching and processing | Built-in optimization, global distribution |
| File Storage | Supabase Storage | - | User file attachments | Integrated with auth, CDN included |
| Authentication | Supabase Auth | - | User management and JWT | No separate service needed, social logins |
| Frontend Testing | Vitest + React Testing Library | Latest | Unit and component testing | Fast, modern testing stack |
| Backend Testing | Vitest | Latest | Function testing | Consistent with frontend, TypeScript support |
| E2E Testing | Playwright | Latest | End-to-end testing | Reliable, cross-browser, great TypeScript support |
| Build Tool | Vite | 5+ | Fast development builds | PRD specified, excellent TypeScript support |
| Bundler | Vite | 5+ | Production bundling | Integrated with build tool, optimized output |
| IaC Tool | N/A (MVP) | - | Infrastructure as Code | Manual setup initially, Terraform for AWS migration |
| CI/CD | Vercel | - | Automated deployment | Git-based deployments, preview environments |
| Monitoring | Vercel Analytics + Supabase Metrics | - | Performance and usage tracking | Built-in monitoring, cost-effective |
| Logging | Vercel Functions Logs | - | Application logging | Integrated logging, searchable |
| CSS Framework | Tailwind CSS | 3+ | Utility-first CSS | Rapid development, consistent design system |

## Data Models

### User

**Purpose:** Core user entity for authentication and personalization

**Key Attributes:**
- id: UUID - Primary identifier
- email: string - Authentication and communication
- name: string - Display name
- created_at: timestamp - Account creation tracking
- preferences: JSONB - User settings and interface preferences

#### TypeScript Interface

```typescript
interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  preferences?: UserPreferences;
}

interface UserPreferences {
  default_context: 'work' | 'personal';
  breakdown_style: 'detailed' | 'minimal';
  interface_mode: 'professional' | 'casual';
}
```

#### Relationships
- One-to-many with Tasks (user owns many tasks)
- One-to-many with TaskModifications (user makes many modifications)

### Task

**Purpose:** Central entity representing user tasks with hierarchical breakdown support

**Key Attributes:**
- id: UUID - Primary identifier
- user_id: UUID - Owner reference
- parent_task_id: UUID? - Enables task hierarchy
- title: string - Task name
- description: text? - Detailed task information
- due_date: timestamp? - Parsed deadline
- priority: integer - Inferred urgency (0=normal, 1=high, 2=urgent, -1=low)
- context: string - work/personal classification
- task_type: string - Template category (planning, research, review, etc.)
- status: string - Current state (pending, in_progress, completed)
- breakdown_source: string - Origin (manual, rule, ai)
- task_level: integer - Hierarchy depth (0=parent, 1=subtask)
- sequence_order: integer - Ordering within breakdown

#### TypeScript Interface

```typescript
interface Task {
  id: string;
  user_id: string;
  parent_task_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: number;
  context: 'work' | 'personal';
  task_type: string;
  status: 'pending' | 'in_progress' | 'completed';
  breakdown_source: 'manual' | 'rule' | 'ai';
  task_level: number;
  sequence_order: number;
  estimated_effort?: number; // minutes
  actual_effort?: number; // minutes
  created_at: string;
  updated_at: string;
}
```

#### Relationships
- Many-to-one with User (task belongs to user)
- Self-referencing (parent-child task hierarchy)
- One-to-many with TaskModifications (task has modification history)

### TaskTemplate

**Purpose:** Rule-based breakdown templates for intelligent task processing

**Key Attributes:**
- id: UUID - Primary identifier
- name: string - Template identifier
- task_pattern: string - Trigger keywords/phrases
- template_data: JSONB - Structured breakdown logic
- usage_count: integer - Popularity tracking
- success_rate: decimal - Completion effectiveness

#### TypeScript Interface

```typescript
interface TaskTemplate {
  id: string;
  name: string;
  task_pattern: string;
  template_data: {
    subtasks: SubtaskTemplate[];
    variables: string[];
    conditions?: ConditionalLogic[];
  };
  usage_count: number;
  success_rate: number;
  created_at: string;
}

interface SubtaskTemplate {
  title: string;
  description?: string;
  estimated_effort?: number;
  prerequisites?: string[];
  sequence_order: number;
}
```

#### Relationships
- Referenced by Tasks (via breakdown_source and metadata)

## API Specification

### REST API Specification

```yaml
openapi: 3.0.0
info:
  title: Intelligent To-Do App API
  version: 1.0.0
  description: RESTful API for task management with intelligent breakdown
servers:
  - url: https://your-app.vercel.app/api
    description: Production API via Vercel Functions

paths:
  /tasks:
    get:
      summary: Get user tasks
      parameters:
        - name: context
          in: query
          schema:
            type: string
            enum: [work, personal]
        - name: status
          in: query
          schema:
            type: string
            enum: [pending, in_progress, completed]
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Task'
    
    post:
      summary: Create new task with intelligent breakdown
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                input:
                  type: string
                  description: Natural language task input
                context:
                  type: string
                  enum: [work, personal]
      responses:
        '201':
          description: Created task with breakdown
          content:
            application/json:
              schema:
                type: object
                properties:
                  parent_task:
                    $ref: '#/components/schemas/Task'
                  subtasks:
                    type: array
                    items:
                      $ref: '#/components/schemas/Task'

  /tasks/{id}:
    get:
      summary: Get specific task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Task details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
    
    put:
      summary: Update task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Task'
      responses:
        '200':
          description: Updated task
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
    
    delete:
      summary: Delete task
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Task deleted successfully

  /auth/login:
    post:
      summary: User authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: Authentication successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  token:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
        email:
          type: string
        name:
          type: string
        created_at:
          type: string
    
    Task:
      type: object
      properties:
        id:
          type: string
        user_id:
          type: string
        parent_task_id:
          type: string
          nullable: true
        title:
          type: string
        description:
          type: string
          nullable: true
        due_date:
          type: string
          nullable: true
        priority:
          type: integer
        context:
          type: string
          enum: [work, personal]
        task_type:
          type: string
        status:
          type: string
          enum: [pending, in_progress, completed]
        breakdown_source:
          type: string
          enum: [manual, rule, ai]
        task_level:
          type: integer
        sequence_order:
          type: integer
        created_at:
          type: string
        updated_at:
          type: string
```

## Components

### Frontend Application

**Responsibility:** Single-page React application providing the conversational task management interface

**Key Interfaces:**
- Task input processing and display
- Real-time task updates via Supabase
- Context switching (work/personal)
- Task hierarchy visualization

**Dependencies:** Supabase client, TanStack Query, Zustand store

**Technology Stack:** React 18, TypeScript, Tailwind CSS, Vite build system

### Task Breakdown Service

**Responsibility:** Intelligent parsing and breakdown of natural language task input

**Key Interfaces:**
- Natural language processing endpoint
- Template matching and variable substitution
- Metadata extraction (dates, priorities, context)
- Hierarchical task generation

**Dependencies:** Task template library, date parsing utilities

**Technology Stack:** Vercel Functions, TypeScript, custom rule engine

### Authentication Service

**Responsibility:** User authentication and session management

**Key Interfaces:**
- Login/logout endpoints
- JWT token validation
- User registration and profile management
- Social authentication integration

**Dependencies:** Supabase Auth SDK

**Technology Stack:** Supabase Auth, JWT tokens, secure cookie management

### Database Layer

**Responsibility:** Data persistence and retrieval with real-time capabilities

**Key Interfaces:**
- Task CRUD operations
- User management
- Real-time subscriptions
- Template library access

**Dependencies:** Supabase PostgreSQL, connection pooling

**Technology Stack:** Supabase PostgreSQL, Row Level Security, real-time subscriptions

### Component Diagrams

```mermaid
C4Container
    title System Context Diagram for Intelligent To-Do App

    Person(user, "User", "Person managing tasks")
    System(todo_app, "Intelligent To-Do App", "Converts complex tasks into actionable breakdowns")
    
    System_Ext(supabase, "Supabase", "Database and Authentication")
    System_Ext(vercel, "Vercel", "Hosting and Functions")
    
    Rel(user, todo_app, "Creates and manages tasks")
    Rel(todo_app, supabase, "Stores data, authenticates users")
    Rel(todo_app, vercel, "Hosted on, executes functions")
```

## Database Schema

Based on the PRD specifications, implementing the following schema structure:

```sql
-- Core Tables

-- User authentication and profile data
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Central task storage supporting hierarchical breakdown
tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  parent_task_id UUID REFERENCES tasks(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  
  -- Natural language parsing results
  due_date TIMESTAMP,
  priority INTEGER DEFAULT 0,
  context VARCHAR(50),
  task_type VARCHAR(50),
  
  -- Task breakdown tracking
  breakdown_source VARCHAR(20) DEFAULT 'manual',
  task_level INTEGER DEFAULT 0,
  sequence_order INTEGER DEFAULT 0,
  
  -- Task completion tracking
  status VARCHAR(20) DEFAULT 'pending',
  completed_at TIMESTAMP,
  
  -- Effort estimation
  estimated_effort INTEGER,
  actual_effort INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template library for rule-based task breakdown
task_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  task_pattern VARCHAR(500),
  template_data JSONB,
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2) DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User personalization and system learning
user_preferences (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  preference_key VARCHAR(100) NOT NULL,
  preference_value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, preference_key)
);

-- Learning system: tracks user modifications
task_modifications (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  original_breakdown JSONB,
  user_modifications JSONB,
  modification_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quality feedback system
breakdown_feedback (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  breakdown_source VARCHAR(20),
  user_rating INTEGER,
  completion_rate DECIMAL(3,2),
  feedback_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_tasks_user_parent ON tasks(user_id, parent_task_id);
CREATE INDEX idx_tasks_user_context_status ON tasks(user_id, context, status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_sequence ON tasks(parent_task_id, sequence_order);
```

## Unified Project Structure

```plaintext
simple-todo/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── apps/                       # Application packages
│   ├── web/                    # Frontend application
│   │   ├── src/
│   │   │   ├── components/     # UI components
│   │   │   │   ├── TaskInput/
│   │   │   │   ├── TaskList/
│   │   │   │   ├── TaskHierarchy/
│   │   │   │   └── ContextToggle/
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   └── TaskDetail.tsx
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useTasks.ts
│   │   │   │   └── useTaskBreakdown.ts
│   │   │   ├── services/       # API client services
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── tasks.ts
│   │   │   ├── stores/         # State management
│   │   │   │   ├── authStore.ts
│   │   │   │   └── taskStore.ts
│   │   │   ├── styles/         # Global styles/themes
│   │   │   │   └── globals.css
│   │   │   └── utils/          # Frontend utilities
│   │   │       ├── date.ts
│   │   │       └── validation.ts
│   │   ├── public/             # Static assets
│   │   ├── tests/              # Frontend tests
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/                    # Vercel Functions
│       ├── auth/
│       │   ├── login.ts
│       │   ├── register.ts
│       │   └── refresh.ts
│       ├── tasks/
│       │   ├── create.ts
│       │   ├── list.ts
│       │   ├── update.ts
│       │   └── delete.ts
│       ├── breakdown/
│       │   ├── analyze.ts
│       │   └── generate.ts
│       └── utils/
│           ├── database.ts
│           ├── auth.ts
│           └── templates.ts
├── packages/                   # Shared packages
│   ├── shared/                 # Shared types/utilities
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces
│   │   │   │   ├── user.ts
│   │   │   │   ├── task.ts
│   │   │   │   └── api.ts
│   │   │   ├── constants/      # Shared constants
│   │   │   │   └── index.ts
│   │   │   └── utils/          # Shared utilities
│   │   │       ├── validation.ts
│   │   │       └── date.ts
│   │   └── package.json
│   ├── ui/                     # Shared UI components
│   │   ├── src/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   └── Modal/
│   │   └── package.json
│   └── config/                 # Shared configuration
│       ├── eslint/
│       │   └── base.js
│       ├── typescript/
│       │   └── base.json
│       └── tailwind/
│           └── base.js
├── docs/                       # Documentation
│   ├── prd.md
│   ├── architecture.md
│   └── api-reference.md
├── .env.example                # Environment template
├── package.json                # Root package.json
├── package-lock.json           # NPM workspace lockfile
├── tsconfig.json               # TypeScript configuration
└── README.md
```

## Development Workflow

### Local Development Setup

#### Prerequisites

```bash
# Install Node.js 18+ and npm
node --version  # Should be 18+
npm --version

# Install Supabase CLI
npm install -g supabase

# Verify installations
supabase --version
```

#### Initial Setup

```bash
# Clone and setup project
git clone <repository-url>
cd simple-todo
npm install

# Setup Supabase project
supabase init
supabase start  # Starts local Supabase instance

# Setup environment variables
cp .env.example .env.local
# Fill in Supabase project URL and anon key

# Setup database schema
supabase db reset  # Creates tables from migrations
```

#### Development Commands

```bash
# Start all services
npm run dev

# Start frontend only
npm run dev:web

# Start local Supabase
npm run dev:db

# Run tests
npm run test          # All tests
npm run test:web      # Frontend tests
npm run test:api      # API function tests
npm run test:e2e      # End-to-end tests
```

### Environment Configuration

#### Required Environment Variables

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173

# Backend (Vercel Functions)
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=postgresql://postgres:password@localhost:54321/postgres

# Shared
NODE_ENV=development
```

## Deployment Architecture

### Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **CDN/Edge:** Vercel Edge Network (global)

**Backend Deployment:**
- **Platform:** Vercel Functions
- **Build Command:** Automatic TypeScript compilation
- **Deployment Method:** Git-based automatic deployment

### CI/CD Pipeline

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'
      
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  deploy-preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:5173 | http://localhost:5173/api | Local development |
| Staging | https://simple-todo-staging.vercel.app | https://simple-todo-staging.vercel.app/api | Pre-production testing |
| Production | https://simple-todo.vercel.app | https://simple-todo.vercel.app/api | Live environment |

## Security and Performance

### Security Requirements

**Frontend Security:**
- CSP Headers: Content-Security-Policy with strict-dynamic and nonce-based inline scripts
- XSS Prevention: Input sanitization, output encoding, React's built-in XSS protection
- Secure Storage: JWT tokens in httpOnly cookies, sensitive data encrypted

**Backend Security:**
- Input Validation: Zod schema validation on all API endpoints
- Rate Limiting: Vercel's built-in rate limiting (100 requests/minute per IP)
- CORS Policy: Restricted to frontend domain only

**Authentication Security:**
- Token Storage: JWT in secure, httpOnly cookies with SameSite=strict
- Session Management: Supabase Auth with automatic token refresh
- Password Policy: Minimum 8 characters, complexity requirements via Supabase

### Performance Optimization

**Frontend Performance:**
- Bundle Size Target: < 500KB gzipped main bundle
- Loading Strategy: Code splitting, lazy loading for routes
- Caching Strategy: Browser caching for static assets, SWR for API data

**Backend Performance:**
- Response Time Target: < 2 seconds for task breakdown (PRD requirement)
- Database Optimization: Proper indexing, connection pooling via Supabase
- Caching Strategy: In-memory template caching, Supabase edge caching

## Testing Strategy

### Testing Pyramid

```
      E2E Tests (10%)
     /              \
    Integration Tests (20%)
   /                    \
  Frontend Unit (35%)  Backend Unit (35%)
```

### Test Organization

#### Frontend Tests

```
apps/web/tests/
├── components/
│   ├── TaskInput.test.tsx
│   ├── TaskList.test.tsx
│   └── TaskHierarchy.test.tsx
├── hooks/
│   ├── useAuth.test.ts
│   └── useTasks.test.ts
├── services/
│   └── api.test.ts
└── utils/
    └── validation.test.ts
```

#### Backend Tests

```
apps/api/tests/
├── auth/
│   ├── login.test.ts
│   └── register.test.ts
├── tasks/
│   ├── create.test.ts
│   └── breakdown.test.ts
└── utils/
    └── templates.test.ts
```

#### E2E Tests

```
tests/e2e/
├── auth.spec.ts
├── task-creation.spec.ts
├── task-breakdown.spec.ts
└── context-switching.spec.ts
```

### Test Examples

#### Frontend Component Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskInput } from '../src/components/TaskInput';

describe('TaskInput', () => {
  it('should submit task on Enter key', () => {
    const onSubmit = jest.fn();
    render(<TaskInput onSubmit={onSubmit} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Plan birthday party' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onSubmit).toHaveBeenCalledWith('Plan birthday party');
  });
});
```

#### Backend API Test

```typescript
import { createTask } from '../src/tasks/create';
import { createMocks } from 'node-mocks-http';

describe('/api/tasks/create', () => {
  it('should create task with breakdown', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        input: 'Plan team offsite for Q4',
        context: 'work'
      }
    });

    await createTask(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.parent_task.title).toBe('Plan team offsite for Q4');
    expect(data.subtasks).toHaveLength(3); // Expected breakdown size
  });
});
```

#### E2E Test

```typescript
import { test, expect } from '@playwright/test';

test('user can create and complete task', async ({ page }) => {
  await page.goto('/');
  
  // Login
  await page.fill('[data-testid=email]', 'test@example.com');
  await page.fill('[data-testid=password]', 'password123');
  await page.click('[data-testid=login-button]');
  
  // Create task
  await page.fill('[data-testid=task-input]', 'Organize garage sale');
  await page.press('[data-testid=task-input]', 'Enter');
  
  // Verify task breakdown
  await expect(page.locator('[data-testid=subtask]')).toHaveCount(4);
  
  // Complete first subtask
  await page.click('[data-testid=subtask-checkbox]:first-child');
  await expect(page.locator('[data-testid=progress-bar]')).toContainText('25%');
});
```

## Coding Standards

### Critical Fullstack Rules

- **Type Sharing:** Always define types in packages/shared and import from there
- **API Calls:** Never make direct HTTP calls - use the service layer from packages/shared/services
- **Environment Variables:** Access only through config objects, never process.env directly
- **Error Handling:** All API routes must use the standard error handler and return consistent error format
- **State Updates:** Never mutate state directly - use proper state management patterns (Zustand actions)
- **Database Access:** Always use Supabase client, never raw SQL in frontend code
- **Authentication:** Always validate JWT tokens in API functions before processing requests
- **Input Validation:** Use Zod schemas for all user inputs, both frontend and backend

### Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `TaskInput.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/tasks/create.ts` |
| Database Tables | - | snake_case | `task_templates` |
| Functions | camelCase | camelCase | `createTask`, `parseInput` |
| Constants | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_TASK_DEPTH` |

## Error Handling Strategy

### Error Flow

```mermaid
sequenceDiagram
    participant Frontend
    participant API
    participant Database
    participant ErrorHandler
    
    Frontend->>API: Request with invalid data
    API->>ErrorHandler: Validation error
    ErrorHandler->>ErrorHandler: Format error response
    ErrorHandler->>API: Formatted error
    API->>Frontend: HTTP 400 + error object
    Frontend->>Frontend: Display user-friendly message
    
    Frontend->>API: Valid request
    API->>Database: Query
    Database->>API: Database error
    API->>ErrorHandler: Database error
    ErrorHandler->>ErrorHandler: Log error, format response
    ErrorHandler->>API: Formatted error
    API->>Frontend: HTTP 500 + error object
    Frontend->>Frontend: Display generic error message
```

### Error Response Format

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Frontend Error Handling

```typescript
// Global error boundary
export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
        // Report to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// API error handling
export async function handleApiError(response: Response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new ApiError(errorData.error);
  }
  return response;
}

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
```

### Backend Error Handling

```typescript
// Standard error handler for all API functions
export function withErrorHandler(handler: Function) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      const errorResponse = formatError(error, req);
      res.status(errorResponse.status).json(errorResponse.body);
    }
  };
}

function formatError(error: any, req: VercelRequest) {
  const requestId = req.headers['x-request-id'] || generateId();
  
  if (error instanceof ValidationError) {
    return {
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
          timestamp: new Date().toISOString(),
          requestId
        }
      }
    };
  }
  
  if (error instanceof DatabaseError) {
    console.error('Database error:', error, { requestId });
    return {
      status: 500,
      body: {
        error: {
          code: 'DATABASE_ERROR',
          message: 'An internal error occurred',
          timestamp: new Date().toISOString(),
          requestId
        }
      }
    };
  }
  
  // Default error
  console.error('Unexpected error:', error, { requestId });
  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId
      }
    }
  };
}
```

## Monitoring and Observability

### Monitoring Stack

- **Frontend Monitoring:** Vercel Analytics for Web Vitals, user interactions, and performance metrics
- **Backend Monitoring:** Vercel Functions logs and metrics, custom logging for business events
- **Error Tracking:** Sentry for error aggregation and alerting (free tier supports MVP needs)
- **Performance Monitoring:** Vercel Analytics for response times, Supabase dashboard for database performance

### Key Metrics

**Frontend Metrics:**
- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- JavaScript errors and error rates
- API response times from client perspective
- User interactions (task creation, completion rates)
- Task breakdown success rates

**Backend Metrics:**
- API request rate and response times
- Error rate by endpoint
- Task processing time (must be < 2s per PRD)
- Database query performance
- Template matching accuracy
- User conversion rates (registration → first task → task completion)

---

🏗️ **Architecture Document Complete!**

This comprehensive fullstack architecture document covers the complete system design from zero-cost MVP through AWS enterprise scaling, addressing all requirements from your PRD while maintaining the flexibility to evolve as your product grows.