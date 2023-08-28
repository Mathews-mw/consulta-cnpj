import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

export const ShowErrorRequest = (error: any) => {
	let message = 'Tivemos um problema. Tente novamente mais tarde.';
	if (error && error instanceof AxiosError) {
		if (error?.response?.data && error.response.data.message) {
			message = error.response.data.message;
		}
	} else if (error.request) {
		message = 'Tempo de espera atingido. Por favor, tente novamente mais tarde.';
	} else {
		message = error.message;
	}
	toast(message, {
		position: 'top-right',
		autoClose: 5000,
		hideProgressBar: false,
		closeOnClick: true,
		pauseOnHover: true,
		draggable: true,
		bodyStyle: {
			fontSize: 14,
		},
		theme: 'light',
		type: 'error',
	});
};
