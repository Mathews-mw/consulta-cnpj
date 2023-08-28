import { prisma } from '@/lib/prisma';
import { cnpjMask } from '@/utils/cnpj-mask';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	const { companyName, companyCnpj } = req.query;

	let where = {};

	if (companyName) {
		where = {
			nome: {
				contains: companyName.toString().toLocaleLowerCase(),
				mode: 'insensitive',
			},
		};
	}

	if (companyCnpj) {
		where = {
			cnpj: {
				contains: cnpjMask(companyCnpj.toString()),
			},
		};
	}

	try {
		const listAllCompanies = await prisma.company.findMany({
			include: {
				companyActivities: true,
				companyPartners: true,
			},
			where,
			orderBy: {
				nome: 'asc',
			},
		});

		return res.json(listAllCompanies);
	} catch (error) {
		console.log('list companies error: ', error);
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Erro ao tentar listar fornecedores' });
	}
}
