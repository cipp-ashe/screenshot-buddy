# Screenshot Task Manager - Copilot Instructions

## Project Overview

Screenshot Task Manager (Screenshot Buddy) is a React-based web application that helps users convert screenshots into actionable tasks. The application provides AI-powered task generation with optional integration to Google's Gemini API, along with local storage persistence for managing tasks.

**Target Audience**: Individuals and teams who want to quickly create tasks from screenshots

**Key Features**:
- Upload and analyze screenshots to automatically generate tasks
- Optional AI-powered task title and description generation
- Task organization with tags and status tracking
- Local storage persistence
- Export functionality for task backup
- Responsive design for all device sizes

## Tech Stack

### Core Technologies
- **React** 18.3.1 - UI Framework
- **TypeScript** 5.5.3 - Type safety and better development experience
- **Vite** 5.4.1 - Fast build tool and development server
- **Tailwind CSS** 3.4.11 - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React component library built on Radix UI

### Key Dependencies
- **@tanstack/react-query** - Server state management
- **react-router-dom** - Client-side routing
- **react-hook-form** with **zod** - Form handling with validation
- **lucide-react** - Icon library
- **sonner** - Toast notifications
- **Google Gemini API** - Optional AI integration for task generation

### Development Tools
- **ESLint** - Linting with TypeScript ESLint
- **PostCSS** & **Autoprefixer** - CSS processing
- **lovable-tagger** - Component tagging for development mode

## Project Structure

```
/
├── src/
│   ├── components/       # React components
│   │   ├── ai/          # AI-related components (settings, help)
│   │   ├── task/        # Task management components
│   │   └── ui/          # shadcn/ui components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Library code and utilities
│   │   └── byoai/       # Bring Your Own AI integration
│   ├── pages/           # Page components (Index, NotFound)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Application entry point
├── public/              # Static assets
└── [config files]       # Various configuration files
```

## Development Workflow

### Setup
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:8080)
```

### Build & Linting
```bash
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Development Server
- Runs on port **8080**
- Hot module replacement enabled
- IPv6 support enabled (host: "::")

## Coding Guidelines

### TypeScript
- Use TypeScript for all new files
- Define proper types; avoid `any` when possible (note: some existing uses of `any` are present)
- Current `tsconfig.json` has relaxed settings (`noImplicitAny: false`, `strictNullChecks: false`) but prefer strict typing in new code
- Use path alias `@/` for imports from the `src` directory (e.g., `import { Button } from "@/components/ui/button"`)

### React Patterns
- Use functional components with hooks
- Follow React Hooks rules (enforced by ESLint)
- Use `react-hook-form` with `zod` for form validation
- Implement proper error boundaries where appropriate
- Use `@tanstack/react-query` for async state management

### Component Structure
- Place shadcn/ui components in `src/components/ui/`
- Group related components in feature directories (e.g., `ai/`, `task/`)
- Export component variants using `class-variance-authority` for consistent styling
- Use `cn()` utility from `@/lib/utils` for conditional classNames

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system defined in `tailwind.config.ts`
- Use shadcn/ui components for consistent UI patterns
- Leverage CSS variables defined in `index.css` for theming
- Responsive design: mobile-first approach

### State Management
- Use React hooks (`useState`, `useEffect`, etc.) for local state
- Use `@tanstack/react-query` for server state and caching
- Local storage for persistence (tasks are stored in browser)
- Context API for theme management (next-themes)

### File Naming
- React components: PascalCase (e.g., `TaskList.tsx`, `ScreenshotUpload.tsx`)
- Utilities and hooks: camelCase (e.g., `nativeAI.ts`, `use-mobile.tsx`)
- Types: camelCase files with PascalCase type names (e.g., `task.ts` containing `Task` type)

### Code Quality
- Run `npm run lint` before committing changes
- Note: There are existing ESLint warnings/errors in the codebase that are not blocking
- Do not introduce new `@typescript-eslint/no-explicit-any` violations
- Keep components focused and single-responsibility
- Write descriptive variable and function names

## AI Integration

### Optional Gemini API
- The app supports optional AI features via Google Gemini API
- Users can add their own API key through the application settings
- AI features are gracefully degraded if no API key is provided
- Located in `src/lib/byoai/` directory
- Follows a "Bring Your Own AI" pattern

### Security Considerations
- API keys are stored in browser local storage (client-side only)
- No server-side API key storage
- Users manage their own credentials
- Validate and sanitize user inputs, especially for screenshot uploads
- File size limits enforced (5MB max)
- Supported formats: JPEG, PNG, GIF, WebP

## Testing & Validation

### Current Status
- No formal test suite currently exists
- Manual testing is performed via the dev server
- Build validation via `npm run build`
- Lint validation via `npm run lint`

### Validation Checklist for Changes
1. Run `npm run lint` - ensure no new linting errors
2. Run `npm run build` - ensure successful build
3. Test in browser via `npm run dev` - verify functionality
4. Check responsive design on multiple screen sizes
5. Test with and without AI features enabled
6. Verify local storage persistence works correctly

## Common Tasks

### Adding a New Component
1. Create component in appropriate directory (`src/components/[feature]/`)
2. Use TypeScript with proper type definitions
3. Import and use shadcn/ui components where appropriate
4. Follow existing patterns for styling and structure
5. Export from component file

### Adding a New shadcn/ui Component
```bash
# Components are already configured, add new ones as needed
# Reference: components.json for configuration
```

### Working with Forms
- Use `react-hook-form` with `useForm` hook
- Define validation schema with `zod`
- Use `@hookform/resolvers/zod` for integration
- Follow patterns in existing form components

### Managing Tasks
- Task type defined in `src/types/task.ts`
- Tasks stored in local storage
- Use existing hooks/utilities for task operations

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Google Gemini API](https://ai.google.dev/)
- [TanStack Query](https://tanstack.com/query/latest)

## Notes for Contributors

- This project was created with [Lovable](https://lovable.dev)
- Follow the existing code style and patterns
- Keep changes focused and minimal
- Test thoroughly before submitting PRs
- Update documentation when adding new features
- Consider backward compatibility with existing local storage data
