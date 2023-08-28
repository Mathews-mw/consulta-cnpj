import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	try {
		const spreadsheedts = await prisma.spreadSheet.findMany({
			orderBy: {
				created_at: 'desc',
			},
		});

		return res.json(spreadsheedts);
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.json({ type: 'error', status: 400, message: 'Erro ao tentar listar relatórios' });
	}
}
