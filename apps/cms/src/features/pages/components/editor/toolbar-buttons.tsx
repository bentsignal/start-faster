import { useState } from "react";
import { toggleBulletedList, toggleNumberedList } from "@platejs/list-classic";
import {
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  Heading5Icon,
  Heading6Icon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";

import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui/utils";

import { ToolbarButton } from "./toolbar-button";

const MARK_BUTTON_CONFIG = [
  { key: "bold", tooltip: "Bold (Cmd+B)", icon: BoldIcon },
  { key: "italic", tooltip: "Italic (Cmd+I)", icon: ItalicIcon },
  { key: "underline", tooltip: "Underline (Cmd+U)", icon: UnderlineIcon },
  { key: "strikethrough", tooltip: "Strikethrough", icon: StrikethroughIcon },
  { key: "code", tooltip: "Inline code", icon: CodeIcon },
] as const;

const BLOCK_TYPES = [
  { type: KEYS.p, label: "Paragraph", icon: PilcrowIcon },
  { type: KEYS.h1, label: "Heading 1", icon: Heading1Icon },
  { type: KEYS.h2, label: "Heading 2", icon: Heading2Icon },
  { type: KEYS.h3, label: "Heading 3", icon: Heading3Icon },
  { type: KEYS.h4, label: "Heading 4", icon: Heading4Icon },
  { type: KEYS.h5, label: "Heading 5", icon: Heading5Icon },
  { type: KEYS.h6, label: "Heading 6", icon: Heading6Icon },
] as const;

export function BlockTypeSelector({ disabled }: { disabled?: boolean }) {
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);

  const activeType = useEditorSelector((ed) => {
    const entry = ed.api.block();
    return entry?.[0]?.type ?? KEYS.p;
  }, []);

  const activeBlock = BLOCK_TYPES.find((b) => b.type === activeType);
  const ActiveIcon = activeBlock?.icon ?? PilcrowIcon;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="xs"
        disabled={disabled}
        className="gap-1 rounded-md"
        onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        <ActiveIcon className="size-3.5" />
        <span className="text-xs">{activeBlock?.label ?? "Paragraph"}</span>
        <ChevronDownIcon className="size-3" />
      </Button>
      {open && (
        <>
          {/* Backdrop to close on outside click without stealing editor focus */}
          <div
            className="fixed inset-0 z-40"
            onMouseDown={(e) => {
              e.preventDefault();
              setOpen(false);
            }}
          />
          <div
            className="bg-popover text-popover-foreground ring-foreground/5 dark:ring-foreground/10 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 absolute top-full left-0 z-50 mt-1 min-w-48 origin-top-left overflow-hidden rounded-2xl p-1 shadow-2xl ring-1 duration-100"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          >
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                type="button"
                className={cn(
                  "hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2.5 rounded-xl px-3 py-2 text-sm outline-hidden select-none",
                  activeType === type && "bg-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  const entry = editor.api.block();
                  if (entry) {
                    if (type === activeType) {
                      editor.tf.setNodes({ type: KEYS.p }, { at: entry[1] });
                    } else {
                      editor.tf.setNodes({ type }, { at: entry[1] });
                    }
                  }
                  editor.tf.focus();
                  setOpen(false);
                }}
              >
                <Icon className="size-4" />
                {label}
                {activeType === type && (
                  <CheckIcon className="ml-auto size-3.5" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function MarkButtons({ disabled }: { disabled?: boolean }) {
  const editor = useEditorRef();

  const marks = useEditorSelector((ed) => {
    const m = ed.api.marks();
    return {
      bold: !!m?.bold,
      italic: !!m?.italic,
      underline: !!m?.underline,
      strikethrough: !!m?.strikethrough,
      code: !!m?.code,
    };
  }, []);

  return (
    <>
      {MARK_BUTTON_CONFIG.map(({ key, tooltip, icon: Icon }) => (
        <ToolbarButton
          key={key}
          active={marks[key]}
          disabled={disabled}
          tooltip={tooltip}
          onClick={() => {
            editor.tf.toggleMark(key);
            editor.tf.focus();
          }}
        >
          <Icon className="size-3.5" />
        </ToolbarButton>
      ))}
    </>
  );
}

export function ListButtons({ disabled }: { disabled?: boolean }) {
  const editor = useEditorRef();

  const listState = useEditorSelector((ed) => {
    const block = ed.api.block();
    const parent = block ? ed.api.parent(block[1]) : null;
    const parentType = parent?.[0]?.type;
    return {
      bulleted: parentType === KEYS.ul,
      numbered: parentType === KEYS.ol,
    };
  }, []);

  return (
    <>
      <ToolbarButton
        active={listState.bulleted}
        disabled={disabled}
        tooltip="Bulleted list"
        onClick={() => {
          toggleBulletedList(editor);
          editor.tf.focus();
        }}
      >
        <ListIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={listState.numbered}
        disabled={disabled}
        tooltip="Numbered list"
        onClick={() => {
          toggleNumberedList(editor);
          editor.tf.focus();
        }}
      >
        <ListOrderedIcon className="size-3.5" />
      </ToolbarButton>
    </>
  );
}
