# HalluciGuard Enterprise Frontend Architecture

> **Architecture Style**: Feature-Driven Design (FDD) + Modular Zustand Slices + Service Interfaces  
> **Target Execution**: Next.js 15 (App Router), TypeScript, TailwindCSS v4  
> **Design Rules**: Zero inter-feature coupling, strict barrel exports, type safety.

---

## 1. Folder Philosophy & Directory Map

```
frontend/src/
├── app/                        # Next.js App Router route entrypoints
├── features/                   # Independent, self-contained domain feature modules
│   ├── conversation/           # Chat window, streaming bubbles, input console
│   ├── verification/           # Studio stage, prompt suggestions, status banners
│   ├── claims/                 # Claim extraction & inspector pills
│   ├── evidence/               # Ground-truth source lookup & URL cards
│   ├── workflow/               # Multi-agent DAG execution canvas & mini graph
│   ├── timeline/               # Sub-second event trail stream
│   ├── consensus/              # Bayesian truth scoring & metrics
│   ├── diff/                   # Text rewrite diff viewer
│   ├── memory/                 # Vector embedding cluster graph
│   ├── command/                # Command palette (⌘K) & shortcuts
│   ├── landing/                # Public marketing & hero section
│   ├── analytics/              # Verification analytics dashboard
│   └── settings/               # Threshold sliders & API key controls
│
├── shared/                     # Cross-cutting reusable UI primitives & utilities
│   ├── components/ui/          # Button, Card, Badge, Tabs, Tooltip, Modal, Progress
│   ├── components/layout/      # Sidebar, TopBar, MainLayout
│   ├── hooks/                  # useKeyboardShortcut, useDebounce
│   ├── animations/             # Centered Framer Motion presets
│   └── utils/                  # cn, sleep, formatters
│
├── services/                   # Backend & API Service Abstractions
│   ├── api/                    # IVerificationService, IWebSocketService
│   └── index.ts
│
├── providers/                  # Application Context Wrappers
│   ├── ThemeProvider.tsx
│   └── ModalProvider.tsx
│
├── config/                     # Static System Configuration
│   ├── theme.ts
│   ├── verification.ts
│   └── index.ts
│
├── store/                      # Zustand State Management
│   └── chatStore.ts
│
└── types/                      # Comprehensive TypeScript Domain Interfaces
    └── index.ts
```

---

## 2. Feature Philosophy (FDD Rules)

1. **Self-Containment**: Each folder inside `src/features/` owns its components, sub-hooks, local types, and helper logic.
2. **Strict Import Rule**: Features must **never** import code directly from another feature (e.g., `import { X } from '@/features/evidence'`).
3. **Cross-Feature Communication**: Features interact strictly through `shared/`, `services/`, and `store/`.

---

## 3. Import Aliases & Barrel Exports

All imports must use clean alias roots via barrel `index.ts` files:

```typescript
// ✅ Good: Clean barrel import from shared
import { Button, Card } from '@/shared';

// ✅ Good: Clean feature import
import { AnimatedAgentNetwork } from '@/features/workflow';

// ❌ Bad: Deep relative paths
import { Button } from '../../../components/ui/Button';
```

---

## 4. How to Add a New Agent to the Multi-Agent DAG

1. **Type Definition**: Add agent ID to `AgentId` union in `src/types/index.ts`.
2. **Mock Data**: Add initial agent telemetry object to `INITIAL_AGENTS` array in `src/lib/mockData.ts`.
3. **SVG Layout Coordinates**: Add node coordinates `(x, y)` to `nodes` array in `src/components/studio/AnimatedAgentNetwork.tsx`.
4. **Mini Graph Icon**: Add agent icon mapping to `MiniAgentGraph.tsx` inside `src/components/studio/MiniAgentGraph.tsx`.
