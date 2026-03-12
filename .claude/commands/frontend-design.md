# Frontend Design Review

Review the Vue components and CSS in this project for the following and fix any issues found:

1. **Responsive design** — check for layouts that break or look poor on mobile (< 840px). Look for hardcoded widths, overflow issues, or elements that need media query adjustments.

2. **Consistency** — check that spacing, font sizes, font weights, border-radius, and colors use the existing CSS custom properties (e.g. `var(--accent)`, `var(--text)`, `var(--border)`, `var(--radius-sm)`) rather than hardcoded values.

3. **Contrast & readability** — flag any text that has poor contrast against its background. Check both light and dark surfaces.

4. **Dead CSS** — identify classes defined in `src/styles.css` that are no longer referenced in any `.vue` file and remove them.

5. **Component structure** — flag any inline styles in `.vue` files that should be moved to `src/styles.css`.

Focus on `src/styles.css` and all files in `src/views/` and `src/components/`. Report findings grouped by category, then apply fixes.
