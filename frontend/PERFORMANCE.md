# Performance Monitoring — #323

## Overview

Core Web Vitals tracking and a dev-mode dashboard for the Tossd frontend.

## Files

| File | Purpose |
|------|---------|
| `perf/vitals.ts` | Observes LCP, FID, INP, CLS, FCP, TTFB via PerformanceObserver |
| `perf/PerformanceDashboard.tsx` | Dev-only overlay showing live metric values |

## Integration

Call once at your app entry point (e.g. `index.tsx` or `_app.tsx`):

```ts
import { initPerformanceMonitoring } from "./perf/vitals";
initPerformanceMonitoring();
```

Mount the dashboard in development:

```tsx
import { PerformanceDashboard } from "./perf/PerformanceDashboard";
// Inside your root component:
<PerformanceDashboard />
```

## Metrics & Thresholds

| Metric | Good    | Needs Improvement | Poor    |
|--------|---------|-------------------|---------|
| LCP    | ≤2500ms | ≤4000ms           | >4000ms |
| FID    | ≤100ms  | ≤300ms            | >300ms  |
| INP    | ≤200ms  | ≤500ms            | >500ms  |
| CLS    | ≤0.1    | ≤0.25             | >0.25   |
| FCP    | ≤1800ms | ≤3000ms           | >3000ms |
| TTFB   | ≤800ms  | ≤1800ms           | >1800ms |

## Production Reporting

In production, metrics are sent via `navigator.sendBeacon` to `/api/vitals`.
Replace that endpoint with your real analytics sink (e.g. Datadog, Grafana, custom).

## Bundle Size Tracking

Add to your build script:

```bash
# After build, print asset sizes
find dist -name "*.js" -o -name "*.css" | xargs wc -c | sort -n
```

Or use `bundlesize` / `size-limit` for CI enforcement:

```bash
npm install --save-dev size-limit @size-limit/file
```

```json
// package.json
"size-limit": [
  { "path": "dist/**/*.js", "limit": "150 kB" },
  { "path": "dist/**/*.css", "limit": "20 kB" }
]
```

## Lazy Loading Routes

Use dynamic imports to split bundles per route:

```tsx
const GamePage = React.lazy(() => import("./pages/GamePage"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));

<Suspense fallback={<div>Loading…</div>}>
  <Routes>
    <Route path="/game" element={<GamePage />} />
    <Route path="/admin" element={<AdminPage />} />
  </Routes>
</Suspense>
```

## Image Optimization

- Use `width` + `height` attributes on all `<img>` to prevent layout shift (CLS).
- Add `loading="lazy"` to below-the-fold images.
- Serve WebP/AVIF via `<picture>` with PNG fallback.
- Use `fetchpriority="high"` on the hero image.

## Lighthouse

```bash
npx lighthouse https://your-staging-url --output html --output-path ./lighthouse-report.html
```

Target scores: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90.
