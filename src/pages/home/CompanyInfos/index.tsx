import { Accordion, AccordionTab } from 'primereact/accordion';

import { CompanyInfosContainer } from './styles';

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

interface CompanyInfosProps {
	company: ICnpjConsultResponse;
}

export function CompanyInfos({ company }: CompanyInfosProps) {
	return (
		<CompanyInfosContainer>
			<strong>Informações sobre a empresa</strong>
			<p>
				Nome: <strong>{company.nome}</strong>
			</p>
			<p>
				CNPJ: <strong>{company?.cnpj}</strong>
			</p>
			<p>
				Nome Fantasia: <strong>{company?.fantasia}</strong>
			</p>
			<p>
				Email: <strong>{company?.email}</strong>
			</p>
			<p>
				Telefone: <strong>{company?.telefone}</strong>
			</p>
			<p>
				Situação: <strong>{company?.situacao}</strong>
			</p>
			<p>
				Status: <strong>{company?.status}</strong>
			</p>
			<p>
				Atividade Principal: <strong>{company?.atividade_principal[0].text}</strong>
			</p>

			<hr />

			<Accordion activeIndex={0}>
				<AccordionTab header='Mais informações'>
					<strong>Endereço:</strong>
					<p>
						Bairro: <strong>{company?.bairro}</strong>
					</p>
					<p>
						Logradouro: <strong>{company?.logradouro}</strong>
					</p>
					<p>
						Numero: <strong>{company?.numero}</strong>
					</p>
					<p>
						CEP: <strong>{company?.cep}</strong>
					</p>
					<p>
						Município: <strong>{company?.municipio}</strong>
					</p>
					<p>
						UF: <strong>{company?.uf}</strong>
					</p>
					<Accordion activeIndex={1}>
						<AccordionTab header='Outras informações'>
							<p>
								Data situação: <strong>{company?.data_situacao}</strong>
							</p>
							<p>
								Data abertura: <strong>{company?.abertura}</strong>
							</p>
							<p>
								Natureza jurídica: <strong>{company?.natureza_juridica}</strong>
							</p>
							<p>
								Útilma atualização:{' '}
								<strong>{new Date(company?.ultima_atualizacao).toDateString()}</strong>
							</p>
							<p>
								Capital social: <strong>{company?.capital_social}</strong>
							</p>
						</AccordionTab>
					</Accordion>
					<Accordion activeIndex={3}>
						<AccordionTab header='Atividades secundárias'>
							<div>
								<strong>Atividades secundárias: </strong>
								{company.atividades_secundarias.map((atividade) => {
									return (
										<p key={atividade.code}>
											Atividade: <strong>{atividade.text}</strong>;
										</p>
									);
								})}
							</div>
						</AccordionTab>
					</Accordion>

					<Accordion activeIndex={4}>
						<AccordionTab header='Quadro Societário'>
							<div>
								{company.qsa.map((quadro) => {
									return (
										<div key={quadro.nome}>
											<p>
												Nome: <strong>{quadro.nome}</strong>
											</p>
											<p>
												Qualificação: <strong>{quadro.qual}</strong>
											</p>
										</div>
									);
								})}
							</div>
						</AccordionTab>
					</Accordion>
				</AccordionTab>
			</Accordion>
		</CompanyInfosContainer>
	);
}
