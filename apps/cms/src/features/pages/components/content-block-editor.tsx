import { Activity, useEffect, useRef, useState } from "react";
import { MarkdownPlugin } from "@platejs/markdown";
import { MaximizeIcon, MinimizeIcon } from "lucide-react";
import { Plate, PlateContent } from "platejs/react";

import type { ContentBlock } from "@acme/convex/page-validators";
import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import type { ViewMode } from "../types";
import { useEditorPlugins } from "../hooks/use-editor-plugins";
import { EditorToolbar } from "./editor-toolbar";

const COLLAPSED_HEIGHT = "h-64";

function useContentBlockEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("wysiwyg");
  const [markdownSource, setMarkdownSource] = useState("");
  const [expanded, setExpanded] = useState(false);
  const onChangeRef = useRef(onChange);
  const blockRef = useRef(block);

  // eslint-disable-next-line no-restricted-syntax -- syncs prop to ref for imperative access in callbacks
  useEffect(() => {
    onChangeRef.current = onChange;
    blockRef.current = block;
  }, [onChange, block]);

  const editor = useEditorPlugins(block.data.body);

  function handleValueChange() {
    const markdown = editor.api.markdown.serialize();
    const current = blockRef.current;
    if (markdown !== current.data.body) {
      onChangeRef.current({
        ...current,
        data: { ...current.data, body: markdown },
      });
    }
  }

  function switchToMarkdown() {
    setMarkdownSource(editor.api.markdown.serialize());
    setViewMode("markdown");
  }

  function switchToWysiwyg() {
    const value = editor
      .getApi(MarkdownPlugin)
      .markdown.deserialize(markdownSource);
    editor.tf.setValue(value);
    onChangeRef.current({
      ...blockRef.current,
      data: { ...blockRef.current.data, body: markdownSource },
    });
    setViewMode("wysiwyg");
  }

  function handleMarkdownSourceChange(newSource: string) {
    setMarkdownSource(newSource);
    onChangeRef.current({
      ...blockRef.current,
      data: { ...blockRef.current.data, body: newSource },
    });
  }

  return {
    editor,
    viewMode,
    markdownSource,
    expanded,
    setExpanded,
    handleValueChange,
    switchToMarkdown,
    switchToWysiwyg,
    handleMarkdownSourceChange,
  };
}

export function ContentBlockEditor({
  block,
  onChange,
}: {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
}) {
  const {
    editor,
    viewMode,
    markdownSource,
    expanded,
    setExpanded,
    handleValueChange,
    switchToMarkdown,
    switchToWysiwyg,
    handleMarkdownSourceChange,
  } = useContentBlockEditor({ block, onChange });

  const isSourceMode = viewMode === "markdown";

  return (
    <EditorShell expanded={expanded} onCollapse={() => setExpanded(false)}>
      <Plate editor={editor} onValueChange={handleValueChange}>
        <EditorToolbar
          viewMode={viewMode}
          disabled={isSourceMode}
          onViewModeToggle={isSourceMode ? switchToWysiwyg : switchToMarkdown}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="rounded-md"
                    onClick={() => setExpanded(!expanded)}
                  />
                }
              >
                {expanded ? (
                  <MinimizeIcon className="size-3" />
                ) : (
                  <MaximizeIcon className="size-3" />
                )}
              </TooltipTrigger>
              <TooltipContent>
                {expanded ? "Exit fullscreen" : "Fullscreen"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </EditorToolbar>

        <Activity mode={isSourceMode ? "visible" : "hidden"}>
          <textarea
            value={markdownSource}
            onChange={(e) => handleMarkdownSourceChange(e.target.value)}
            placeholder="Write markdown..."
            className={`text-foreground placeholder:text-muted-foreground w-full overflow-y-auto bg-transparent p-4 font-mono text-sm leading-relaxed outline-none ${expanded ? "flex-1 resize-none" : `${COLLAPSED_HEIGHT} resize-y`}`}
          />
        </Activity>
        <Activity mode={isSourceMode ? "hidden" : "visible"}>
          <div
            className={`prose prose-neutral dark:prose-invert text-foreground/80 max-w-none overflow-y-auto leading-relaxed ${expanded ? "flex-1" : `${COLLAPSED_HEIGHT} resize-y`}`}
          >
            <PlateContent
              className="min-h-full w-full p-4 outline-none"
              placeholder="Start writing..."
            />
          </div>
        </Activity>
      </Plate>
    </EditorShell>
  );
}

function EditorShell({
  expanded,
  onCollapse,
  children,
}: {
  expanded: boolean;
  onCollapse: () => void;
  children: React.ReactNode;
}) {
  // eslint-disable-next-line no-restricted-syntax -- attaches a document-level keydown listener tied to fullscreen state
  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCollapse();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded, onCollapse]);

  return (
    <>
      {expanded && (
        <button
          type="button"
          aria-label="Exit fullscreen"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onCollapse}
        />
      )}
      <div
        className={
          expanded
            ? "bg-background fixed top-[5vh] left-1/2 z-50 flex h-[90vh] w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 flex-col overflow-hidden rounded-xl pt-0.5 shadow-xl"
            : "flex flex-col"
        }
      >
        {children}
      </div>
    </>
  );
}
