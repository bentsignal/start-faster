## Custom Components

- When navigating between pages internally, use the `QuickLink` component from `@acme/features/quick-link`. Its API is nearly identical to that of the official TanStack Router `Link` component, it just has some optimizations added on top.
- When creating an image in an app, use the app's `~/components/image` wrapper. Each web app exposes one, and it is backed by the shared optimized image implementation rather than a raw `<img>`.
