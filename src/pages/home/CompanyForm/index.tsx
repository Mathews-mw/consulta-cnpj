import { z } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from 'primereact/button';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';

import { CheckBoxContent, LabelGroup, Container, Form } from './styles';
import { api } from '@/lib/axios/baseApi';

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

interface CompanyFormProps {
	company: ICnpjConsultResponse;
}

const formSchema = z.object({
	name: z.string(),
	phone: z.string(),
	cellphone: z.string(),
});

type FormInputs = z.infer<typeof formSchema>;

export function CompanyForm({ company }: CompanyFormProps) {
	const { handleSubmit, register } = useForm<FormInputs>({
		resolver: zodResolver(formSchema),
	});

	const categories = [
		{ name: 'Contrato Vigente', key: 1 },
		{ name: 'Contrato Encerrado', key: 1 },
		{ name: 'Proposta técnica comercial', key: 1 },
		{ name: 'Cabeamento mat.', key: 1 },
		{ name: 'Cabeamento serv.', key: 1 },
		{ name: 'Rede Wi-Fi mat.', key: 1 },
		{ name: 'Rede Wi-Fi serv.', key: 1 },
		{ name: 'Periférico', key: 1 },
		{ name: 'Switch', key: 1 },
		{ name: 'Sistemas', key: 1 },
		{ name: 'Data Center', key: 1 },
		{ name: 'Nobreaks', key: 1 },
		{ name: 'Moving', key: 1 },
		{ name: 'CFTV mat.', key: 1 },
		{ name: 'CFTV serv.', key: 1 },
	];

	const [selectedCategories, setSelectedCategories] = useState<typeof categories>([]);

	const onCategoryChange = (e: CheckboxChangeEvent) => {
		let _selectedCategories = [...selectedCategories];

		if (e.checked) _selectedCategories.push(e.value);
		else
			_selectedCategories = _selectedCategories.filter(
				(category) => category.name !== e.value.name
			);

		setSelectedCategories(_selectedCategories);
	};

	async function handleCreateCompany(data: FormInputs) {
		console.log('form data: ', data);
		try {
			const { data: result } = await api.post('/company/create', {
				fornecedor: company.nome,
				nome_fantasia: company.fantasia,
				cnpj: company.cnpj,
				status_complice: company.situacao,
				...selectedCategories,
				...data,
			});

			console.log('result: ', result);
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<Container>
			<Form onSubmit={handleSubmit(handleCreateCompany)}>
				<LabelGroup>
					<label htmlFor='name' className='font-bold block'>
						Nome Contato
					</label>
					<InputText
						id='name'
						aria-describedby='search-help'
						placeholder='Pesquisar'
						{...register('name')}
					/>
				</LabelGroup>

				<LabelGroup>
					<label htmlFor='phone' className='font-bold block'>
						Telefone
					</label>
					<InputMask
						id='phone'
						mask='(99) 9999-9999'
						placeholder='(99) 9999-9999'
						{...register('phone')}
					></InputMask>
				</LabelGroup>

				<LabelGroup>
					<label htmlFor='cellphone' className='font-bold block'>
						Celular
					</label>
					<InputMask
						id='cellphone'
						mask='(99) 99999-9999'
						placeholder='(99) 99999-9999'
						{...register('cellphone')}
					></InputMask>
				</LabelGroup>

				<div>
					{categories.map((category) => {
						return (
							<CheckBoxContent key={category.name}>
								<Checkbox
									inputId={category.name}
									name='category'
									value={category}
									onChange={onCategoryChange}
									checked={selectedCategories.some((item) => item.name === category.name)}
								/>
								<label htmlFor={category.name}>{category.name}</label>
							</CheckBoxContent>
						);
					})}
				</div>
				<div>
					<Button label='Salvar' type='submit' disabled />
				</div>
			</Form>
		</Container>
	);
}
