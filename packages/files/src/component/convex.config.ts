import actionRetrier from "@convex-dev/action-retrier/convex.config";
import { defineComponent } from "convex/server";

const component = defineComponent("convexFilesControl");

component.use(actionRetrier);

export default component;
