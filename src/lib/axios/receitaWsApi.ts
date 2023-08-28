import axios from 'axios';

export const receitaWsApi = axios.create({
	baseURL: 'https://receitaws.com.br/v1/cnpj',
	timeout: 10000,
});
