import fs from 'node:fs';
import axios from 'axios';
import { parse } from 'csv-parse';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { ICnpjConsultResponse } from '@/@types';
import { LocalStorageProvider } from '@/providers/LocalStorageProvider';
import { generateSuppliersReportFromApi } from '@/utils/generateSpreadsheets/generate-suppliers-report-fromApi';
import { generateSuppliersReportFromDatabase } from '@/utils/generateSpreadsheets/generate-suppliers-report-fromDatabase';

async function cosultCnpjsFromReceitaWS(
	cnpjs: string[],
	transactionControlId: string
): Promise<ICnpjConsultResponse[]> {
	const cnpjsConsults: ICnpjConsultResponse[] = [];

	for (let count = 0; count < cnpjs.length; count++) {
		try {
			const response = await axios.get<ICnpjConsultResponse>(
				`https://receitaws.com.br/v1/cnpj/${cnpjs[count]}`
			);

			cnpjsConsults.push(response.data);

			await prisma.transactionControl.update({
				where: {
					id: transactionControlId,
				},
				data: {
					status: 'ATUALIZANDO',
					updated_at: new Date(),
				},
			});

			if ((count + 1) % 3 === 0) {
				console.log('Esperando para atualizar...');
				await new Promise((resolve, reject) => {
					setTimeout(async () => {
						resolve(true);
					}, 60000);
				});
			}
		} catch (error: any) {
			console.log(error);
			throw Error(error.toString());
		}
	}

	console.log('ok, todos os cnjs foram verificados!');
	return cnpjsConsults;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== 'GET') {
		return res.status(405).end();
	}

	const cnpjs = req.query.cnpjs as string[];

	const transactionControl = await prisma.transactionControl.create({
		data: {
			process_type: 'GERAR_RELATORIO',
			status: 'ATUALIZANDO',
		},
	});

	try {
		const estimetedTime = cnpjs.length * 20;

		await prisma.transactionControl.update({
			where: {
				id: transactionControl.id,
			},
			data: {
				status: 'ATUALIZANDO',
				updated_at: new Date(),
				estimated_time: estimetedTime,
			},
		});

		const ame = await cosultCnpjsFromReceitaWS(cnpjs, transactionControl.id);

		const companiesList: any[] = [];
		const companiesActivitiesList: any[] = [];
		const companiesPartnersList: any[] = [];

		await Promise.all(
			ame.map((company) => {
				const { atividade_principal, atividades_secundarias, qsa } = company;

				const atividadesPrincipais = atividade_principal.map((activity) => {
					return {
						company_cnpj: company.cnpj,
						activity_code: activity.code,
						activity_description: activity.text,
						activity_type: 'PRINCIPAL',
					};
				});

				companiesActivitiesList.push(...atividadesPrincipais);

				const atividadesSecundarias = atividades_secundarias.map((activity) => {
					return {
						company_cnpj: company.cnpj,
						activity_code: activity.code,
						activity_description: activity.text,
						activity_type: 'SECUNDARIA',
					};
				});

				companiesActivitiesList.push(...atividadesSecundarias);

				const partners = qsa.map((partner) => {
					return {
						company_cnpj: company.cnpj,
						nome: partner.nome,
						qualificacao_socio: partner.qual,
						pais_origem: '',
						nome_rep_legal: '',
						qual_rep_legal: '',
					};
				});

				companiesPartnersList.push(...partners);

				const companySchema = {
					cnpj: company.cnpj,
					situacao: company.situacao,
					status: company.status,
					ultima_atualizacao: company.ultima_atualizacao,
					tipo: company.tipo,
					porte: company.porte,
					nome: company.nome,
					nome_fantasia: company.fantasia,
					abertura: company.abertura,
					natureza_juridica: company.natureza_juridica,
					email: company.email,
					telefone: company.telefone,
					logradouro: company.logradouro,
					numero: company.numero,
					complemento: company.complemento,
					cep: company.cep,
					bairro: company.bairro,
					municipio: company.municipio,
					uf: company.uf,
					efr: company.efr,
					data_situacao: company.data_situacao,
					motivo_situacao: company.motivo_situacao,
					situacao_especial: company.situacao_especial,
					data_situacao_especial: company.data_situacao_especial,
					capital_social: company.capital_social,
				};

				companiesList.push(companySchema);

				return {
					companySchema,
					atividadesPrincipais,
					atividadesSecundarias,
				};
			})
		);

		const spreadSheedt = await generateSuppliersReportFromDatabase({
			companies: companiesList,
			companiesActivities: companiesActivitiesList,
			companiesPartners: companiesPartnersList,
		});

		await prisma.spreadSheet.create({
			data: {
				file_name: spreadSheedt.fileName,
			},
		});

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

		res.setHeader('Content-disposition', 'attachment; filename=teste-relatorio.xlsx');
		res.setHeader(
			'Content-type',
			'application/application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		);
		res.setHeader('filename', spreadSheedt.fileName);

		return res.send(spreadSheedt.bufferExcel);
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
		return res.status(400).json({ error: 'Erro' });
	}
}
