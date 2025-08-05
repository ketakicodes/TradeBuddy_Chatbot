# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
# Development
npm run dev        # Start development server on http://localhost:3000

# Production
npm run build      # Build for production
npm run start      # Start production server

# Code Quality
npm run lint       # Run Next.js linter
```

Note: When installing dependencies, use `npm install --legacy-peer-deps` due to a date-fns version conflict with react-day-picker.

## Architecture Overview

This is a Next.js 15.2.4 AI chat interface template with a three-panel layout:

### Core Layout

- **Collapsible Sidebar**: Project/chat history, user profile (3.05rem collapsed, 15rem expanded)
- **Chat Interface**: Resizable panel (360-800px) with streaming AI responses
- **Canvas View**: Multi-tab interface for different AI-generated content types

### Key Architectural Decisions

1. **Client-side rendering** for all interactive components using "use client" directive
2. **Local state management** - no global state, chat state via Vercel AI SDK
3. **Mock API** at `/api/chat/route.ts` - simulates AI responses, ready for real integration
4. **Dark-first design** with next-themes for theme switching
5. **Custom resizable panels** implementation (not using react-resizable-panels despite being installed)

### Component Structure

- `/components/` - Main application components (sidebar, chat-interface, canvas-view)
- `/components/ui/` - Atomic UI components following shadcn/ui pattern (Radix UI + Tailwind)
- All UI components use Radix UI primitives with Tailwind styling
- Animations via Framer Motion (sidebar hover, loading states)

### Important Implementation Details

- Chat functionality uses Vercel AI SDK's `useChat` hook for streaming
- Form handling with React Hook Form + Zod validation
- Toast notifications via Sonner
- Custom hooks in `/hooks/` for reusable logic
- The body element requires `suppressHydrationWarning` due to browser extensions

### File References

- Main entry: `app/page.tsx`
- Chat API: `app/api/chat/route.ts`
- Core layout: `components/resizable-panels.tsx`
- Chat logic: `components/chat-interface.tsx`
