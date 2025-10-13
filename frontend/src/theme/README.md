# Frontend Design System

This theme establishes a professional yet expressive identity tailored for creative event professionals and musicians. It blends deep stage-inspired tones with warm accent lights and crisp typography to keep the interface approachable without feeling playful.

## Brand Principles

- **Professional foundation** – dark indigo background, high-contrast typography, and structured spacing create a confident baseline.
- **Musical energy** – gradients mimic stage lighting, while secondary coral and cyan accents echo spotlight and audio meters.
- **Calm interactions** – transitions are subtle; motion is used sparingly to communicate state without distracting from workflows.

## Core Tokens

- **Primary**: `#3D2C8D` (midnight violet) – navigation, primary actions
- **Secondary**: `#FF7B54` (warm coral) – highlights, call-to-action accents
- **Neutrals**: `#0F172A` to `#E5E7EB` – layered backgrounds, copy, dividers
- **Signal colors**: teal blues for information, soft greens for success, amber for cautions
- **Typography**: `Poppins` + `Inter`, balanced between modern professionalism and casual readability

## Layout Guidelines

1. **Page shells** use a dimmed gradient backdrop with elevated cards (border radius 20, soft glassmorphism).
2. **Cards and sections** rely on consistent padding (32px desktop, 20px mobile) with subtle separators for hierarchy.
3. **Buttons** are high-contrast and pill-shaped, pairing gradients on primary with outlined neutrals for secondary actions.
4. **Iconography** leans on filled or rounded MUI icons with a desaturated palette to avoid cartoonish tones.
5. **Motion** should be limited to gentle fades, slides, and micro-interactions (<200ms) to maintain focus.

## Component Strategy

- Shared wrappers for authentication pages, dashboards, and modal content ensure consistent background and spacing.
- Utility styles (`GradientHeader`, `SectionCard`, `StatBadge`) encapsulate repeated visual patterns.
- Responsive typography scales via MUI breakpoints to keep headings bold yet readable on mobile.

## Usage

Import the theme from `src/theme` and wrap the app with the exported `ThemeProvider` in `main.jsx`. Override or extend tokens through `brandTokens` to stay within the visual language.
