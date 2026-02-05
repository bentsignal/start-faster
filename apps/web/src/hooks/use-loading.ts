import { useState } from "react";

const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  const start = (callback: () => Promise<void>) => {
    setIsLoading(true);
    callback()
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  return { isLoading, start };
};

export { useLoading };
