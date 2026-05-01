NEW_WT="$PWD"
MAIN_REPO="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir 2>/dev/null)")"
if [ -n "$MAIN_REPO" ] && [ "$MAIN_REPO" != "$NEW_WT" ]; then
  cd "$MAIN_REPO"
  for f in $(find . \( -name ".env" -o -name ".env.local" \) -not -path "*/node_modules/*" -not -path "*/.git/*"); do
    rel="${f#./}"
    dest="$NEW_WT/$rel"
    mkdir -p "$(dirname "$dest")"
    cp "$f" "$dest"
    echo "copied $rel"
  done
  cd "$NEW_WT"
fi
ni
pnpm --filter @acme/files run topo

# Create a worktree-specific Convex deployment
WT_NAME="$(basename "$NEW_WT" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/^-*//;s/-*$//')"

cd "$NEW_WT/packages/convex"
nlx convex deployment create "dev/$WT_NAME" --select --expiration "in 7 days" --type dev < /dev/null
nlx convex deployment token create "$WT_NAME" --save-env < /dev/null
cd "$NEW_WT"

# Update root .env with the new deployment's URL
NEW_URL="$(grep '^CONVEX_URL=' packages/convex/.env.local | cut -d= -f2-)"
if [ -z "$NEW_URL" ]; then
  echo "Could not find CONVEX_URL in packages/convex/.env.local" >&2
else
  sed -i '' "s|^VITE_CONVEX_URL=.*|VITE_CONVEX_URL=$NEW_URL|" .env
  echo "updated VITE_CONVEX_URL to $NEW_URL"
fi

nr dev
