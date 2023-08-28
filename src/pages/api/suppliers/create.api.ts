import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { ICnpjConsultResponse } from '@/@types';
import { receitaWsApi } from '@/lib/axios/receitaWsApi';

enum ActivityType {
	Principal = 'PRINCIPAL',
	Secundaria = 'SECUNDARIA',
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).end();
	}

	const companyBodySchema = z.object({
		cnpj: z.string().length(18),
	});

	const { cnpj } = companyBodySchema.parse(req.body);

	const company = await prisma.company.findUnique({
		where: {
			cnpj,
		},
	});

	if (company) {
		return res.status(400).json({ type: 'error', statusCode: 400, message: 'CNPJ já cadastrado' });
	}

	const cnpjFormatted = cnpj.replace(/[^0-9]+/g, '');
	const { data: cnpjData } = await receitaWsApi.get<ICnpjConsultResponse>(`/${cnpjFormatted}`);

	if (!cnpjData.cnpj) {
		return res.status(400).json({ type: 'error', statusCode: 400, message: 'CNPJ inválido' });
	}

	const primaryCompanyActivitiesData = cnpjData.atividade_principal.map((activity) => {
		return {
			activity_code: activity.code,
			activity_description: activity.text,
			activity_type: ActivityType.Principal,
		};
	});

	const secondarySompanyActivitiesData = cnpjData.atividades_secundarias.map((activity) => {
		return {
			activity_code: activity.code,
			activity_description: activity.text,
			activity_type: ActivityType.Secundaria,
		};
	});

	const activitiesCreatePrismaData = [
		...primaryCompanyActivitiesData,
		...secondarySompanyActivitiesData,
	];

	try {
		const newCompany = await prisma.company.create({
			data: {
				abertura: cnpjData.abertura,
				bairro: cnpjData.bairro,
				capital_social: cnpjData.capital_social,
				cnpj: cnpjData.cnpj,
				cep: cnpjData.cep,
				complemento: cnpjData.complemento,
				email: cnpjData.email,
				logradouro: cnpjData.logradouro,
				municipio: cnpjData.municipio,
				natureza_juridica: cnpjData.natureza_juridica,
				nome: cnpjData.nome,
				nome_fantasia: cnpjData.fantasia,
				numero: cnpjData.numero,
				porte: cnpjData.porte,
				status: cnpjData.status,
				telefone: cnpjData.telefone,
				tipo: cnpjData.tipo,
				uf: cnpjData.uf,
				data_situacao: cnpjData.data_situacao,
				data_situacao_especial: cnpjData.data_situacao_especial,
				efr: cnpjData.efr,
				motivo_situacao: cnpjData.motivo_situacao,
				situacao: cnpjData.situacao,
				situacao_especial: cnpjData.situacao_especial,
				ultima_atualizacao: cnpjData.ultima_atualizacao,
				companyActivities: {
					createMany: {
						data: activitiesCreatePrismaData,
					},
				},
				companyPartners: {
					createMany: {
						data: cnpjData.qsa.map((partner) => {
							return {
								nome: partner.nome,
								nome_rep_legal: partner.nome_rep_legal,
								pais_origem: partner.pais_origem,
								qual_rep_legal: partner.nome_rep_legal,
								qualificacao_socio: partner.qual,
							};
						}),
					},
				},
			},
		});

		return res.status(201).json({
			type: 'success',
			statusCode: 201,
			message: `O CNPJ: ${newCompany.cnpj} foi cadastrado com sucesso`,
		});
	} catch (error) {
		console.log('create company error: ', error);
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: 'Erro ao tentar cadastrar CNPJ' });
	}
}
