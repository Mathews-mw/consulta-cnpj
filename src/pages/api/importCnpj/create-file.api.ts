import fs from 'node:fs';
import axios from 'axios';
import { parse } from 'csv-parse';
import { NextApiRequest, NextApiResponse } from 'next';

import { prisma } from '@/lib/prisma';
import { ICnpjConsultResponse } from '@/@types';
import { LocalStorageProvider } from '@/providers/LocalStorageProvider';
import { generateSuppliersReportFromApi } from '@/utils/generateSpreadsheets/generate-suppliers-report-fromApi';

interface Request extends NextApiRequest {
	file: Express.Multer.File;
}

// const MAX_FILE_SIZE = 800000;
// const ACCEPTED_IMAGE_TYPES = [
// 	'image/jpeg',
// 	'image/jpg',
// 	'image/png',
// 	'image/webp',
// 	'image/svg+xml',
// ];
// const fileSchema = z.object({
// 	fieldname: z.string().min(1, { message: 'Image is required' }),
// 	originalname: z.string(),
// 	encoding: z.string(),
// 	mimetype: z.string(),
// 	size: z.number(),
// 	destination: z.string(),
// 	filename: z.string(),
// 	path: z.string(),
// });

function runMiddleware(
	req: NextApiRequest & { [key: string]: any },
	res: NextApiResponse,
	fn: (...args: any[]) => void
): Promise<any> {
	return new Promise((resolve, reject) => {
		fn(req, res, (result: any) => {
			if (result instanceof Error) {
				console.log('error: ', result);
				return reject(result);
			}
			return resolve(result);
		});
	});
}

function loadCategories(file: Express.Multer.File): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const stream = fs.createReadStream(file.path);
		const cnpjsImports: string[] = [];

		const parseFile = parse();

		stream.pipe(parseFile);

		parseFile
			.on('data', async (line) => {
				const [cnpj] = line;

				cnpjsImports.push(cnpj);
			})
			.on('end', () => {
				fs.promises.unlink(file.path);
				resolve(cnpjsImports);
			})
			.on('error', (error) => {
				reject(error);
			});
	});
}

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

export default async function handler(req: Request, res: NextApiResponse) {
	if (req.method !== 'POST') {
		return res.status(405).end();
	}

	const upload = LocalStorageProvider.storage();
	await runMiddleware(req, res, upload.single('file'));

	const { file } = req;

	const transactionControl = await prisma.transactionControl.create({
		data: {
			process_type: 'GERAR_RELATORIO',
			status: 'ATUALIZANDO',
		},
	});

	res.status(200).json({
		type: 'processing',
		statusCode: 102,
		transactionControl,
		message: `O relatório está sendo gerado. Por favor, aguarde...`,
	});

	try {
		const cnpjsRaw = await loadCategories(file);

		const cnpjList = cnpjsRaw[0].split(';');
		const estimetedTime = cnpjList.length * 20;

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

		const ame = await cosultCnpjsFromReceitaWS(cnpjList, transactionControl.id);

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

		const spreadSheedt = await generateSuppliersReportFromApi({
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
		return res.status(400).json({ error: 'Erro' });
	}
}

export const config = {
	api: {
		bodyParser: false,
	},
};
