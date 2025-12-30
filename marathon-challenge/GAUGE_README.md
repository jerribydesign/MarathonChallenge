# Radial Gauge Component

## Overview

A reusable circular progress gauge / speedometer-style visualization component built with SVG. Perfect for displaying metrics, progress, and scores in a visually appealing way.

## Features

- **Speedometer-style design**: 270-degree arc (bottom-left to bottom-right)
- **Animated transitions**: Smooth value changes with configurable animation
- **Color zones**: Define multiple color ranges for different value thresholds
- **Customizable**: Size, colors, labels, stroke width, and more
- **Dark mode support**: Automatically adapts to dark theme
- **Needle indicator**: Visual pointer showing current value
- **Center value display**: Shows numeric value in the center

## Usage

### Basic Example

```tsx
import RadialGauge from '@/components/RadialGauge';

<RadialGauge
  value={75}
  label="Progress"
  subtitle="75% complete"
  size={200}
/>
```

### With Color Zones

```tsx
<RadialGauge
  value={65}
  label="Consistency Load"
  subtitle="Repeatability score"
  size={180}
  strokeWidth={14}
  zones={[
    { min: 0, max: 40, color: '#f59e0b' }, // Amber
    { min: 40, max: 70, color: '#10b981' }, // Green
    { min: 70, max: 100, color: '#3b82f6' }, // Blue
  ]}
  animated={true}
/>
```

### Custom Range

```tsx
<RadialGauge
  value={26.2}
  label="Miles"
  min={0}
  max={26.2}
  size={160}
  color="#4f46e5"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | **required** | Current value (0-100 or custom range) |
| `label` | `string` | `undefined` | Main label text below gauge |
| `subtitle` | `string` | `undefined` | Subtitle text below label |
| `size` | `number` | `200` | Diameter of the gauge in pixels |
| `strokeWidth` | `number` | `16` | Width of the arc stroke |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `color` | `string` | `'#4f46e5'` | Default color (used if no zones) |
| `backgroundColor` | `string` | `'#e5e7eb'` | Background arc color |
| `showValue` | `boolean` | `true` | Show numeric value in center |
| `animated` | `boolean` | `true` | Animate value changes |
| `zones` | `Array<Zone>` | `[]` | Color zones for different ranges |

### Zone Type

```typescript
interface Zone {
  min: number;
  max: number;
  color: string;
}
```

## Current Implementations

### 1. Balance Dashboard (`/balance`)

Three gauges showing current week's metrics:

- **Consistency Load**: Shows repeatability score (0-100)
  - Zones: Hold (0-40, amber), Likely (40-70, green), Stretch (70-100, blue)
  
- **Pace Stress**: Shows intensity relative to baseline (0-100)
  - Zones: Low (0-40, green), Moderate (40-70, amber), High (70-100, red)
  
- **Balance Score**: Overall training balance (average of consistency and inverse stress)
  - Zones: Needs work (0-50, amber), Good (50-75, green), Excellent (75-100, blue)

### 2. Progress Card (`/dashboard`)

Single gauge showing progress toward monthly goal (26.2 miles):

- **Progress**: Percentage complete (0-100%)
  - Zones: Red (0-50%), Amber (50-75%), Green (75-100%)
  - Shows miles completed / goal in subtitle

## Design Details

- **Arc span**: 270 degrees (from -135° to +135°)
- **Needle**: Rotates to point at current value
- **Center dot**: Colored circle with white center
- **Transitions**: Smooth 1-second animation for value changes
- **Responsive**: Adapts to container size

## Styling

The component uses Tailwind CSS classes and supports dark mode automatically. Colors can be customized via props or zones.

## Examples in Codebase

- `/components/BalanceDashboard.tsx` - Three gauges for balance metrics
- `/components/ProgressCard.tsx` - Single gauge for progress tracking
- `/components/RadialGauge.tsx` - Component implementation

## Future Enhancements

Potential additions:
- Custom start/end angles (not just 270°)
- Multiple needles (for min/max ranges)
- Gradient fills
- Tick marks and labels on the arc
- Custom needle shapes
