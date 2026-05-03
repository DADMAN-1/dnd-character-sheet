import { useMemo } from "react";

/**
 * Generic search hook — filters items by query across multiple string fields.
 * Returns all items when query is empty or whitespace.
 */
export function useSearch<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
): T[] {
  return useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return items;
    return items.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(trimmed);
        }
        if (typeof value === "number" || typeof value === "bigint") {
          return String(value).includes(trimmed);
        }
        return false;
      }),
    );
  }, [items, query, searchFields]);
}
