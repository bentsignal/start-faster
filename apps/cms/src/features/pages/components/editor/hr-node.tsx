import type { PlateElementProps } from "platejs/react";
import { PlateElement } from "platejs/react";

export function HrElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <hr />
      {props.children}
    </PlateElement>
  );
}
