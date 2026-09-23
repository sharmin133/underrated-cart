import React, { createContext, useContext, useState } from 'react';
import { Product } from '../types/product';

type FilterResult = {
  products: Product[];
  label: string;
};

type FilterContextValue = {
  filterResult: FilterResult | null;
  applyFilter: (products: Product[], label: string) => void;
  clearFilter: () => void;
};

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [filterResult, setFilterResult] = useState<FilterResult | null>(null);

  const applyFilter = (products: Product[], label: string) => {
    setFilterResult({ products, label });
  };

  const clearFilter = () => setFilterResult(null);

  return (
    <FilterContext.Provider value={{ filterResult, applyFilter, clearFilter }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilter must be used inside FilterProvider');
  return ctx;
}