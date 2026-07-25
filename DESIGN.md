---
name: Synthetix Enterprise
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin-mobile: 16px
  container-margin-desktop: 40px
  gutter: 24px
  section-gap: 64px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system focuses on a **Premium Enterprise Minimalist** aesthetic. It targets high-level decision-makers and technical leads who require clarity, speed, and reliability. The visual narrative combines the structural precision of GitHub and Linear with the refined, fluid elegance found in Vercel’s interfaces.

The goal is to evoke an emotional response of **composed power**. The UI stays out of the way, using generous whitespace and high-quality typography to organize complex AI data. It utilizes a hybrid approach:
- **Minimalism:** Heavy reliance on negative space and purposeful alignment.
- **Glassmorphism:** Reserved strictly for global navigation and modal overlays to create a sense of verticality and "hovering" intelligence.
- **Modern Corporate:** A systematic, logic-driven layout that feels institutional yet cutting-edge.

## Colors
The color system is designed for high-density information environments. While the default mode is **Dark**, the system is built on a logical token structure that mirrors into a crisp Light mode.

- **Primary (Indigo/Blue):** Used for primary actions, active states, and brand-driven focal points. The gradient between these two colors is used sparingly for data visualizations and progress indicators.
- **Secondary (Emerald):** Represents "growth," "success," and "AI operational health." It provides a high-contrast signal against the deep neutrals.
- **Neutral (Slate/Deep Grays):** Forms the backbone of the interface. We use `Slate-950` for the deepest backgrounds and `Slate-800` for borders to maintain a soft, professional depth rather than pure black.

## Typography
The typography system uses a tri-font approach to balance personality and utility.
1. **Geist** is used for headlines to provide a technical, high-end "developer-tool" feel with its precise tracking and geometric forms.
2. **Inter** handles all body copy and UI elements, ensuring maximum legibility across all screen densities.
3. **JetBrains Mono** is utilized for labels, metadata, and AI-generated strings to clearly distinguish machine-output from human-interface text.

Maintain a strict vertical rhythm by adhering to the defined line heights. Mobile headers should downscale by one tier to ensure content density remains usable on smaller viewports.

## Layout & Spacing
This design system utilizes a **Fluid Grid** model with an 8px base unit. 

- **Mobile:** A 4-column grid with 16px side margins. Elements are primarily stacked vertically.
- **Desktop:** A 12-column grid with a maximum content width of 1440px. 
- **Spacing Philosophy:** Use "Generous Padding" within cards (24px - 32px) to prevent data density from becoming overwhelming. Vertical stacks should follow a `16-24-32` progression to create a clear visual hierarchy between related and unrelated content blocks.

## Elevation & Depth
Depth is established through **Tonal Layering** and **Glassmorphism**, avoiding heavy drop shadows in favor of luminosity.

- **Level 0 (Background):** `Slate-950`. The base canvas.
- **Level 1 (Cards/Surface):** `Slate-900` with a 1px `Slate-800` border.
- **Level 2 (Popovers/Modals):** Semi-transparent `Slate-900` (80% opacity) with a 20px Backdrop Blur. This creates the "glass" effect for floating UI.
- **Shadows:** Use a single, very soft ambient shadow for floating elements: `0 8px 32px rgba(0, 0, 0, 0.4)`. No shadows on static cards; use borders to define shape.

## Shapes
The shape language is "Calculated Softness." Standard components use an 8px (0.5rem) radius, while larger containers like cards use a 12px or 16px radius to appear more approachable. 

- **Small (Buttons/Inputs):** 8px.
- **Medium (Cards/Modals):** 12px or 16px.
- **Large (Full-screen sections):** 24px (only for top corners on mobile).
- **Pill:** Reserved exclusively for status indicators (Chips) and search bars.

## Components
- **Buttons:** Primary buttons use a subtle gradient from Indigo to Blue. Ghost buttons use a 1px border that brightens on hover. Use 12px horizontal padding for a wide, stable look.
- **Input Fields:** Dark backgrounds (`Slate-950`) with a subtle `Slate-800` border. The focus state uses a 1px Blue glow (ring). Labels are always `label-md` in JetBrains Mono.
- **Cards:** The signature component. 1px border, 16px roundedness. Use a subtle top-light inner-border (1px stroke at 10% white) to give a "milled" look.
- **Chips/Badges:** Use `label-sm`. Success badges use Emerald text on a 10% opacity Emerald background.
- **Lists:** High-density rows with 1px bottom dividers. Interactive rows should have a `Slate-800` hover state.
- **AI Specifics:** Use a "Sparkle" icon and a very thin (1px) animated gradient border for any component that is actively processing AI data.