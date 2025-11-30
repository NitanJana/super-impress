import { loginForAccessTokenApiLoginPost } from '$lib/api/authentication/authentication';

export async function loginApi({ email, password }: { email: string; password: string }) {
	const response = await loginForAccessTokenApiLoginPost({
		username: email,
		password: password
	});

	if (response.status !== 200) {
		const errorData = response.data as { detail?: string };
		throw new Error(errorData.detail || 'Login failed');
	}

	return response.data;
}
