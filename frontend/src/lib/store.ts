import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DraftState {
  _id?: string;
  title: string;
  category: string;
  excerpt: string;
  htmlContent: string;
  coverImage: string;
  seoKeywords: string;
}

interface EditorStore {
  draft: DraftState;
  setDraftField: (field: keyof DraftState, value: string) => void;
  clearDraft: () => void;
}

interface UIStore {
  sidebarOpen: boolean;
  layoutMode: "grid" | "list";
  toggleSidebar: () => void;
  setLayoutMode: (mode: "grid" | "list") => void;
}

// 1. Persistent Form Cache Store
export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      draft: {
        _id: "",
        title: "",
        category: "",
        excerpt: "",
        htmlContent: "",
        coverImage: "",
        seoKeywords: "",
      },
      setDraftField: (field, value) =>
        set((state) => ({
          draft: { ...state.draft, [field]: value },
        })),
      clearDraft: () =>
        set({
          draft: {
            _id: "",
            title: "",
            category: "",
            excerpt: "",
            htmlContent: "",
            coverImage: "",
            seoKeywords: "",
          },
        }),
    }),
    {
      name: "editor-draft-cache", // LocalStorage key
    }
  )
);

// 2. Ephemeral UI State Store
export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  layoutMode: "grid",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setLayoutMode: (mode) => set({ layoutMode: mode }),
}));
