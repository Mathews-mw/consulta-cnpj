import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';

import { theme } from '@/styles';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/Card';
import { cnpjMask } from '@/utils/cnpj-mask';
import { Company, CompanyPartners, CompanyActivities } from '@prisma/client';

import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';

import {
	Container,
	TitleContainer,
	SectionContainer,
	SectionTitle,
	SectionInfos,
	ActivitiesContainer,
	PrincipalTag,
	PartnersContainer,
} from './styles';

interface ISupplier extends Company {
	companyActivities: CompanyActivities[];
	companyPartners: CompanyPartners[];
}

interface IViewProps {
	supplier: ISupplier;
}

export default function View({ supplier }: IViewProps) {
	const router = useRouter();

	const ultimaAtualizacao = dayjs(supplier.ultima_atualizacao).format('DD/MM/YYYY');

	const capitalToNumber = Number(supplier.capital_social);
	const capitalFormatted = new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	}).format(capitalToNumber);

	return (
		<Container>
			<Card>
				<TitleContainer>
					<h3>{supplier.nome}</h3>

					<Button text onClick={() => router.push('/fornecedores')} severity='secondary'>
						Voltar
					</Button>
				</TitleContainer>

				<SectionContainer>
					<SectionTitle>Informações</SectionTitle>

					<SectionInfos>
						<p>
							CNPJ: <strong>{supplier?.cnpj}</strong>
						</p>
						<p>
							Nome: <strong>{supplier?.nome}</strong>
						</p>
						<p>
							Nome Fantasia: <strong>{supplier?.nome_fantasia}</strong>
						</p>
						<p>
							Natureza Jurídica: <strong>{supplier?.natureza_juridica}</strong>
						</p>
						<p>
							Abertura: <strong>{supplier?.abertura}</strong>
						</p>
						<p>
							Tipo: <strong>{supplier?.tipo}</strong>
						</p>
						<p>
							Porte: <strong>{supplier?.porte}</strong>
						</p>
						<p>
							Situação:{' '}
							<strong
								style={{
									color: `${
										supplier.situacao === 'ATIVA' ? theme.colors.blue500 : theme.colors.yellow500
									}`,
								}}
							>
								{supplier?.situacao}
							</strong>
						</p>
						<p>
							Status: <strong>{supplier?.status}</strong>
						</p>
						<p>
							EFR: <strong>{supplier?.efr}</strong>
						</p>
						<p>
							Última atualização: <strong>{ultimaAtualizacao}</strong>
						</p>
						<p>
							Capital Social: <strong>{capitalFormatted}</strong>
						</p>
					</SectionInfos>

					<SectionInfos>
						<SectionTitle>Contato</SectionTitle>
						<p>
							E-mail: <strong>{supplier?.email}</strong>
						</p>
						<p>
							Telefone: <strong>{supplier?.telefone}</strong>
						</p>
					</SectionInfos>

					<SectionInfos>
						<SectionTitle>Endereço</SectionTitle>
						<p>
							Logradouro: <strong>{supplier?.logradouro}</strong>
						</p>
						<p>
							Número: <strong>{supplier?.numero}</strong>
						</p>
						<p>
							Complemento: <strong>{supplier?.complemento}</strong>
						</p>
						<p>
							CEP: <strong>{supplier?.cep}</strong>
						</p>
						<p>
							Bairro: <strong>{supplier?.bairro}</strong>
						</p>
						<p>
							Município: <strong>{supplier?.municipio}</strong>
						</p>
						<p>
							UF: <strong>{supplier?.uf}</strong>
						</p>
					</SectionInfos>

					<SectionInfos>
						<SectionTitle>Situação</SectionTitle>
						<p>
							Data situação: <strong>{supplier?.data_situacao}</strong>
						</p>
						<p>
							Motivo Situação: <strong>{supplier?.motivo_situacao}</strong>
						</p>
						<p>
							Data Situação Especial: <strong>{supplier?.data_situacao_especial}</strong>
						</p>
					</SectionInfos>

					<SectionInfos>
						<SectionTitle>Atividades</SectionTitle>

						{supplier.companyActivities.map((activity) => {
							return (
								<ActivitiesContainer key={activity.id}>
									<p>
										Descrição / Cod:{' '}
										<strong>
											{activity.activity_description} / {activity.activity_code}
										</strong>
									</p>
									{activity.activity_type === 'PRINCIPAL' && (
										<PrincipalTag className='activity-tooltipe'>P</PrincipalTag>
									)}
									<Tooltip target='.activity-tooltipe'>Atividade Principal</Tooltip>
								</ActivitiesContainer>
							);
						})}
					</SectionInfos>

					<SectionInfos>
						<SectionTitle>Quadro Societário</SectionTitle>

						{supplier.companyPartners.map((partner) => {
							return (
								<PartnersContainer key={partner.id}>
									<p>
										Nome: <strong>{partner.nome}</strong>
									</p>
									<p>
										Qualificação: <strong>{partner.qualificacao_socio}</strong>
									</p>
									<p>
										Pais de origem: <strong>{partner.pais_origem}</strong>
									</p>
									<p>
										Representante legal: <strong>{partner.nome_rep_legal}</strong>
									</p>
									<p>
										Qualificação do Representante Legal: <strong>{partner.qual_rep_legal}</strong>
									</p>
								</PartnersContainer>
							);
						})}
					</SectionInfos>
				</SectionContainer>
			</Card>
		</Container>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [],
		fallback: 'blocking',
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const cnpj = String(params?.cnpj);

	const supplier = await prisma.company.findUnique({
		where: {
			cnpj: cnpjMask(cnpj),
		},
		include: {
			companyActivities: true,
			companyPartners: true,
		},
	});

	if (!supplier) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			supplier: JSON.parse(JSON.stringify(supplier)),
		},
	};
};
