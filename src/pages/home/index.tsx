import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { Suspense, useContext, useState } from 'react';
import { CompanyInfos } from './CompanyInfos';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card } from '@/components/Card';
import { api } from '@/lib/axios/baseApi';
import { CompanyForm } from './CompanyForm';
import { ICnpjConsultResponse } from '@/@types';
import { ShowErrorRequest } from '@/utils/ShowErrorRequest';
import { ShowSuccessRequest } from '@/utils/ShowSuccessRequest';
import { RevalidateSuppliersContext } from '@/contexts/RevalidateSuppliersContext';

import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { BlockUI } from 'primereact/blockui';
import { InputText } from 'primereact/inputtext';

import {
	HomeContainer,
	SearchContainer,
	LabelGroup,
	CompanyContainer,
	CompanyInfosContainer,
	CompanyFormContainer,
	InfoAlert,
} from './styles';

const formSchema = z.object({
	cnpj: z
		.string({ required_error: 'Campo obrigatório' })
		.min(18, { message: 'O CNPJ informado deve conter 14 digitos' })
		.transform((value) => value.replace(/[^0-9]+/g, '')),
});

type FormInputs = z.infer<typeof formSchema>;

export default function Home() {
	const {
		handleSubmit,
		register,
		getValues,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<FormInputs>({
		resolver: zodResolver(formSchema),
	});

	const { transactionControl } = useContext(RevalidateSuppliersContext);

	const [actionLoading, setActionLoading] = useState(false);
	const [invalidCnpjInfo, setInvalidCnpjInfo] = useState(false);
	const [searchResult, setSearchResult] = useState<ICnpjConsultResponse>();

	async function handleSearchForm(data: FormInputs) {
		try {
			setActionLoading(true);

			const { data: result } = await api.get('/consultCnpj', {
				params: {
					cnpj: data.cnpj,
				},
			});

			if (result.status === 'ERROR') {
				setInvalidCnpjInfo(true);
				setActionLoading(false);
				return;
			}

			setInvalidCnpjInfo(false);
			setSearchResult(result);
			setActionLoading(false);
		} catch (error) {
			setActionLoading(false);
			console.log(error);
		}
	}

	async function handleCreateCompany() {
		try {
			setActionLoading(true);
			const { data: dataResult } = await api.post('/suppliers/create', {
				cnpj: getValues('cnpj'),
			});

			setActionLoading(false);
			setSearchResult(undefined);
			ShowSuccessRequest(dataResult);
		} catch (error) {
			setActionLoading(false);
			ShowErrorRequest(error);
		}
	}

	return (
		<HomeContainer>
			<Card>
				<form onSubmit={handleSubmit(handleSearchForm)}>
					<SearchContainer>
						<LabelGroup>
							<label htmlFor='search'>Consultar CNPJ</label>
							<span className='p-input-icon-left'>
								{actionLoading ? (
									<i className='pi pi-spin pi-spinner' />
								) : (
									<i className='pi pi-search' />
								)}

								<InputText
									id='search'
									aria-describedby='search-help'
									placeholder='99.999.999/0009-99'
									maxLength={18}
									value={watch('cnpj')}
									onChangeCapture={(e) => {
										// @ts-ignore
										e.target.value = e.target.value.normalize('NFD').replace(/[^0-9]/g, '');
									}}
									{...register('cnpj')}
								/>
							</span>
						</LabelGroup>

						<Button
							type='submit'
							label='Consultar'
							size='small'
							style={{ height: 45 }}
							disabled={isSubmitting || transactionControl?.status === 'ATUALIZANDO'}
						/>
					</SearchContainer>
					{errors.cnpj && <small style={{ color: '#ff6259' }}>*{errors.cnpj.message}</small>}
				</form>

				{invalidCnpjInfo && (
					<InfoAlert>
						<Message severity='info' text='CNPJ Inválido!' />
					</InfoAlert>
				)}
			</Card>

			{!!searchResult && !invalidCnpjInfo && (
				<Suspense fallback={<i className='pi pi-spin pi-spinner' style={{ fontSize: '2rem' }}></i>}>
					<Card>
						<CompanyContainer>
							<CompanyInfosContainer>
								<CompanyInfos company={searchResult} />
								<div className='card flex flex-wrap justify-content-center gap-3'>
									<Button
										type='button'
										label='Salvar CNPJ'
										size='small'
										style={{ height: 45 }}
										disabled={isSubmitting || actionLoading}
										loading={actionLoading}
										onClick={() => handleCreateCompany()}
									/>
								</div>
							</CompanyInfosContainer>

							<BlockUI blocked>
								<CompanyFormContainer>
									<CompanyForm company={searchResult} />
								</CompanyFormContainer>
							</BlockUI>
						</CompanyContainer>
					</Card>
				</Suspense>
			)}
		</HomeContainer>
	);
}
