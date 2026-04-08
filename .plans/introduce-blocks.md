# Page Blocks System — Implementation Plan

## Context

Custom pages currently have a single `content: v.string()` field on `pageDrafts` and `pageReleases`, rendered as a plain textarea in the CMS and whitespace-pre-wrap text in the shop. We're replacing this with a **blocks system** — an ordered array of typed, discriminated-union blocks that can be extended with new block types over time. Starting with a "content" block type (plain text for now, MDX later).

Blocks are stored as `blocks: v.array(blockValidator)` directly on the draft/release documents (not a separate table). The Convex validators are the single source of truth for block types; TypeScript types are inferred from them.

---

## Phase 1: Block Validators & Types

**New file: `packages/convex/src/pages/validators.ts`**

Define validators once, infer TypeScript types from them using `Infer` (same pattern as `validators.ts`):

```ts
import type { Infer } from "convex/values";
import { v } from "convex/values";

export const contentBlockValidator = v.object({
  type: v.literal("content"),
  id: v.string(),  // client-generated (crypto.randomUUID)
  data: v.object({ body: v.string() }),
});
export type ContentBlock = Infer<typeof contentBlockValidator>;

// Union of all block types — add new variants here
export const blockValidator = v.union(contentBlockValidator);
export type Block = Infer<typeof blockValidator>;
```

**Update: `packages/convex/package.json`** — add export `"./page-validators": "./src/pages/validators.ts"`

---

## Phase 2: Schema Changes

**File: `packages/convex/src/schema.ts`**

- Import `blockValidator` from `./pages/validators`
- Replace `content: v.string()` with `blocks: v.array(blockValidator)` on both `pageDrafts` and `pageReleases`
- No migration needed — project has no deployed data

---

## Phase 3: Convex Mutation/Query Changes

**File: `packages/convex/src/pages/drafts.ts`**

- `save`: args change from `content: v.string()` to `blocks: v.array(blockValidator)`. Patches `blocks` + `updatedAt`.
- `createNew`: initial value changes from `content = ""` to `blocks = []`. Source copy uses `.blocks`.
- `getPreview`: returns `{ title, blocks }` instead of `{ title, content }`.

**File: `packages/convex/src/pages/manage.ts`**

- `create`: initial draft insert uses `blocks: []` instead of `content: ""`.
- `publish`: copies `blocks: draft.blocks`. Validation changes from `!draft.content.trim()` to `draft.blocks.length === 0`.
- `getByPath`: returns `{ title, path, blocks }` instead of `{ title, path, content }`.

---

## Phase 4: CMS Autosave Changes

**File: `apps/cms/src/features/pages/hooks/use-autosave.ts`**

- Accept `blocks: Block[]` instead of `content: string`
- Dirty detection: compare `JSON.stringify(blocks)` against last saved serialized value
- Mutation call sends `{ draftId, blocks }` instead of `{ draftId, content }`
- Same 800ms debounce, navigation blocking, and flush-on-unmount patterns

---

## Phase 5: CMS Block Editor UI

**File: `apps/cms/src/app/_authenticated/_authorized/pages.$pageId.draft.$draftId.tsx`**

- `useDraftEditor` manages `blocks: Block[]` state instead of `content: string`
- Replace `<textarea>` with `<BlockList blocks={blocks} onChange={setBlocks} />`

**New CMS components** (all in `apps/cms/src/features/pages/components/`):

| Component | Purpose |
|-----------|---------|
| `block-list.tsx` | Renders ordered list of blocks with drag-to-reorder (dnd-kit), add buttons between/below blocks |
| `block-wrapper.tsx` | Shared wrapper: drag handle (top-left), type label, delete button with confirmation (top-right) |
| `block-editor.tsx` | Switch on `block.type` → renders the correct editor component |
| `content-block-editor.tsx` | Textarea editing `block.data.body` for the content block type |
| `add-block-button.tsx` | "+" button that opens a popover listing available block types; inserts at the given index |

**Block operations** (in `block-list.tsx` or a helper):
- **Add**: insert new block at index, `onChange([...before, newBlock, ...after])`
- **Delete**: filter by id with confirmation dialog
- **Reorder**: dnd-kit `onDragEnd` → `arrayMove` → `onChange(reordered)`
- **Update**: map over array replacing the matching block by `id`

**Dependencies to add to `apps/cms`**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

---

## Phase 6: Shop Rendering Changes

**File: `apps/shop/src/app/$.tsx`**

- Both `RouteComponent` and `LiveDraftPreview` render `<BlockRenderer blocks={blocks} />` instead of the `<p>` tag
- Query selects change from `content` to `blocks`

**New shop components** (in `apps/shop/src/features/pages/components/`):

| Component | Purpose |
|-----------|---------|
| `block-renderer.tsx` | Iterates blocks, switches on type, renders the correct view component |
| `content-block-view.tsx` | Renders `block.data.body` with whitespace-pre-wrap (plain text for now) |

---

## Verification

1. `pnpm run lint` — passes
2. `pnpm run typecheck` — passes (block types inferred correctly across packages)
3. `pnpm run test` — passes
4. Manual: CMS draft editor shows block list, can add/remove/reorder content blocks, autosave works
5. Manual: Shop renders blocks correctly for both published pages and draft previews
6. `pnpm run format:fix`

---

## Key Files Summary

| File | Action |
|------|--------|
| `packages/convex/src/pages/validators.ts` | **New** — block validators + exported types |
| `packages/convex/package.json` | **Edit** — add `./page-validators` export |
| `packages/convex/src/schema.ts` | **Edit** — `content` → `blocks` |
| `packages/convex/src/pages/drafts.ts` | **Edit** — mutations/queries use blocks |
| `packages/convex/src/pages/manage.ts` | **Edit** — create/publish/getByPath use blocks |
| `apps/cms/src/features/pages/hooks/use-autosave.ts` | **Edit** — blocks-aware save |
| `apps/cms/src/features/pages/hooks/use-page-mutations.ts` | **Edit** — saveDraft mutation shape |
| `apps/cms/src/app/...pages.$pageId.draft.$draftId.tsx` | **Edit** — block editor replaces textarea |
| `apps/cms/src/features/pages/components/block-list.tsx` | **New** — block list with dnd |
| `apps/cms/src/features/pages/components/block-wrapper.tsx` | **New** — shared block chrome |
| `apps/cms/src/features/pages/components/block-editor.tsx` | **New** — type switch |
| `apps/cms/src/features/pages/components/content-block-editor.tsx` | **New** — content block textarea |
| `apps/cms/src/features/pages/components/add-block-button.tsx` | **New** — block type picker |
| `apps/shop/src/app/$.tsx` | **Edit** — use BlockRenderer |
| `apps/shop/src/features/pages/components/block-renderer.tsx` | **New** — block rendering switch |
| `apps/shop/src/features/pages/components/content-block-view.tsx` | **New** — content block view |
