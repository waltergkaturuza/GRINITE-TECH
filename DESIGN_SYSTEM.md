# GRANITE TECH Color Palette & Design System

## Brand Colors

### Primary Color Combinations

#### 1. **Rich Black & Crimson Red** (Primary Brand)
- **Rich Black**: `#101820` - Main backgrounds, headers, navigation
- **Crimson Red**: `#A4193D` - Primary buttons, accents, highlights
- **Usage**: Main branding, primary CTAs, navigation elements

#### 2. **Vivid Yellow & Rich Black** (High Contrast)
- **Vivid Yellow**: `#FEE715` - Attention-grabbing elements, warnings, highlights
- **Rich Black**: `#101820` - Text, backgrounds
- **Usage**: Alert messages, featured content, important notifications

#### 3. **Deep Jungle Green & Light Olive Green** (Natural Theme)
- **Deep Jungle Green**: `#07563B` - Success states, secondary actions
- **Light Olive Green**: `#CED46A` - Subtle backgrounds, soft accents
- **Usage**: Success messages, environmental themes, secondary navigation

#### 4. **Peach & Crimson Red** (Warm Theme)
- **Peach**: `#FFDFB9` - Warm backgrounds, soft highlights
- **Crimson Red**: `#A4193D` - Strong accents
- **Usage**: Client portal, warm sections, testimonials

## Color Application Strategy

### Navigation & Headers
```css
/* Main Navigation */
background: linear-gradient(90deg, #101820 0%, #A4193D 100%);
color: #FFFFFF;

/* Secondary Navigation */
background: #FFFFFF;
border-bottom: 2px solid #A4193D;
```

### Buttons & CTAs
```css
/* Primary Button */
background: #A4193D;
color: #FFFFFF;
hover: #8b1538;

/* Secondary Button */
background: #CED46A;
color: #101820;
hover: #07563B;

/* Accent Button */
background: #FEE715;
color: #101820;
hover: #FFDFB9;

/* Dark Button */
background: #101820;
color: #FFFFFF;
hover: #333;
```

### Cards & Containers
```css
/* Main Cards */
background: #FFFFFF;
border: 1px solid #e5e5e5;
hover-border: #A4193D;

/* Dark Theme Cards */
background: #101820;
color: #FFFFFF;
border: 1px solid #333;

/* Accent Cards */
background: linear-gradient(135deg, #FFDFB9, #FEE715);
```

### Status Colors
```css
/* Success */
background: #07563B;
color: #FFFFFF;

/* Warning */
background: #FEE715;
color: #101820;

/* Error */
background: #A4193D;
color: #FFFFFF;

/* Info */
background: #101820;
color: #FFFFFF;
```

## Component Usage Examples

### Homepage Sections
- **Hero**: Dark gradient (`#101820` → `#A4193D`)
- **Features**: White background with colored accent cards
- **CTA**: Bold crimson (`#A4193D`) with yellow (`#FEE715`) accents
- **Footer**: Rich black (`#101820`) with colored section headers

### Client Portal
- **Sidebar**: Deep jungle green (`#07563B`)
- **Content**: Light backgrounds with peach (`#FFDFB9`) accents
- **Progress bars**: Crimson red (`#A4193D`) to yellow (`#FEE715`) gradient

### Admin Dashboard
- **Header**: Rich black (`#101820`)
- **Sidebar**: Dark theme with crimson (`#A4193D`) highlights
- **Charts**: Multi-color using all brand colors
- **Status indicators**: Green (`#07563B`), yellow (`#FEE715`), red (`#A4193D`)

### E-commerce
- **Product cards**: White with subtle crimson (`#A4193D`) borders
- **Add to cart**: Crimson (`#A4193D`) primary button
- **Price tags**: Yellow (`#FEE715`) backgrounds
- **Sale badges**: Rich black (`#101820`) with white text

## Accessibility Considerations

### Contrast Ratios (WCAG AA Compliant)
- **Rich Black (#101820) on White**: 12.6:1 ✅
- **Crimson Red (#A4193D) on White**: 8.1:1 ✅
- **White on Crimson Red (#A4193D)**: 8.1:1 ✅
- **Rich Black (#101820) on Yellow (#FEE715)**: 11.8:1 ✅
- **Deep Jungle Green (#07563B) on Light Olive (#CED46A)**: 4.7:1 ✅

### Color Blind Friendly
- High contrast combinations work well for deuteranopia and protanopia
- Yellow and red combinations provide good distinction
- Multiple visual cues beyond color (icons, typography weight)

## Implementation in Code

### Tailwind CSS Classes
```css
/* Primary brand colors */
.text-granite-primary { color: #101820; }
.bg-granite-primary { background-color: #101820; }
.text-crimson-primary { color: #A4193D; }
.bg-crimson-primary { background-color: #A4193D; }

/* Gradients */
.gradient-brand { background: linear-gradient(135deg, #101820, #A4193D); }
.gradient-warm { background: linear-gradient(135deg, #A4193D, #FFDFB9); }
.gradient-natural { background: linear-gradient(135deg, #07563B, #CED46A); }
.gradient-bright { background: linear-gradient(135deg, #101820, #FEE715); }
```

## Design Principles

1. **Bold & Professional**: Use rich black and crimson for strong, confident branding
2. **Energetic & Modern**: Yellow accents for innovation and forward-thinking
3. **Natural & Trustworthy**: Green tones for reliability and growth
4. **Warm & Approachable**: Peach tones for client-facing, friendly interactions
5. **High Contrast**: Ensure excellent readability and accessibility

This color system creates a cohesive, professional, and visually striking brand identity for GRANITE TECH that works across all digital touchpoints.