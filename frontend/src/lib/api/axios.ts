import type { AxiosError, AxiosRequestConfig } from 'axios';
import axios from 'axios';

export const axiosInstance = axios.create();

axiosInstance.interceptors.request.use((config) => {
	if (typeof window !== 'undefined') {
		const token = localStorage.getItem('access_token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
	}
	return config;
});

export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	return axiosInstance(config).then(({ data }) => data);
};

export type ErrorType<Error> = AxiosError<Error>;
