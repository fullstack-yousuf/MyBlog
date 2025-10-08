"use client";
import { useState, useMemo } from "react";
import { Dropdown, DropdownOption } from "./Dropdown";
import { FilterState } from "../../hooks/usePosts";

interface FilterBarProps {
  initialFilters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
}

// --- Sort Options ---
const SORT_OPTIONS: DropdownOption[] = [
  { id: "createdAt", name: "Date" },
  { id: "likes", name: "Likes" },
];

// --- Dynamic Order Options ---
const getOrderOptions = (sortBy: string): DropdownOption[] => {
  if (sortBy === "likes") {
    return [
      { id: "desc", name: "Most Liked" },
      { id: "asc", name: "Least Liked" },
    ];
  }
  return [
    { id: "desc", name: "Newest" },
    { id: "asc", name: "Oldest" },
  ];
};

export const FilterBar: React.FC<FilterBarProps> = ({
  initialFilters,
  onApply,
  onClear,
}) => {
  const [sortBy, setSortBy] = useState(
    SORT_OPTIONS.find((s) => s.id === initialFilters.sortBy) || SORT_OPTIONS[0]
  );

  //   dynamically recompute order options
  const orderOptions = useMemo(() => getOrderOptions(sortBy.id), [sortBy]);

  const [order, setOrder] = useState(
    orderOptions.find((o) => o.id === initialFilters.order) || orderOptions[0]
  );

  //   update order automatically when switching "sort by"
  const handleSortChange = (option: DropdownOption) => {
    setSortBy(option);
    const newOrderOptions = getOrderOptions(option.id);
    setOrder(newOrderOptions[0]); // default to first one (Newest / Most Liked)
  };

  const filtersChanged = useMemo(
    () =>
      sortBy.id !== initialFilters.sortBy || order.id !== initialFilters.order,
    [sortBy, order, initialFilters]
  );

  const handleApply = () => {
    onApply({
      sortBy: sortBy.id as "createdAt" | "likes",
      order: order.id as "asc" | "desc",
    });
  };

  return (
  <div className="space-y-4">
  <small className="block mb-1 text-gray-600 font-medium">
    Sort & Filter
  </small>

  <div className="flex w-full items-center justify-between flex-wrap gap-3">
    {/* --- Left side: Dropdowns --- */}
    <div className="flex flex-wrap items-center gap-4">
      <Dropdown
        options={SORT_OPTIONS}
        selected={sortBy}
        onChange={handleSortChange}
      />
      <Dropdown
        options={orderOptions}
        selected={order}
        onChange={setOrder}
        widthClass="w-32"
      />
    </div>

    {/* --- Right side: Apply + Clear buttons --- */}
    {filtersChanged && (
      <div className="flex items-center gap-3">
        <button
          onClick={handleApply}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Apply
        </button>
        <button
          onClick={onClear}
          className="border border-gray-300 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Clear
        </button>
      </div>
    )}
  </div>
</div>

  );
};