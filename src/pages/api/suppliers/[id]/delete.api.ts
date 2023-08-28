import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'DELETE') {
		return res.status(405).end();
	}

	const id = String(req.query.id);
	console.log('id: ', id);

	if (!id) {
		return res.status(400).json({ type: 'error', statusCode: 400, message: 'id not provided' });
	}

	try {
		await prisma.company.delete({
			where: {
				id,
			},
		});

		return res
			.status(200)
			.json({ type: 'success', statusCode: 200, message: `Fornecedor removido com sucesso` });
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Erro ao tentar remover fornecedor' });
	}
}
