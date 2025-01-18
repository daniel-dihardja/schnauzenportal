import { createContext, useContext, useState, ReactNode } from 'react';

interface FilterContextType {
  isFilterOpen: boolean;
  toggleFilter: () => void;
  openFilter: () => void;
  closeFilter: () => void;
}

// Create Context
const FilterContext = createContext<FilterContextType | undefined>(undefined);

// Provider Component
export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleFilter = () => setIsFilterOpen((prev) => !prev);
  const openFilter = () => setIsFilterOpen(true);
  const closeFilter = () => setIsFilterOpen(false);

  return (
    <FilterContext.Provider
      value={{ isFilterOpen, toggleFilter, openFilter, closeFilter }}
    >
      {children}
    </FilterContext.Provider>
  );
}

// Custom Hook for easier usage
export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
