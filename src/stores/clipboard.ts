import { DockviewPanelRenderer } from "dockview-react";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ClipboardStore<T> = {
  value: T | null;
  copy: (value: T | null) => void;
  paste: () => T | null;
};

type PanelCipboardItem = {
  id: string;
  title?: string;
  component: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params?: any;
  tabComponent?: string;
  renderer?: DockviewPanelRenderer;
};

const createClipboardStore = <T>(key: string) =>
  create<ClipboardStore<T>>()(
    persist(
      (set, get) => ({
        value: null,
        copy: (value) => {
          set({ value });
        },
        paste: () => {
          const value = get().value;
          set({ value: null });
          return value;
        },
      }),
      {
        name: key,
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  );

export const usePanelClipboardStore = createClipboardStore<PanelCipboardItem>(
  "mrt_panel_clipboard",
);

// export const usePanelCipboardStore = create<ClipboardStore<PanelCipboardItem>>()(
//   persist(
//     (set, get) => ({
//       key: "panel",
//       value: null,
//       getValue: async () => {
//         const internalValue = get().value
//         if (internalValue) {
//           return internalValue;
//         }
//
//         // HELLOWORLD
//         // 0123456
//         const navigatorValue = await navigator.clipboard.readText()
//         if(navigatorValue.startsWith(get().key)) {
//           return JSON.parse(navigatorValue.substring(get().key.length))
//         }
//       },
//       copy: (value) => {
//         set({ value })
//       },
//       paste: () => {
//         const value = get().value
//         set({ value: null })
//         return value
//       }
//     }),
//     {
//       name: 'mrt_panel_clipboard',
//       storage: createJSONStorage(() => sessionStorage),
//     },
//   ),
// )
