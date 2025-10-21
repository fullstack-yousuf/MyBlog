import { useCallback, useState } from "react";
import { FilterState } from "./type";


const DEFAULT_FILTERS: FilterState = {
  sortBy: "createdAt",
  order: "DESC",
};

export function usePostFilters(initial?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const applyFilters = useCallback(
    (newFilters: Partial<FilterState>) =>
      setFilters((prev) => ({ ...prev, ...newFilters })),
    []
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  return { filters, applyFilters, clearFilters, DEFAULT_FILTERS };
}