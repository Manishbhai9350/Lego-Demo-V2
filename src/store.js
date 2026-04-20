import { create } from 'zustand'

export const useStore = create((set) => ({
  selectedChar: null,
  setSelectedChar: (id) => set((s) => ({ selectedChar: s.selectedChar === id ? null : id })),
}))
