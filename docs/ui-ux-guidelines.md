# UI/UX Guidelines

## Color Scheme

### Background Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Cream White | `#fafafa` | Main page background - warm off-white |
| Warm White | `#fcfbf9` | Card backgrounds, featured sections |

### Primary Accent Color

| Name | Hex Code | Usage |
|------|----------|-------|
| Muted Brown Background | `#a68b6a` | Hero section buttons (Discover vendors, Search) - background with white text |
| Muted Brown Hover | `#957a5c` | Hero section buttons hover state |

### Usage

- The cream white background provides a warm, inviting feel while maintaining a clean white appearance
- Muted brown is used for call-to-action buttons to maintain a cohesive earth-toned aesthetic

## Typography

### Font Selection (Hybrid System)

| Role | Font | Weights | Usage |
|------|------|---------|-------|
| Headlines | Noto Serif | 400, 500, 600, 700 | Page titles, section headings, hero text |
| Body | Plus Jakarta Sans | 400, 500, 600 | Paragraphs, descriptions, content text |
| Labels/UI | Plus Jakarta Sans | 500, 600 | Buttons, navigation, small UI elements, captions |

### Usage Guidelines

- **Headlines**: Use Noto Serif for all major headings to convey elegance and sophistication
- **Body text**: Use Plus Jakarta Sans for readable, clean paragraph text
- **Labels**: Use Plus Jakarta Sans at 500-600 weight for buttons, nav items, and small UI text
- The serif/sans-serif pairing creates visual hierarchy while maintaining cohesion with the warm earth-toned palette

## Card Styling

### Base Card Properties

| Property | Value | Usage |
|----------|-------|-------|
| Border Radius | `12px` | All card containers - provides modern, friendly appearance |
| Border | `1px solid rgba(0,0,0,0.06)` | Subtle border for definition without harshness |
| Background | `#ffffff` | Clean white background for content |
| Shadow (rest) | `0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)` | Subtle shadow for depth |
| Shadow (hover) | `0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)` | Elevated shadow on interaction |
| Transition | `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)` | Smooth, natural motion |

### Card Structure

- **Cover Image Area**: Full-width top section with aspect ratio ~16:9 or 3:2
- **Logo Badge**: Overlapping position at bottom-left of cover, circular or rounded-square
- **Content Padding**: `16px` (p-4) internal padding
- **Content Spacing**: 8px between major elements

### Interactive States

- **Default**: Base shadow, rest state
- **Hover**: Elevated shadow, slight scale (1.01-1.02), cursor pointer
- **Focus**: Visible focus ring for accessibility
- **Active**: Slight scale down (0.98-0.99)

### Usage Guidelines

- Cards should have consistent border radius across the application
- Use subtle shadows rather than heavy ones for elegance
- Ensure adequate touch targets (minimum 44px) for interactive elements
- Maintain visual hierarchy with typography weight and size
- Logo badges should overlap the cover/content boundary for depth
