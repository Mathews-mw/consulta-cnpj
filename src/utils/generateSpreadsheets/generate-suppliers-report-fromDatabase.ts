import writeXlsxFile from 'write-excel-file/node';
import { Company, CompanyActivities, CompanyPartners } from '@prisma/client';

interface Props {
	companies: Company[];
	companiesActivities: CompanyActivities[];
	companiesPartners: CompanyPartners[];
}

interface IWriteXlsxFileSchema<Object> {
	column: string;
	type: typeof String | typeof Number | typeof Boolean | typeof Date;
	format?: string;
	value(object: Object): any | undefined | null;
}

export async function generateSuppliersReportFromDatabase({
	companies,
	companiesActivities,
	companiesPartners,
}: Props) {
	const companiesObjects = companies.map((company) => {
		return {
			status: company.status,
			ultima_atualizacao: company.ultima_atualizacao,
			cnpj: company.cnpj,
			tipo: company.tipo,
			porte: company.porte,
			nome: company.nome,
			fantasia: company.nome_fantasia,
			abertura: company.abertura,
			natureza_juridica: company.natureza_juridica,
			logradouro: company.logradouro,
			numero: company.numero,
			complemento: company.complemento,
			cep: company.cep,
			bairro: company.bairro,
			municipio: company.municipio,
			uf: company.uf,
			email: company.email,
			telefone: company.telefone,
			efr: company.efr,
			situacao: company.situacao,
			data_situacao: company.data_situacao,
			motivo_situacao: company.motivo_situacao,
			situacao_especial: company.situacao_especial,
			data_situacao_especial: company.data_situacao_especial,
			capital_social: Number(company.capital_social),
		};
	});

	const mainActivitiesObjects = companiesActivities.map((activity) => {
		return {
			cnpj: activity.company_cnpj,
			code: activity.activity_code,
			text: activity.activity_description,
			tipo_atividade: activity.activity_type,
		};
	});

	const corporateStructure = companiesPartners.map((partner) => {
		return {
			cnpj: partner.company_cnpj,
			nome: partner.nome,
			qual: partner.qualificacao_socio,
			pais_origem: partner.pais_origem,
			nome_rep_legal: partner.nome_rep_legal,
			qual_rep_legal: partner.qual_rep_legal,
		};
	});

	const companiesSchema: IWriteXlsxFileSchema<Company>[] = [
		{
			column: 'CNPJ',
			type: String,
			value: (company) => company.cnpj,
		},
		{
			column: 'NOME',
			type: String,
			value: (company) => company.nome,
		},
		{
			column: 'NOME FANTASIA',
			type: String,
			value: (company) => company.nome_fantasia,
		},
		{
			column: 'ABERTURA',
			type: String,
			value: (company) => company.abertura,
		},
		{
			column: 'TIPO',
			type: String,
			value: (company) => company.tipo,
		},
		{
			column: 'PORTE',
			type: String,
			value: (company) => company.porte,
		},
		{
			column: 'NATUREZA JURIDICA',
			type: String,
			value: (company) => company.natureza_juridica,
		},
		{
			column: 'LOGRADOURO',
			type: String,
			value: (company) => company.logradouro,
		},
		{
			column: 'NUMERO',
			type: String,
			value: (company) => company.numero,
		},
		{
			column: 'COMPLEMENTO',
			type: String,
			value: (company) => company.complemento,
		},
		{
			column: 'BAIRRO',
			type: String,
			value: (company) => company.bairro,
		},
		{
			column: 'CEP',
			type: String,
			value: (company) => company.cep,
		},
		{
			column: 'MUNICÍPIO',
			type: String,
			value: (company) => company.municipio,
		},
		{
			column: 'UF',
			type: String,
			value: (company) => company.uf,
		},
		{
			column: 'EMAIL',
			type: String,
			value: (company) => company.email,
		},
		{
			column: 'TELEFONE',
			type: String,
			value: (company) => company.telefone,
		},
		{
			column: 'EFR',
			type: String,
			value: (company) => company.efr,
		},
		{
			column: 'STATUS',
			type: String,
			value: (company) => company.status,
		},
		{
			column: 'ÚLTIMA ATUALIZAÇÃO',
			type: String,
			value: (company) => company.ultima_atualizacao,
		},
		{
			column: 'SITUAÇÃO',
			type: String,
			value: (company) => company.situacao,
		},
		{
			column: 'DATA SITUAÇÃO',
			type: String,
			value: (company) => company.data_situacao,
		},
		{
			column: 'MOTIVO SITUAÇÃO',
			type: String,
			value: (company) => company.motivo_situacao,
		},
		{
			column: 'SITUAÇÃO ESPECIAL',
			type: String,
			value: (company) => company.situacao_especial,
		},
		{
			column: 'DATA SITUAÇÃO ESPECIAL',
			type: String,
			value: (company) => company.data_situacao_especial,
		},
		{
			column: 'CAPITAL SOCIAL',
			type: Number,
			format: '#.##0,00',
			value: (company) => company.capital_social,
		},
	];

	interface ICompaniesActivities {
		cnpj: string;
		code: string;
		text: string;
		tipo_atividade: string;
	}

	const activitiesSchema: IWriteXlsxFileSchema<ICompaniesActivities>[] = [
		{
			column: 'CNPJ',
			type: String,
			value: (activity) => activity.cnpj,
		},
		{
			column: 'COD. ATIVIDADE PRINCIPAL',
			type: String,
			value: (activity) => activity.code,
		},
		{
			column: 'ATIVIDADE',
			type: String,
			value: (activity) => activity.text,
		},
		{
			column: 'TIPO DE ATIVIDADE',
			type: String,
			value: (activity) => activity.tipo_atividade,
		},
	];

	interface ICorporateStructure {
		cnpj: string;
		nome: string;
		qual: string;
		pais_origem: string;
		nome_rep_legal: string;
		qual_rep_legal: string;
	}

	const corporateStructureSchema: IWriteXlsxFileSchema<ICorporateStructure>[] = [
		{
			column: 'CNPJ',
			type: String,
			value: (corporate) => corporate.cnpj,
		},
		{
			column: 'NOME',
			type: String,
			value: (corporate) => corporate.nome,
		},
		{
			column: 'QUALIFICAÇÃO DO SÓCIO',
			type: String,
			value: (corporate) => corporate.qual,
		},
		{
			column: 'PAÍS DE ORIGEM',
			type: String,
			value: (corporate) => corporate.pais_origem,
		},
		{
			column: 'NOME DO REPRESENTANTE LEGAL',
			type: String,
			value: (corporate) => corporate.nome_rep_legal,
		},
		{
			column: 'QUALIFICAÇÃO DO REPRESENTANTE LEGAL',
			type: String,
			value: (corporate) => corporate.qual_rep_legal,
		},
	];

	const fileName = `relatorio-consulta-cnpj-${new Date().getTime()}.xlsx`;
	const bufferExcel = await writeXlsxFile(
		// @ts-ignore
		[companiesObjects, mainActivitiesObjects, corporateStructure],
		{
			schema: [companiesSchema, activitiesSchema, corporateStructureSchema],
			sheets: ['DADOS_CNPJ', 'ATIVIDADES', 'SOCIOS'],
			buffer: true,
		}
	);

	return { bufferExcel, fileName };
}
