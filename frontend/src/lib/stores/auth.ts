import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type AuthState = {
	isAuthenticated: boolean;
	token: string | null;
};

function createAuthStore() {
	const { subscribe, set } = writable<AuthState>({
		isAuthenticated: false,
		token: null
	});

	if (browser) {
		const token = localStorage.getItem('access_token');
		if (token) {
			set({ isAuthenticated: true, token: token });
		}
	}

	return {
		subscribe,
		login: (token: string) => {
			localStorage.setItem('access_token', token);
			set({ isAuthenticated: true, token: token });
		},
		logout: () => {
			localStorage.removeItem('access_token');
			set({ isAuthenticated: false, token: null });
		}
	};
}

export const auth = createAuthStore();
