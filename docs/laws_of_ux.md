# Laws of UX Reference Guide

A comprehensive list of user experience design principles, psychological heuristics, and engineering best practices across the CAP Multi-Tenant Framework.

---

## 4 Key Principles Guiding UI

Every interface and layout in the CAP ecosystem is anchored in four foundational visual principles:

1. **Visual Hierarchy**: Guiding the eye to the most important information first.
   - _Application_: Establish unambiguous focal points using calibrated scale, font weight, spatial isolation, and elevation tiers.
2. **Contrast**: Making elements legible and distinct from one another.
   - _Application_: Enforce WCAG AA/AAA contrast ratios (4.5:1 text, 3:1 UI boundaries) and isolate primary CTAs from secondary/neutral elements.
3. **Alignment**: Creating visual order to reduce the user's mental effort.
   - _Application_: Lock components to consistent 8pt/4pt grids, maintain precise baseline alignments, and respect logical inline/block directions (including RTL).
4. **Proximity**: Grouping related elements to indicate that they share a function.
   - _Application_: Apply tight internal spacing (4-8px) between tightly coupled controls (e.g. label + input) and generous outer spacing (24-32px) between independent cards and sections.

---

## Principles & Cognitive Laws

### Aesthetic-Usability Effect

**Definition**: Users often perceive aesthetically pleasing design as design that’s more usable.

- **Engineering Application**: Maintain polished visual tokens, consistent spacing scales, subtle micro-interactions, and refined typography. An aesthetically cohesive interface increases user tolerance for minor usability friction and builds initial trust.
- **CAP Implementation**: Enforced through `@cap/theme` presets, liquid glass visual effects, and fluid typography tokens (`--font-display` to `--font-body`).

### Choice Overload

**Definition**: The tendency for people to get overwhelmed when they are presented with a large number of options, often used interchangeably with the term paradox of choice.

- **Engineering Application**: Limit high-priority choices presented simultaneously. Use progressive disclosure, filtering, and sensible defaults.
- **CAP Implementation**: Multi-tenant configuration screens present curated presets first; granular CSS variable controls are grouped into advanced collapsible panels.

### Chunking

**Definition**: A process by which individual pieces of an information set are broken down and then grouped together in a meaningful whole.

- **Engineering Application**: Group related fields, settings, or data elements into logical visual units, cards, or steps.
- **CAP Implementation**: Bento grid card layouts, multi-step stepper pipelines (`@cap/module-landing`), and grouped form sections.

### Cognitive Bias

**Definition**: A systematic error of thinking or rationality in judgment that influences our perception of the world and our decision-making ability.

- **Engineering Application**: Design neutral, transparent user journeys that avoid exploiting cognitive biases (e.g. anti-confirmshaming, clear opt-outs).
- **CAP Implementation**: Transparent subscription cancellation and explicit confirmation modals (`packages/theme/DESIGN_SYSTEM.md` §2).

### Cognitive Load

**Definition**: The amount of mental resources needed to understand and interact with an interface.

- **Engineering Application**: Minimize extraneous cognitive load by removing visual clutter, standardizing iconography, and keeping workflows linear.
- **CAP Implementation**: Isolated widget error boundaries, self-explanatory button labels, and uncluttered navigation shells.

### Doherty Threshold

**Definition**: Productivity soars when a computer and its users interact at a pace (<400ms) that ensures that neither has to wait on the other.

- **Engineering Application**: All client-side transitions, debounces, micro-animations, and feedback states MUST execute in under 400ms. For operations exceeding 400ms, immediately render skeleton shimmers or optimistic updates.
- **CAP Implementation**: CSS transitions bounded to 150ms-300ms; button action locks (`100ms`); `ThemeBridge` single-frame RAF updates.

### Fitts’s Law

**Definition**: The time to acquire a target is a function of the distance to and size of the target.

- **Engineering Application**: Primary interactive elements (buttons, inputs) must have large, accessible touch targets (minimum 44x44px, ideally 48px height) and be placed in easily reachable regions.
- **CAP Implementation**: Form inputs enforce `minHeight: 48px`, buttons enforce minimum 44px touch targets (`var(--touch-target-min)`).

### Flow

**Definition**: The mental state in which a person performing some activity is fully immersed in a feeling of energized focus, full involvement, and enjoyment in the process of the activity.

- **Engineering Application**: Remove disruptive modal interruptions, layout shifts, or stuttering animations during critical workflows (e.g. checkout, auth, forms).
- **CAP Implementation**: Zero layout shift (CLS < 0.1) enforced with `scrollbar-gutter: stable;` and fixed skeleton geometry.

### Goal-Gradient Effect

**Definition**: The tendency to approach a goal increases with proximity to the goal.

- **Engineering Application**: Show clear progress bars, completed step indicators, and remaining effort in multi-step workflows.
- **CAP Implementation**: Multi-step onboarding wizards and registration pipelines display numeric step indicators (e.g. "Step 3 of 4: Organization Setup").

### Hick’s Law

**Definition**: The time it takes to make a decision increases with the number and complexity of choices.

- **Engineering Application**: Break complex forms (> 6 fields) into progressive steps. Provide pre-selected, safe defaults for tenant configurations.
- **CAP Implementation**: Tenant onboarding defaults to recommended theme presets rather than asking for 40 raw color tokens upfront.

### Jakob’s Law

**Definition**: Users spend most of their time on other sites. This means that users prefer your site to work the same way as all the other sites they already know.

- **Engineering Application**: Follow standard web navigation conventions (top-left branding, top-right user menu, standard search shortcuts).
- **CAP Implementation**: Standardized navigation layouts (`VerticalLayout`, `HorizontalLayout`) with top header utility area and standard keyboard command palette (`Cmd/Ctrl + K`).

### Law of Common Region

**Definition**: Elements tend to be perceived into groups if they are sharing an area with a clearly defined boundary.

- **Engineering Application**: Enclose related interactive controls and information inside explicit card surfaces, borders, or container backgrounds.
- **CAP Implementation**: Bento grid card architecture, surface elevation layers (`background.paper`, `borders.subtle`).

### Law of Proximity

**Definition**: Objects that are near, or proximate to each other, tend to be grouped together.

- **Engineering Application**: Spacing between related items must be smaller than spacing between unrelated items (e.g. form label is 4-8px from its input; 24px between field groups).
- **CAP Implementation**: MUI spacing scale tokens (`theme.spacing(1)` for label-input gap, `theme.spacing(3)` for section separation).

### Law of Prägnanz

**Definition**: People will perceive and interpret ambiguous or complex images as the simplest form possible, because it is the interpretation that requires the least cognitive effort of us.

- **Engineering Application**: Use clean, geometric iconography, simple status badges, and uncluttered data visualizations rather than over-decorated shapes.
- **CAP Implementation**: Consistent SVG icon set, crisp typography, and uncluttered metric card widgets.

### Law of Similarity

**Definition**: The human eye tends to perceive similar elements as a complete picture, shape, or group, even if those elements are separated.

- **Engineering Application**: Use consistent colors, typography, shapes, and hover states for elements that share functionality across the application.
- **CAP Implementation**: Global component style overrides (`getComponentOverrides`) applied uniformly across all modules.

### Law of Uniform Connectedness

**Definition**: Elements that are visually connected are perceived as more related than elements with no connection.

- **Engineering Application**: Use connector lines, divider tabs, or continuous progress bars to show relationships between sequential steps or hierarchy trees.
- **CAP Implementation**: Pipeline step connectors, timeline trees, and tab underline indicators.

### Mental Model

**Definition**: A compressed model based on what we think we know about a system and how it works.

- **Engineering Application**: Design interfaces that match user domain expectations (e.g., identity management models users, roles, and permissions according to standard RBAC semantics).
- **CAP Implementation**: User directory, session management, and auth configuration follow established industry IAM conventions.

### Miller’s Law

**Definition**: The average person can only keep 7 (plus or minus 2) items in their working memory.

- **Engineering Application**: Avoid navigation menus, toolbars, or option lists with more than 5-7 primary items without categorical sub-grouping.
- **CAP Implementation**: Navigation items in module contracts (`navItems`) group entries into distinct titled sections with max 5-7 items per group.

### Occam’s Razor

**Definition**: Among competing hypotheses that predict equally well, the one with the fewest assumptions should be selected.

- **Engineering Application**: Choose the simplest UI pattern that solves the problem. Do not add redundant wrapper elements, unnecessary nested dropdowns, or superfluous confirmation steps.
- **CAP Implementation**: Direct, single-click actions for low-risk actions; clear single-modal flows for destructive actions.

### Paradox of the Active User

**Definition**: Users never read manuals but start using the software immediately.

- **Engineering Application**: Build intuitive, self-explanatory user interfaces with inline tooltips, contextual empty states with action CTAs, and sensible default values.
- **CAP Implementation**: 4 UI States architecture with guided Empty States (`.state-empty-container`) featuring instant "Create First Item" CTAs.

### Pareto Principle

**Definition**: The Pareto principle states that, for many events, roughly 80% of the effects come from 20% of the causes.

- **Engineering Application**: Prioritize the top 20% of features that drive 80% of user workflows (e.g. quick search, top actions, primary filters) and make them instantly accessible.
- **CAP Implementation**: Command palette (`SearchItemConfig`), quick-action headers, and top-level dashboard metrics.

### Parkinson’s Law

**Definition**: Any task will inflate until all of the available time is spent.

- **Engineering Application**: Provide clear micro-goals, inline validation, and time-saving automation (e.g. autofill, address lookup, clipboard paste).
- **CAP Implementation**: Live form masks, autofill tokens, and instant client-side validation.

### Peak-End Rule

**Definition**: People judge an experience largely based on how they felt at its peak and at its end, rather than the total sum or average of every moment of the experience.

- **Engineering Application**: Ensure the climax of an action (e.g. successful deployment, payment, invitation) and the conclusion of a session feel delightful, responsive, and rewarding.
- **CAP Implementation**: Success feedback states (`.state-success-glow`), rewarding confirmation screens, and clean session summaries.

### Postel’s Law

**Definition**: Be liberal in what you accept, and conservative in what you send.

- **Engineering Application**: Accept user inputs in various formats (e.g. phone numbers with or without spaces, dates in multiple formats), normalize on the frontend, and output strictly standardized payloads to APIs.
- **CAP Implementation**: Input formatting masks, resilient data parsers, and strictly typed API schemas (`@cap/api-contracts`).

### Selective Attention

**Definition**: The process of focusing our attention only to a subset of stimuli in an environment — usually those related to our goals.

- **Engineering Application**: Use focal points, high visual hierarchy, and dimmed background overlays (scrims) during modal tasks to focus user attention on the primary goal.
- **CAP Implementation**: One focal point per view, accessible dialog backdrops, and active menu item highlighting.

### Serial Position Effect

**Definition**: Users have a propensity to best remember the first and last items in a series.

- **Engineering Application**: Place the most critical navigation links, table columns, or action buttons at the start and end of lists or navigation bars.
- **CAP Implementation**: Home/Dashboard as first navigation item, Settings/Profile as last; primary CTA anchored at the end of action rows.

### Tesler’s Law

**Definition**: Tesler's Law, also known as The Law of Conservation of Complexity, states that for any system there is a certain amount of complexity which cannot be reduced.

- **Engineering Application**: Handle necessary backend and system complexity behind the scenes in framework architecture so the end-user experience remains simple.
- **CAP Implementation**: Multi-tenant token compilation (`composeMuiTheme`), dynamic module assembly (`assembleApp`), and automated RTL flipping handled transparently by the framework.

### Von Restorff Effect

**Definition**: The Von Restorff effect, also known as The Isolation Effect, predicts that when multiple similar objects are present, the one that differs from the rest is most likely to be remembered.

- **Engineering Application**: Give primary CTA buttons, highlighted pricing tiers, or critical security warnings distinct visual weight, color, or elevation.
- **CAP Implementation**: `variant="contained"` with primary brand color for the main CTA; accent badges for "Recommended" or "Popular" options.

### Working Memory

**Definition**: A cognitive system that temporarily holds and manipulates information needed to complete tasks.

- **Engineering Application**: Keep relevant context visible on screen while the user completes a task rather than requiring them to recall information from previous screens.
- **CAP Implementation**: Summary side-panels in checkout/onboarding, sticky headers in long tables, and contextual breadcrumbs.

### Zeigarnik Effect

**Definition**: People remember uncompleted or interrupted tasks better than completed tasks.

- **Engineering Application**: Provide visual indicators for unfinished setup tasks, draft saving, and incomplete profile progress to encourage completion.
- **CAP Implementation**: Onboarding checklist widgets, tenant setup progress meters, and draft auto-saving indicators.
