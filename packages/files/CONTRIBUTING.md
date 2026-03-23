# Developing guide

## Running locally

```sh
pnpm install
pnpm run dev
```

`pnpm run dev` watches and rebuilds the package only.
Use a consuming app in this monorepo to exercise the package during manual
testing.

## Testing

```sh
pnpm install --frozen-lockfile
pnpm run clean
pnpm run typecheck
pnpm run lint
pnpm run test
```
