# TechMind — Brand Identity Summary

## Logo

**Mark:** Two concentric circles — a teal ring with a gold dot at center.  
**Wordmark:** "TechMind" set in Plus Jakarta Sans Bold.  
**Concept:** The outer ring represents global reach and digital connectivity. The inner dot represents the core of innovation and knowledge.

### Logo Files

| File | Use |
|------|-----|
| `techmind-icon.svg` | Favicons, social avatars, app icons (mark only) |
| `techmind-favicon.svg` | Browser favicon (32px optimized) |
| `techmind-logo-light.svg` | Full lockup for light/white backgrounds |
| `techmind-logo-dark.svg` | Full lockup for dark backgrounds |

---

## Color Palette — "Trust & Innovation"

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| **Primary** | Deep Navy | `#0F4C75` | Headers, primary buttons, key UI elements |
| **Secondary** | Teal | `#1B98A4` | Logo ring, links, secondary actions, accents |
| **Accent** | Gold | `#F7B731` | Logo dot, CTAs, highlights, badges |
| **Dark** | Midnight | `#0B1D33` | Navigation bars, footer, body text on light bg |
| **Light** | Ice Blue | `#F4F7FA` | Page backgrounds, card backgrounds |
| **Body Text** | Slate | `#6B7A8D` | Paragraph text, descriptions, captions |

### CSS Variables

```css
:root {
  --color-primary: #0F4C75;
  --color-secondary: #1B98A4;
  --color-accent: #F7B731;
  --color-dark: #0B1D33;
  --color-light: #F4F7FA;
  --color-text: #6B7A8D;
}
```

---

## Typography

### Heading Font: Plus Jakarta Sans

- **Weights:** 600 (Semi-Bold), 700 (Bold), 800 (Extra-Bold)
- **Use for:** Logo wordmark, page headings, navigation, buttons, card titles
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&display=swap`

### Body Font: Source Sans 3

- **Weights:** 400 (Regular), 500 (Medium), 600 (Semi-Bold)
- **Use for:** Paragraphs, descriptions, form labels, captions, long-form content
- **Google Fonts:** `https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;500;600&display=swap`

### HTML Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
```

### CSS Setup

```css
body {
  font-family: 'Source Sans 3', sans-serif;
  font-weight: 400;
  color: #6B7A8D;
}

h1, h2, h3, h4, h5, h6, nav, .btn {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

### Type Scale

| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 | Plus Jakarta Sans | 800 | 36–48px |
| H2 | Plus Jakarta Sans | 700 | 28–32px |
| H3 | Plus Jakarta Sans | 700 | 20–24px |
| H4 | Plus Jakarta Sans | 600 | 16–18px |
| Body | Source Sans 3 | 400 | 16px |
| Small / Caption | Source Sans 3 | 500 | 13–14px |
| Button | Plus Jakarta Sans | 600 | 14–16px |
| Nav Link | Source Sans 3 | 500 | 14px |

---

## Why This System Works

- **Navy + Teal** establishes institutional credibility — essential for grant applications, CRA communications, and partner outreach.
- **Gold accent** preserves the warmth from the original brand and creates strong visual hierarchy for calls-to-action.
- **Plus Jakarta Sans** is geometric and modern without being cold — it works across the website, GitHub, and printed materials.
- **Source Sans 3** was designed by Adobe for screen readability, making it ideal for research publications and educational content.
- **The two-circle mark** is minimal enough to work as a 16px favicon yet distinctive enough to be memorable at larger sizes.
