# Agent Instructions

## CSS Structure and Ordering Rule
When writing or modifying CSS in components (e.g., Astro files), always structure and group the styles in the following logical order, separated by clear comments:

1. **General CSS (`CSS GENERAL`)**: All base, mobile-first styles without media queries.
2. **Desktop Breakpoints (`BREAKPOINT 850px` or similar)**: The `@media (min-width: ...)` rules, grouping all layout adjustments for larger screens.
3. **Mobile Specific Breakpoints (`BREAKPOINT 360px` or similar)**: The `@media (max-width: ...)` rules for edge-case styling on very small screens.

### Example Structure:
```css
<style>
  /* =========================================
     CSS GENERAL
     ========================================= */
  .my-class {
    display: flex;
    ...
  }

  /* =========================================
     BREAKPOINT 850px
     ========================================= */
  @media (min-width: 850px) {
    .my-class {
      display: grid;
      ...
    }
  }

  /* =========================================
     BREAKPOINT 360px
     ========================================= */
  @media (max-width: 360px) {
    .my-class {
      padding-right: 16px;
    }
  }
</style>
```
