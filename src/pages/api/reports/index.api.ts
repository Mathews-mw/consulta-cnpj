import { prisma } from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { generateSuppliersReportFromDatabase } from '../../../utils/generateSpreadsheets/generate-suppliers-report-fromDatabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	const cnpjs = req.query.cnpjs as string[];

	if (!cnpjs) {
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Parâmetros incorretos' });
	}

	try {
		const companies = await prisma.company.findMany({
			where: {
				cnpj: {
					in: cnpjs,
				},
			},
			orderBy: {
				nome: 'asc',
			},
		});
		const companiesActivities = await prisma.companyActivities.findMany({
			where: {
				company_cnpj: {
					in: cnpjs,
				},
			},
			orderBy: {
				companny: {
					nome: 'asc',
				},
			},
		});
		const companiesPartners = await prisma.companyPartners.findMany({
			where: {
				company_cnpj: {
					in: cnpjs,
				},
			},
			orderBy: {
				company: {
					nome: 'asc',
				},
			},
		});

		const spreadSheedt = await generateSuppliersReportFromDatabase({
			companies,
			companiesActivities,
			companiesPartners,
		});

		res.setHeader('Content-disposition', 'attachment; filename=teste-relatorio.xlsx');
		res.setHeader(
			'Content-type',
			'application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('filename', spreadSheedt.fileName);

		return res.send(spreadSheedt.bufferExcel);
	} catch (error) {
		console.log(error);
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Erro oa tentar gerar relatório' });
	}
}
