import type { PlateElementProps } from "platejs/react";
import { PlateElement } from "platejs/react";

function createElementNode(
  tag: keyof HTMLElementTagNameMap,
  displayName: string,
) {
  function Component(props: PlateElementProps) {
    return <PlateElement as={tag} {...props} />;
  }
  Component.displayName = displayName;
  return Component;
}

export const ParagraphElement = createElementNode("p", "ParagraphElement");
export const H1Element = createElementNode("h1", "H1Element");
export const H2Element = createElementNode("h2", "H2Element");
export const H3Element = createElementNode("h3", "H3Element");
export const H4Element = createElementNode("h4", "H4Element");
export const H5Element = createElementNode("h5", "H5Element");
export const H6Element = createElementNode("h6", "H6Element");
export const BlockquoteElement = createElementNode(
  "blockquote",
  "BlockquoteElement",
);
export const LinkElement = createElementNode("a", "LinkElement");
export const BulletedListElement = createElementNode(
  "ul",
  "BulletedListElement",
);
export const NumberedListElement = createElementNode(
  "ol",
  "NumberedListElement",
);
export const ListItemElement = createElementNode("li", "ListItemElement");
export const CodeBlockElement = createElementNode("pre", "CodeBlockElement");
export const CodeLineElement = createElementNode("div", "CodeLineElement");
