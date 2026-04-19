---
trigger: always_on
---
# UI/UX Guidelines
Please Update this Rule everytime you've been asked to change anything frontend
## Color Scheme

### Primary Color Palette

| Name | Hex Code | Usage |
|------|----------|-------|
| **Muted Brown** | `#a68b6a` | Primary accent, CTAs, active states, category highlights |
| **Muted Brown Hover** | `#957a5c` | CTA hover states, interactive elements |
| **Muted Brown Light** | `#a68b6a/10` | Background highlights, active category states |

### Background Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| **Main Background** | `#fafafa` | Site-wide background - warm off-white |
| **Card Background** | `#ffffff` | Clean white for content cards |
| **Warm White** | `#fcfbf9` | Featured sections, subtle warmth |

### Text Colors

| Name | Tailwind Class | Usage |
|------|---------------|-------|
| **Primary Text** | `text-[#2c2c2c]` | Main content, headings |
| **Secondary Text** | `text-gray-900` | Alternative headings |
| **Muted Text** | `text-gray-600` | Descriptions, secondary info |
| **Light Text** | `text-gray-500` | Meta information |
| **Faded Text** | `text-gray-400` | Labels, categories |
| **White Text** | `text-white` | Hero overlays, dark backgrounds |
| **White Variants** | `text-white/80`, `text-white/75`, `text-white/60`, `text-white/50`, `text-white/40`, `text-white/30` | Layered content with varying opacity |

### Border & Divider Colors

| Name | Tailwind Class | Usage |
|------|---------------|-------|
| **Subtle Borders** | `border-black/5`, `border-black/10` | Card borders, section dividers |
| **Light Borders** | `border-white/20`, `border-white/30` | Glass morphism effects, overlays |
| **Gradient Dividers** | `bg-gradient-to-r from-transparent via-black/15 to-transparent` | Section separators |

### Shadow System

| Name | Tailwind Class | Usage |
|------|---------------|-------|
| **Card Rest** | `shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]` | Default card state |
| **Card Hover** | `shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)]` | Elevated card state |
| **Subtle Shadow** | `shadow-sm` | Light elevation for UI elements |

### Interactive States

| State | Tailwind Classes | Usage |
|-------|------------------|-------|
| **Hover Effects** | `hover:shadow-md`, `hover:-translate-y-3` | Card elevation on hover |
| **Active States** | `bg-[#a68b6a]/10` | Category selection, active elements |
| **Focus States** | `focus:border-white/50`, `focus:ring-1 focus:ring-white/30` | Form inputs, buttons |

### Usage Guidelines

- **Primary Color System**: Use `#a68b6a` as the main accent color throughout the site for consistency
- **Background Hierarchy**: `#fafafa` for main background, `#ffffff` for cards, `#fcfbf9` for featured sections
- **Text Hierarchy**: Use the defined text color scale for clear visual hierarchy
- **Glass Morphism**: Utilize `bg-white/10`, `backdrop-blur-sm/md` with `border-white/20` for overlay effects
- **Consistent Shadows**: Apply the shadow system for depth and elevation
- **Smooth Transitions**: Use `transition-all duration-300` for interactive elements

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

## Modal Patterns

### Confirmation Modal

For destructive actions like delete, use a modal instead of browser `confirm()`:

```tsx
{userToDelete ? (
  <div className="fixed inset-0 z-[60]">
    <div className="absolute inset-0 bg-black/40" onClick={() => setUserToDelete(null)} />
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/10">
          <div className="text-[14px] font-semibold text-[#2c2c2c]">Delete User</div>
          <div className="mt-1 text-[12px] text-black/55">
            Are you sure you want to delete this user? This action cannot be undone.
          </div>
        </div>
        <div className="px-5 py-4 bg-[#fafafa]">
          <div className="text-[13px] font-semibold text-[#2c2c2c]">{userToDelete.email}</div>
          <div className="mt-1 text-[11px] text-black/45">{userToDelete.id}</div>
        </div>
        <div className="px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2">
          <button
            type="button"
            disabled={!!deletingId}
            onClick={() => setUserToDelete(null)}
            className="h-9 px-4 rounded-[6px] border border-black/15 bg-white text-[12px] font-semibold text-black/70 hover:bg-black/[0.02] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!!deletingId}
            onClick={confirmDeleteUser}
            className="h-9 px-4 rounded-[6px] bg-red-600 text-white text-[12px] font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {deletingId ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  </div>
) : null}
```

### Modal Structure

| Element | Classes | Description |
|---------|---------|-------------|
| Overlay | `fixed inset-0 z-[60]` | Full-screen backdrop |
| Backdrop | `absolute inset-0 bg-black/40` | Semi-transparent dark overlay |
| Container | `absolute inset-0 flex items-center justify-center p-4` | Centers modal |
| Dialog | `w-full max-w-sm rounded-[6px] border border-black/20 bg-white shadow-xl` | Modal card |
| Header | `px-5 py-4 border-b border-black/10` | Title and description |
| Content | `px-5 py-4 bg-[#fafafa]` | Context/info area |
| Footer | `px-5 py-4 border-t border-black/10 flex items-center justify-end gap-2` | Action buttons |

### Usage Guidelines

- Always use modals for destructive actions (delete, remove, etc.)
- Show the affected item's details in the modal for confirmation
- Use `z-[60]` for modal overlay to ensure it appears above other content
- Include both Cancel and Confirm buttons
- Disable action button while processing
- Clicking backdrop should close the modal
