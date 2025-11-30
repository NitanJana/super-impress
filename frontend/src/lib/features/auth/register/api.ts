import { registerUserApiRegisterPost } from '$lib/api/authentication/authentication';

export async function registerApi({ email, password }: { email: string; password: string }) {
	const response = await registerUserApiRegisterPost({
		email: email,
		password: password
	});

	if (response.status !== 200) {
		const errorData = response.data as { detail?: string | Array<{ msg: string }> };
		if (Array.isArray(errorData.detail)) {
			throw new Error(errorData.detail[0].msg || 'Registration failed');
		} else {
			throw new Error(errorData.detail || 'Registration failed');
		}
	}

	return response.data;
}
