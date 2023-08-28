import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	const transactionId = String(req.query.transactionId);

	if (!transactionId) {
		return res.status(400).json({ type: 'error', statusCode: 400, message: 'Id not provided' });
	}

	try {
		const transactionControl = await prisma.transactionControl.findUnique({
			where: {
				id: transactionId,
			},
		});

		return res.json({
			transactionControl,
			message: `Status da atualização ${transactionControl?.status}`,
		});
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Erro ao buscar por transação' });
	}
}
