import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AppState {
	user: string | null
	setUser: (u: string | null) => void
}

export const useAppStore = create<AppState>()(
	persist(
		set => ({
			user: null,
			setUser: u => set({ user: u }),
		}),
		{
			name: 'app-store',
			storage: createJSONStorage(() => localStorage),
			partialize: state => ({ user: state.user }),
		}
	)
)
