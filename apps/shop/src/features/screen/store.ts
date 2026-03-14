import { useEffect, useState } from "react";
import { createStore } from "rostra";

import type { ScreenSizeValue } from "~/features/screen/sizes";
import { SCREEN_ORDER } from "~/features/screen/sizes";
import { getScreenSizeFromWidth } from "~/features/screen/utils";

function useInternalStore() {
  const [size, setSize] = useState<ScreenSizeValue | undefined>(undefined);

  useEffect(() => {
    const syncScreenSize = () => {
      setSize(getScreenSizeFromWidth(window.innerWidth));
    };

    syncScreenSize();
    window.addEventListener("resize", syncScreenSize);

    return () => {
      window.removeEventListener("resize", syncScreenSize);
    };
  }, []);

  function isBiggerThan(target: ScreenSizeValue) {
    return size !== undefined && SCREEN_ORDER[size] >= SCREEN_ORDER[target];
  }

  function isSmallerThan(target: ScreenSizeValue) {
    return size !== undefined && SCREEN_ORDER[size] <= SCREEN_ORDER[target];
  }

  return {
    screen: {
      size,
      isBiggerThan,
      isSmallerThan,
    },
  };
}

export const { Store: ScreenStore, useStore: useScreenStore } =
  createStore(useInternalStore);
