# Context

This website references swimming spot available in France. User can navigate using a map to find swimming spot,
and access details.

# Technical aspects

This site is build using Angular 19, Tailwind, Mapbox.
This site is deployed in SSR mode.

# Skills

When developing a feating on this site, make sure to

- Respect latest Angular coding recommendations (ie. usage of signals, standalone component, create service to
  extract logic out of component).
- When implementing a template, make sure to consider mobile and desktop considerations.
- When repeating code, make sure to suggest or/and implement a shared component, a pipe or a service to avoid this.
- Do not add comment in the code.
- Make sure to take SEO aspects into your approach.
- The Material Symbols font in `src/index.html` is subset via the `icon_names` query
  parameter. When using a new icon anywhere (template, TS config or landing-page data),
  add its name to that list (keep it alphabetically sorted), otherwise the icon renders
  as raw ligature text.
- Render swimming spot photos with the `appSpotImage` directive
  (`shared/ui/spot-image`) instead of binding `src` directly: it serves sized Wikimedia
  thumbnails with `srcset` and falls back to the original URL on error.
