import { z } from 'zod';
import dayjs from 'dayjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { Company } from '@prisma/client';
import { receitaWsApi } from '@/lib/axios/receitaWsApi';

enum ActivityType {
	Principal = 'PRINCIPAL',
	Secundaria = 'SECUNDARIA',
}

interface ICnpjConsultResponse {
	status: string;
	ultima_atualizacao: string;
	cnpj: string;
	tipo: string;
	porte: string;
	nome: string;
	fantasia: string;
	abertura: string;
	atividade_principal: {
		code: string;
		text: string;
	}[];
	atividades_secundarias: {
		code: string;
		text: string;
	}[];
	natureza_juridica: string;
	logradouro: string;
	numero: string;
	complemento: string;
	cep: string;
	bairro: string;
	municipio: string;
	uf: string;
	email: string;
	telefone: string;
	efr: string;
	situacao: string;
	data_situacao: string;
	motivo_situacao: string;
	situacao_especial: string;
	data_situacao_especial: string;
	capital_social: string;
	qsa: {
		nome: string;
		qual: string;
		pais_origem: string;
		nome_rep_legal: string;
		qual_rep_legal: string;
	}[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'PUT') {
		return res.status(405).end();
	}
	const revalidateBodySchema = z.object({
		cnpjs: z.array(z.string()),
	});

	const schemaParseResult = revalidateBodySchema.safeParse(req.body);

	if (!schemaParseResult.success) {
		return res
			.status(400)
			.json({ type: 'error', statusCode: 400, message: schemaParseResult.error.issues });
	}

	const { data } = schemaParseResult;

	const companies = await prisma.company.findMany({
		where: {
			cnpj: {
				in: data.cnpjs,
			},
		},
	});

	if (!companies) {
		return res.status(400).json({ type: 'error', statusCode: 400, message: 'CNPJ não encontrado' });
	}

	const formattedCnpjs: string[] = companies.map((company: Company) => {
		return company.cnpj.replace(/[^0-9]+/g, '');
	});

	async function executeUpdate(cnpj: string) {
		const { data: cnpjData } = await receitaWsApi.get<ICnpjConsultResponse>(`/${cnpj}`);

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

		const secondaryCompanyActivitiesData = cnpjData.atividades_secundarias.map((activity) => {
			return {
				activity_code: activity.code,
				activity_description: activity.text,
				activity_type: ActivityType.Secundaria,
			};
		});

		const activitiesCreatePrismaData = [
			...primaryCompanyActivitiesData,
			...secondaryCompanyActivitiesData,
		];

		const companyUpdated = await prisma.company.update({
			where: {
				cnpj: cnpjData.cnpj,
			},
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
				atualizado_em: dayjs().toDate(),
			},
		});

		await prisma.companyActivities.deleteMany({
			where: {
				company_cnpj: companyUpdated.cnpj,
			},
		});

		await prisma.companyActivities.createMany({
			data: activitiesCreatePrismaData.map((activity) => {
				return {
					company_cnpj: companyUpdated.cnpj,
					activity_code: activity.activity_code,
					activity_description: activity.activity_description,
					activity_type: activity.activity_type,
				};
			}),
		});

		await prisma.companyPartners.deleteMany({
			where: {
				company_cnpj: companyUpdated.cnpj,
			},
		});

		await prisma.companyPartners.createMany({
			data: cnpjData.qsa.map((partner) => {
				return {
					company_cnpj: companyUpdated.cnpj,
					nome: partner.nome,
					nome_rep_legal: partner.nome_rep_legal,
					pais_origem: partner.pais_origem,
					qual_rep_legal: partner.nome_rep_legal,
					qualificacao_socio: partner.qual,
				};
			}),
		});
	}

	const transactionControl = await prisma.transactionControl.create({
		data: {
			process_type: 'REVALIDACAO_FORNECEDOR',
			status: 'ATUALIZANDO',
		},
	});

	res.status(200).json({
		type: 'success',
		statusCode: 200,
		transactionControl,
		message: `${formattedCnpjs.length} estão sendo atualizados. Por favor, aguarde...`,
	});

	try {
		for (const [index, cnpj] of formattedCnpjs.entries()) {
			await executeUpdate(cnpj);
			console.log('Atualizou', index);

			await prisma.transactionControl.update({
				where: {
					id: transactionControl.id,
				},
				data: {
					status: 'ATUALIZANDO',
					updated_at: new Date(),
				},
			});

			if ((index + 1) % 3 === 0) {
				console.log('Esperando para atualizar...');
				await new Promise((resolve, reject) => {
					setTimeout(async () => {
						resolve(true);
					}, 60000);
				});
			}
		}

		await prisma.transactionControl.update({
			where: {
				id: transactionControl.id,
			},
			data: {
				status: 'CONCLUIDA',
				updated_at: new Date(),
				completed_at: new Date(),
			},
		});

		console.log('atualizações concluída');
		return;
	} catch (error) {
		console.log(error);

		await prisma.transactionControl.update({
			where: {
				id: transactionControl.id,
			},
			data: {
				status: 'CANCELADA',
				updated_at: new Date(),
				completed_at: new Date(),
			},
		});

		return res.status(400).json({
			type: 'error',
			statusCode: 400,
			message: `Erro ao tentar revalidar os dados`,
		});
	}
}
