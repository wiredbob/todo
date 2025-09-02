# Unified Project Structure

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
