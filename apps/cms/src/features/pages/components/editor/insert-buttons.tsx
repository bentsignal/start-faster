import { CodeIcon, LinkIcon, MinusIcon, QuoteIcon } from "lucide-react";
import { KEYS } from "platejs";
import { useEditorRef, useEditorSelector } from "platejs/react";

import { ToolbarButton } from "./toolbar-button";

export function InsertButtons({ disabled }: { disabled?: boolean }) {
  const editor = useEditorRef();

  const blockType = useEditorSelector((ed) => {
    const entry = ed.api.block();
    return entry?.[0]?.type;
  }, []);

  return (
    <>
      <ToolbarButton
        active={blockType === KEYS.blockquote}
        disabled={disabled}
        tooltip="Blockquote"
        onClick={() => {
          editor.tf.toggleBlock(KEYS.blockquote);
          editor.tf.focus();
        }}
      >
        <QuoteIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        active={blockType === KEYS.codeBlock}
        disabled={disabled}
        tooltip="Code block"
        onClick={() => {
          editor.tf.toggleBlock(KEYS.codeBlock);
          editor.tf.focus();
        }}
      >
        <CodeIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        disabled={disabled}
        tooltip="Link"
        onClick={() => {
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.tf.wrapNodes(
              { type: KEYS.link, url, children: [] },
              { split: true },
            );
          }
          editor.tf.focus();
        }}
      >
        <LinkIcon className="size-3.5" />
      </ToolbarButton>
      <ToolbarButton
        disabled={disabled}
        tooltip="Horizontal rule"
        onClick={() => {
          editor.tf.insertNodes({
            type: KEYS.hr,
            children: [{ text: "" }],
          });
          editor.tf.focus();
        }}
      >
        <MinusIcon className="size-3.5" />
      </ToolbarButton>
    </>
  );
}
