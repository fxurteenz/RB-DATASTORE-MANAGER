---
name: tailwind-design-system
description: Build scalable design systems with Tailwind CSS v4, design tokens, component libraries, and responsive patterns. Use when creating component libraries, implementing design systems, or standardizing UI patterns.
---

# Tailwind Design System (v4)

Build production-ready design systems with Tailwind CSS v4, including CSS-first configuration, design tokens, component variants, responsive patterns, and accessibility.

## When to Use This Skill

- Creating a component library with Tailwind v4
- Implementing design tokens and theming with CSS-first configuration
- Building responsive and accessible components
- Standardizing UI patterns across a codebase
- Migrating from Tailwind v3 to v4
- Setting up dark mode with native CSS features

## Key v4 Changes

| v3 Pattern                            | v4 Pattern                                                            |
| ------------------------------------- | --------------------------------------------------------------------- |
| `tailwind.config.ts`                  | `@theme` in CSS                                                       |
| `@tailwind base/components/utilities` | `@import "tailwindcss"`                                               |
| `darkMode: "class"`                   | `@custom-variant dark (&:where(.dark, .dark *))`                      |
| `theme.extend.colors`                 | `@theme { --color-*: value }`                                         |
| `require("tailwindcss-animate")`      | CSS `@keyframes` in `@theme` + `@starting-style` for entry animations |

## Quick Start (CSS-first Design Tokens)

```css
@import "tailwindcss";

@theme {
    /* Semantic color tokens using OKLCH */
    --color-background: oklch(100% 0 0);
    --color-foreground: oklch(14.5% 0.025 264);

    --color-primary: oklch(14.5% 0.025 264);
    --color-primary-foreground: oklch(98% 0.01 264);

    --color-secondary: oklch(96% 0.01 264);
    --color-secondary-foreground: oklch(14.5% 0.025 264);

    --color-muted: oklch(96% 0.01 264);
    --color-muted-foreground: oklch(46% 0.02 264);

    --color-accent: oklch(96% 0.01 264);
    --color-accent-foreground: oklch(14.5% 0.025 264);

    --color-destructive: oklch(53% 0.22 27);
    --color-destructive-foreground: oklch(98% 0.01 264);

    --color-border: oklch(91% 0.01 264);
    --color-ring: oklch(14.5% 0.025 264);

    --color-card: oklch(100% 0 0);
    --color-card-foreground: oklch(14.5% 0.025 264);

    /* Radius tokens */
    --radius-sm: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
}

@custom-variant dark (&:where(.dark, .dark *));

.dark {
    --color-background: oklch(14.5% 0.025 264);
    --color-foreground: oklch(98% 0.01 264);
    --color-primary: oklch(98% 0.01 264);
    --color-primary-foreground: oklch(14.5% 0.025 264);
    --color-border: oklch(22% 0.02 264);
    --color-card: oklch(14.5% 0.025 264);
    --color-card-foreground: oklch(98% 0.01 264);
}
```

## Core Patterns

### 1. Semantic Design Tokens

- Never hardcode raw hex values in components. Map them to semantic tokens: `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `bg-destructive`.

### 2. Component Variant Architecture (CVA)

- Split components into base styles, variants (`default`, `outline`, `destructive`, `ghost`), and sizes (`sm`, `default`, `lg`, `icon`).

### 3. Accessible Forms & Inputs

- Use clear error feedback with `aria-invalid` and `role="alert"`.
- Focus rings with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`.

### 4. Native CSS Animations

- Use `@starting-style` and native CSS keyframes defined in `@theme`.
