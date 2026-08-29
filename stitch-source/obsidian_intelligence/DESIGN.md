---
name: Obsidian Intelligence
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#becab9'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#889484'
  outline-variant: '#3e4a3d'
  surface-tint: '#6fdd78'
  primary: '#6fdd78'
  on-primary: '#00390e'
  primary-container: '#34a547'
  on-primary-container: '#00320b'
  inverse-primary: '#006e23'
  secondary: '#c1c7d0'
  on-secondary: '#2b3138'
  secondary-container: '#41474f'
  on-secondary-container: '#b0b5be'
  tertiary: '#ffb1c4'
  on-tertiary: '#65002e'
  tertiary-container: '#e9638e'
  on-tertiary-container: '#590028'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#8bfb91'
  primary-fixed-dim: '#6fdd78'
  on-primary-fixed: '#002106'
  on-primary-fixed-variant: '#005319'
  secondary-fixed: '#dde3ec'
  secondary-fixed-dim: '#c1c7d0'
  on-secondary-fixed: '#161c23'
  on-secondary-fixed-variant: '#41474f'
  tertiary-fixed: '#ffd9e1'
  tertiary-fixed-dim: '#ffb1c4'
  on-tertiary-fixed: '#3f001a'
  on-tertiary-fixed-variant: '#891544'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
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
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  container-margin: 24px
  gutter: 16px
  sidebar-width: 260px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

The design system is engineered for high-stakes cybersecurity environments, where speed of comprehension and technical credibility are paramount. The brand personality is clinical, vigilant, and authoritative, evoking the atmosphere of a sophisticated Security Operations Center (SOC). 

The visual style is **Modern Corporate** with **Technical Minimalism**. It prioritizes a "lights-out" interface to reduce eye strain during long periods of monitoring. The aesthetic utilizes high-contrast data visualization against a deep, near-black environment. Decorative elements are stripped away in favor of functional density, using subtle glassmorphism and micro-glows only to draw attention to critical system states or threat alerts.

## Colors

The palette is anchored in a deep charcoal foundation to provide maximum contrast for critical indicators. 

- **Base Surfaces:** The primary background uses `#0A0C10`. Component surfaces and cards utilize `#161B22` to create subtle elevation.
- **Action Colors:** The primary action color is an electric green (`#2EA043`), used sparingly for successful states and primary "Execute" or "Deploy" actions.
- **Semantic Risk Scale:** Color is the primary vehicle for information hierarchy. Use the Critical Red (`#F85149`) only for active threats requiring immediate intervention. The Orange and Amber shades are reserved for preventative warnings and suspicious anomalies.
- **Borders & Dividers:** Use `#30363D` for all structural outlines. This low-contrast border maintains grid definition without cluttering the visual field.

## Typography

This design system employs a dual-font strategy to balance readability with technical aesthetics. 

**Inter** is the primary workhorse, used for all interface labels, body text, and headlines. Its neutral, systematic nature ensures clarity in complex data tables. 

**JetBrains Mono** is introduced for secondary metadata, system timestamps, IP addresses, and "Label-Caps" roles. This monospaced addition reinforces the technical "intelligence" nature of the product. 

For mobile screens, `display-lg` should be scaled down to 32px to maintain hierarchy within the narrower viewport. Avoid all italic styles; use weight (600+) for emphasis.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid model**. A persistent left sidebar at 260px provides global navigation, while the main content area utilizes a 12-column fluid grid.

- **Grid:** Use 16px gutters between cards. Main dashboard views should utilize 24px margins.
- **Rhythm:** An 8px linear scale governs all internal padding. 
- **Density:** The design system supports a "High Density" mode for data tables and logs, reducing vertical padding to 4px to maximize the information visible on a single screen.
- **Breakpoints:** At 1024px (Tablet), the sidebar collapses into a rail or hamburger menu. At 768px (Mobile), all grid columns stack vertically.

## Elevation & Depth

In this dark-first environment, depth is achieved through **Tonal Layering** rather than heavy shadows.

1.  **Level 0 (Base):** `#0A0C10` - The absolute background.
2.  **Level 1 (Cards/Sections):** `#161B22` - Used for containers. These feature a 1px solid border of `#30363D`.
3.  **Level 2 (Popovers/Modals):** `#1C2128` - Floating elements use a slightly lighter fill and a 16px blur ambient shadow with 40% opacity to separate from the background.

**Glow Effects:** Critical threat indicators may use a soft 8px outer glow matching their semantic color (e.g., a faint red glow for a Critical Alert card) to provide a "pulsing" sense of urgency without breaking the minimal aesthetic.

## Shapes

The shape language is precise and geometric. A "Soft" (`0.25rem`) corner radius is the standard for almost all UI elements, including buttons, input fields, and cards. This slight rounding prevents the UI from feeling overly aggressive (Brutalist) while maintaining a professional, engineered look.

- **Buttons & Inputs:** 4px radius.
- **Large Containers/Modals:** 8px (`rounded-lg`) radius.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use the Electric Green background with white text. Secondary buttons are "Ghost" style: transparent background with the `#30363D` border.
- **KPI Cards:** Display a large Inter Bold metric, a JetBrains Mono label in all caps, and a small sparkline or trend indicator (percentage + icon).
- **Data Tables:** Use a "zebra-striping" alternative where only the header has a bottom border. Rows should have a hover state of `#1C2128`. Use JetBrains Mono for ID numbers and timestamps.
- **Input Fields:** Dark background (`#0A0C10`), 1px border, and a 2px Primary Green glow on focus.
- **Threat Chips:** Small indicators with a background tint (15% opacity of the semantic color) and a solid foreground text color for high legibility.
- **Security Charts:** Area charts should use semi-transparent fills. Donut charts must use the Risk Scale colors to communicate the health of the system at a glance.
- **Sidebar:** Icons should be simple, high-stroke weight (2px) outlines. Active states are indicated by a 2px vertical green line on the far left.