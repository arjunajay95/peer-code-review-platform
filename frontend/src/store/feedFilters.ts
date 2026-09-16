import { create } from 'zustand';

interface FeedFiltersState {
  search: string;
  setSearch: (term: string) => void;
}

export const useFeedFilters = create<FeedFiltersState>((set) => ({
  search: '',
  setSearch: (term) => set({ search: term }),
}));
