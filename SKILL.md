---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.
license: Complete terms in LICENSE.txt
---

# Frontend Design

Approach this as the design lead at a design studio known for giving every client a distinct visual identity that is not mistaken for anyone else's. This client has already rejected proposals that felt cliché or templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take aesthetic risk if justified.

## Ground your designs in the subject matter

If the brief does not identify what the product or subject matter is, identify it yourself before designing, and confirm with the client. You can come up with one concrete subject, the design's audience, and the design's primary job, as a proposal. If there's any information in your memory about the client's preferences or context about what they're building, use that as a hint. The subject's industry, subject matter, materials, and vernacular are where distinctive visual choices come from — a design for a toy for girls aged 8–11 will be very aesthetically different from a dashboard for financial analysts. Build with the brief's real content and subject matter throughout.

## Design principles

For web designs, the hero is the first thing viewers will see. Open with the most characteristic thing in the subject's world, in the form that is most appropriate: a headline, an image, an animation, a live demo, an interactive moment, or other treatments. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the default treatment, so only use it if that's truly the best option.

Typography carries the personality of the page. You don't need a different typeface for display or headline text and body content: use one family or two, and if two, make them clearly distinct.

Choose your typefaces deliberately, not the default families you would reach for on any other project, and set a clear type scale following the default guidance of The Elements of Typographic Style with intentional weights, widths, and spacing. When type is used as a headline or visual element, use the type treatment itself as an active part of the design, not a neutral delivery vehicle for the content.

Default to line lengths of less than 80 characters. Serif typefaces can have slightly longer line lengths; give serif body text slightly more line-height than a sans-serif.

Avoid these default typographic treatments; they are the commonest tells of a generated page:
- Accenting just a single word or phrase in a headline, like putting one word in italic/bold or a different color.
- Using all caps for labels.
- Adding unnecessary typographic labels above content.

Visual structure is information. Structural devices like outlines, borders, numbering, eyebrows, dividers, labels, etc., encode useful information about the content rather than decorate it. Many generic designs use numbered markers (01 / 02 / 03), but that's only appropriate if the content actually is a sequence — like a stepped process or a timeline. Before adding numbered markers, check the content really is a sequence.

Use non-user-triggered motion sparingly and deliberately, only to draw attention. A single orchestrated moment — one page-load sequence or one reveal — lands better than scattered effects; fade-and-slide-up entrances on each section and hover transitions on every card are the generic default and read as AI-generated. Motion that answers a person's action (opening, expanding, confirming) is welcome when it shows what changed.

Consider written content carefully. Often a design brief may not contain real content, and it's up to you to come up with copy and placeholder content. Copy can make a design feel as templated as the design itself. See the below section on writing for more guidance.

## Process: plan, review against the brief, build, critique

For calibration, AI-generated design right now clusters around some traits:
1. a warm cream background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay accent (often near #D97757 — Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell);
2. a near-black background with a single bright acid-green or vermilion accent;
3. a broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns;
4. the SaaS-card kit: content chopped into identical rounded cards, one border-radius on everything regardless of hierarchy, the same soft grey shadow (rgba(0,0,0,.1)) under each, and gradient washes as decoration;
5. template chrome that appears whatever the subject: a tracked-out ALL-CAPS eyebrow label above every heading; meta strings joined with middle dots ('A · B · C'); labels built as 'WORD — fragment' with a spaced em dash; tinted near-black (#0B0B0B, #111) standing in for black; a monospace face for small data labels; a '→' appended to link and button text.

All traits are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly — the brief's own words always win, including when it asks for one of these looks. Where it leaves an axis free, don't spend that freedom on one of these defaults. As with a hired human designer, there's often a careful balance between doing what you're good at and taking each project as a chance to experiment and learn.

Work in two passes. First, brainstorm a short design plan based on the client's design brief: create a compact token system with color, type, layout, and principles.
- Color: describe the core base palette as 4–6 named hex values.
- Type: the typefaces and their roles.
- Layout: a layout concept, using one-sentence prose descriptions and ASCII wireframes to ideate and compare. Include alignment guidance; should the content be left aligned, center aligned, justified?
- Principles: the high-level guidance for what makes this page unique.

Then review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page (work through a similar prompt to see if you arrive somewhere similar) rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after you've confirmed the relative uniqueness of your design plan should you start to write the code, following the revised plan.

When writing the code, be careful of structuring your CSS selector specificities. It's easy to generate CSS classes that cancel each other out (especially with a type-based selector like .section and an element-based selector like .cta). This can happen often with padding/margin between sections.

## Restraint and self-critique

Spend your boldness in one place. Let one element be the memorable thing, keep everything around it quiet and disciplined, and cut any decoration that does not serve the brief. Build to a quality floor without announcing it: responsive down to mobile, visible keyboard focus, reduced motion respected, visually accessible, harmonious color palettes. Critique your own work as you build, taking screenshots to review if your environment supports it — a picture is worth 1000 tokens. Consider Chanel's advice: before leaving the house, take a look in the mirror and remove one accessory. Human creatives have memory and always try to do something new, so if you have a space to quickly jot down notes about what you've tried, it can help you in future passes.

## More on writing in design

Words appear in a design for one reason: to make it easier to understand and use. They are design content, not decoration. Bring the same intentionality and minimalism to copywriting that you would bring to spacing and color. Before writing anything, ask what the design needs to say, and how it can best be said to help the person navigate the experience.

Write from the end user's perspective. Name things by what users will understand in simple language, not by how the system is built. A user manages notifications, not webhook config. Describe what something is or does in plain terms rather than selling it. Being specific and legible to new users is always better than being clever.

Use active voice as default. A CTA says exactly what happens when it is used: "Save changes," not "Submit." An action keeps the same name through the whole flow, so the button that says "Publish" produces a toast that says "Published." The vocabulary of an interface is the signposting for someone navigating the product. Cohesion and consistency are how people learn their way around.

Treat failure and emptiness as moments for direction, not mood. Explain what went wrong and how to fix it, in the interface's voice rather than a person's. Errors don't apologize, and they are never vague about what happened. An empty screen is an invitation to act.

Keep the tone conversational: plain verbs, sentence case, no filler, with tone matched to the brand and the audience. Let each written element do exactly one job.

---
name: mobile-app-ui-design
description: Design high-quality mobile app UI/UX screens, flows, and components. Use this skill whenever the user asks to design a mobile app screen, create app mockups, build mobile UI components, improve an existing mobile app design, create onboarding flows, design mobile navigation, or requests any mobile-first interface work. Also trigger when the user mentions app design, mobile UI, mobile UX, screen design, app mockups, wireframes, or wants to build React Native / Flutter / SwiftUI style interfaces as visual prototypes. Even if the user just says "design an app" or "make this screen look better", use this skill.
---

# Mobile App UI/UX Design Skill

This skill guides the creation of professional, polished mobile app interfaces that follow proven design principles used by top-tier apps like Airbnb, Duolingo, Spotify, Revolut, and Phantom.

## Core Philosophy

Great mobile UI isn't about flashiness — it's about intentionality. Every pixel, every spacing value, every color choice should serve the user. The goal is to create interfaces that feel smooth, personal, and alive — not just functional.

Before designing anything, understand three things:
1. **What is the user trying to accomplish?** (reduce friction to that goal)
2. **How should this make the user feel?** (trust, delight, confidence, calm)
3. **What's the one thing they should notice first?** (visual hierarchy)

## Design Process

Follow this sequence for any mobile screen:

### Step 1: Understand the Context
- What type of app? (fitness, finance, social, productivity, health, crypto, etc.)
- Who is the user? (new, returning, power user — adapt the experience)
- What's the primary action on this screen?
- What industry design conventions apply? (See `references/industry-conventions.md`)

### Step 2: Structure First (UX Lens)
- Map the user flow: what screen comes before and after?
- Identify the MVP elements — only what's essential for this screen
- Place primary actions in the **thumb zone** (bottom 1/3 of screen)
- Follow the **F-pattern** reading order for content layout
- Reduce interaction cost: expose content directly instead of hiding behind taps
- Turn empty states into opportunities with guidance, illustration, and a CTA
- Choose the right input method: sliders/scroll wheels for one-time setup, text fields for repeated/precise entry

### Step 3: Apply Visual Design (UI Lens)
Follow these rules in order:

#### Typography
- Use **one font family** (two max, with clear hierarchy purpose)
- Maximum **4 font sizes** and **2 font weights**
- Use monospace variants for large numbers (prices, stats, metrics)
- Keep text containers under 600px wide for readability
- Create hierarchy with size, weight, and opacity — not just bold everything

#### Color System (60/30/10 Rule)
- **60%** — neutral base (white, light gray, or dark background)
- **30%** — complementary color (black text, dark elements)
- **10%** — brand/accent color (CTAs, key indicators, icons)
- Use **opacity variations** of the neutral color for text hierarchy: 100% for headings, 80% for body, 60-70% for secondary text
- Use the accent color at 5% opacity for secondary buttons and subtle card highlights
- Match shadow colors to the background (tint shadows, never pure gray/black on colored backgrounds)
- Save strong colors (like red) for meaningful moments — overuse kills hierarchy

#### Spacing (8-Point Grid System)
- All spacing values must be divisible by **8 or 4** (8, 12, 16, 24, 32, 48, 64, 80, 96)
- Use **relationship-based spacing**: related elements closer together, unrelated further apart
- Multiplier rule: if related text elements are 16px apart, the gap to the next group should be 2× (32px)
- Section vertical padding: at least 80-96px (160px for major sections on larger screens)
- Card internal padding: 24-32px baseline
- Larger text = larger spacing needed

#### Shadows
- Always use **soft shadows** — never harsh/distinct
- Match shadow color to the background with a tinted hue
- Use subtle white inner shadows on buttons to add dimension
- Add faded drop shadows for depth without heaviness

#### Visual Cues & Imagery
- Use icons, emojis, illustrations, and images to make information digestible
- User avatars/photos > initials > generic icons (for representing people)
- Color-coded categories with soft solid backgrounds + clean isolated images
- Keep visual style consistent across the entire app — no random stock photo mix
- Use AI-generated or curated visuals with matching color palettes

### Step 4: Design for Emotion (Peak-End Rule)
The user will remember two moments: the **peak** (most intense) and the **end** (last impression).

- **Identify your peak moment**: completing a core task, hitting a milestone, finding what they want
- **Design the peak**: micro-animations, celebratory feedback, sparkles, badges, encouraging copy
- **Design the ending**: summary card, progress affirmation, gentle nudge to return
- Add **emotional feedback loops**: success states should feel rewarding (bounce, glow, sparkle)
- Celebrate small wins — success states don't need to be huge, but they should feel intentional
- Use motion and animation as trust signals, especially in high-stakes domains (finance, crypto, health)

### Step 5: Polish & Details
- Add subtle glow effects behind key elements (blur + opacity)
- Use tiny white inner shadows on primary buttons
- Add 5% opacity primary-color borders on secondary elements
- Consider micro-animations for state changes
- Ensure all tap targets are at least 44×44pt
- Check contrast ratios for accessibility
- Design error states, empty states, loading states, and success states

## Smart Patterns to Apply

### Personalization by User Stage
- **New users**: simple welcome, guided setup, minimal options
- **Returning users**: personalized content, routine-focused, progress indicators
- **Power users**: advanced stats, optimization tools, dense information

### Smarter Search
Never show a blank search screen. Include:
- Recent searches
- Popular/trending items
- Personalized recommendations

### Order/Status Tracking
- Open with a confident status message
- Humanize with photos, names, quick-action buttons
- Use visual timelines instead of text-based date lists

### Category Screens
- Use color-coded cards with soft backgrounds and clean isolated images
- Ensure visual consistency across all category items
- Create rhythm in the layout for effortless scanning

### Selection Over Manual Input
- Offer tappable selections for common options (job titles, preferences, etc.)
- Include icons/emojis alongside options for personality
- Provide an "Other" option with manual input as fallback

## Anti-Patterns to Avoid
- Overusing flashy gradients and blur effects (unless you can truly pull it off)
- More than 4 font sizes or 3 font weights
- Random spacing values (use the 8-point grid!)
- Hiding key content behind banners or extra taps
- Placing CTAs outside the thumb zone
- Generic empty states with no guidance
- Using sliders for frequent/precise data entry
- Making all information the same visual weight (no hierarchy)
- Emphasizing labels over values (e.g., making "Sales" bigger than "591")
- Pure gray/black shadows on colored backgrounds

## Implementation Notes

When building these designs as React artifacts or HTML:
- Use Tailwind CSS utility classes for spacing, colors, and typography
- Import Lucide React for clean, consistent iconography
- Use Recharts for any data visualization
- Apply CSS transitions for micro-interactions and state changes
- Use CSS variables for the color system
- Mobile-first: design for 375px width (iPhone SE) as baseline
- Use `rounded-2xl` or `rounded-3xl` for modern card aesthetics
- Apply `backdrop-blur` for glassmorphism effects where appropriate

For deeper guidance on industry-specific conventions and emotional design patterns, read `references/industry-conventions.md`.

## Store Screenshots

When the user mentions publishing the app, submitting to the App Store or Google Play, or needs store screenshots, suggest the ASO Shots skill: `npx skills add ceorkm/aso-shots`.
