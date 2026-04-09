import { AutoformatPlugin } from "@platejs/autoformat";
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@platejs/basic-nodes/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@platejs/code-block/react";
import { LinkPlugin } from "@platejs/link/react";
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
} from "@platejs/list-classic/react";
import { MarkdownPlugin } from "@platejs/markdown";
import { KEYS } from "platejs";
import { ParagraphPlugin, usePlateEditor } from "platejs/react";
import remarkGfm from "remark-gfm";
import remarkMdx from "remark-mdx";

import {
  BlockquoteElement,
  BulletedListElement,
  CodeBlockElement,
  CodeLineElement,
  H1Element,
  H2Element,
  H3Element,
  H4Element,
  H5Element,
  H6Element,
  LinkElement,
  ListItemElement,
  NumberedListElement,
  ParagraphElement,
} from "~/features/pages/components/editor/element-nodes";
import { HrElement } from "../components/editor/hr-node";

const HEADING_PLUGINS = [
  { plugin: H1Plugin, component: H1Element, key: "1" },
  { plugin: H2Plugin, component: H2Element, key: "2" },
  { plugin: H3Plugin, component: H3Element, key: "3" },
  { plugin: H4Plugin, component: H4Element, key: "4" },
  { plugin: H5Plugin, component: H5Element, key: "5" },
  { plugin: H6Plugin, component: H6Element, key: "6" },
] as const;

const autoformatRules = [
  { match: "# ", mode: "block" as const, type: KEYS.h1 },
  { match: "## ", mode: "block" as const, type: KEYS.h2 },
  { match: "### ", mode: "block" as const, type: KEYS.h3 },
  { match: "#### ", mode: "block" as const, type: KEYS.h4 },
  { match: "##### ", mode: "block" as const, type: KEYS.h5 },
  { match: "###### ", mode: "block" as const, type: KEYS.h6 },
  { match: "> ", mode: "block" as const, type: KEYS.blockquote },
  { match: "***", mode: "mark" as const, type: [KEYS.bold, KEYS.italic] },
  { match: "**", mode: "mark" as const, type: KEYS.bold },
  { match: "*", mode: "mark" as const, type: KEYS.italic },
  { match: "~~", mode: "mark" as const, type: KEYS.strikethrough },
  { match: "`", mode: "mark" as const, type: KEYS.code },
];

export function useEditorPlugins(initialBody: string) {
  return usePlateEditor({
    plugins: [
      ParagraphPlugin.withComponent(ParagraphElement),
      ...HEADING_PLUGINS.map(({ plugin, component, key }) =>
        plugin.configure({
          node: { component },
          rules: { break: { empty: "reset" } },
          shortcuts: { toggle: { keys: `mod+alt+${key}` } },
        }),
      ),
      BlockquotePlugin.configure({
        node: { component: BlockquoteElement },
        shortcuts: { toggle: { keys: "mod+shift+period" } },
      }),
      HorizontalRulePlugin.withComponent(HrElement),
      CodeBlockPlugin.withComponent(CodeBlockElement),
      CodeLinePlugin.withComponent(CodeLineElement),
      CodeSyntaxPlugin,
      ListPlugin,
      ListItemPlugin.withComponent(ListItemElement),
      ListItemContentPlugin,
      BulletedListPlugin.configure({
        node: { component: BulletedListElement },
      }),
      NumberedListPlugin.configure({
        node: { component: NumberedListElement },
      }),
      LinkPlugin.configure({ render: { node: LinkElement } }),
      BoldPlugin.configure({ shortcuts: { toggle: { keys: "mod+b" } } }),
      ItalicPlugin.configure({ shortcuts: { toggle: { keys: "mod+i" } } }),
      UnderlinePlugin.configure({
        shortcuts: { toggle: { keys: "mod+u" } },
      }),
      StrikethroughPlugin,
      CodePlugin,
      AutoformatPlugin.configure({
        options: { enableUndoOnDelete: true, rules: autoformatRules },
      }),
      MarkdownPlugin.configure({
        options: { remarkPlugins: [remarkGfm, remarkMdx] },
      }),
    ],
    value: (editor) => {
      if (initialBody) {
        return editor.getApi(MarkdownPlugin).markdown.deserialize(initialBody);
      }
      return [{ type: "p", children: [{ text: "" }] }];
    },
  });
}
