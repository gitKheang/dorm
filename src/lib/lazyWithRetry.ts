import { lazy } from "react";

type ModuleFactory<T extends React.ComponentType<any>> = () => Promise<{ default: T }>;

const CHUNK_ERROR_PATTERN =
  /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module/i;

export function lazyWithRetry<T extends React.ComponentType<any>>(factory: ModuleFactory<T>, key: string) {
  return lazy(async () => {
    const retryKey = `lazy-retry:${key}`;
    const alreadyRetried = typeof window !== "undefined" && sessionStorage.getItem(retryKey) === "true";

    try {
      const module = await factory();

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(retryKey);
      }

      return module;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isChunkLoadError = CHUNK_ERROR_PATTERN.test(message);

      if (typeof window !== "undefined" && isChunkLoadError && !alreadyRetried) {
        sessionStorage.setItem(retryKey, "true");
        window.location.reload();
        return new Promise<never>(() => {});
      }

      throw error;
    }
  });
}
