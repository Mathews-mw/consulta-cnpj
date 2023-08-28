import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const searchQuerySchema = z.object({
	cnpj: z.string().max(14, { message: 'Máximo de 14 caracateres apenas.' }),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	const { cnpj } = searchQuerySchema.parse(req.query);

	const result = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpj}`)
		.then((data) => {
			return data.json();
		})
		.catch((error) => {
			console.log(error);
			throw Error(error);
		});

	return res.json(result);
}
