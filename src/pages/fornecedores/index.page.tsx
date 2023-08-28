import qs from 'qs';
import { theme } from '@/styles';
import debounce from 'lodash/debounce';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { ChangeEvent, useCallback, useContext, useEffect, useState } from 'react';
import DataTable, { ConditionalStyles, TableColumn } from 'react-data-table-component';

import { Company } from '@prisma/client';
import { Card } from '@/components/Card';
import { api } from '@/lib/axios/baseApi';
import { cnpjMask } from '@/utils/cnpj-mask';
import { queryClient } from '@/lib/queryClient';
import { ShowErrorRequest } from '@/utils/ShowErrorRequest';
import { ProgressBar } from '@/components/Feedback/ProgressBar';
import { ShowSuccessRequest } from '@/utils/ShowSuccessRequest';
import { RevalidateSuppliersContext } from '@/contexts/RevalidateSuppliersContext';

import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { InputText } from 'primereact/inputtext';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { ShowInfoRequest } from '@/utils/ShowInfoRequest';
import { ProgressSpinner } from 'primereact/progressspinner';

import { Edit, Info, RefreshCcw, Trash2 } from 'lucide-react';
import {
	ActionsButtonsContainer,
	Container,
	ContextComponentContaier,
	LabelGroup,
	ProgressContainer,
	SearchContainer,
	SituationCellContainer,
	TitleContainer,
} from './styles';

interface Selected<U> {
	allSelected: boolean;
	selectedCount: number;
	selectedRows: U[];
}

const paramsSearchType = [
	{ key: 'companyName', label: 'Fornecedor' },
	{ key: 'companyCnpj', label: 'CNPJ' },
];

export default function Fornecedores() {
	const router = useRouter();
	const {
		progress,
		transactionControl,
		progressBarControl,
		handlerClearRevalidateProcess,
		checkStatusTransactionControl,
		handlerEstimatedTimeCycle,
	} = useContext(RevalidateSuppliersContext);

	const [actionLoading, setActionLoading] = useState(false);

	const [inputValue, setInputValue] = useState('');
	const [delayQuerySearch, setDelayQuerySearch] = useState('');
	const [selectedRows, setSelectedRows] = useState<Company[]>([]);
	const [supplierToDelete, setSupplierToDelete] = useState<string | undefined>(undefined);
	const [selectParamsSearchType, setSelectParamsSearchType] = useState(paramsSearchType[0].key);
	const [supplierToRevalidateConfirmDialog, setSupplierToRevalidateConfirmDialog] = useState(false);

	const handleRowSelected = useCallback((state: Selected<Company>) => {
		setSelectedRows(state.selectedRows);
	}, []);

	const { data: companiesData, isFetching } = useQuery<Company[]>(
		['suppliers', delayQuerySearch],
		async () => {
			let params = {};

			if (selectParamsSearchType === 'companyName') {
				params = {
					companyName: delayQuerySearch,
				};
			}

			if (selectParamsSearchType === 'companyCnpj') {
				params = {
					companyCnpj: delayQuerySearch,
				};
			}

			const { data } = await api.get('/suppliers', {
				params,
			});

			return data;
		}
	);

	const querySearchDebounce = useCallback(
		// set timeout to function handleSearch to be executed
		debounce((value) => setDelayQuerySearch(value), 1000),
		[]
	);

	function handleSearch(event: ChangeEvent<HTMLInputElement>) {
		setInputValue(event.target.value);

		querySearchDebounce(event.target.value);
	}

	async function handlerDeleteSupplier(id: string) {
		try {
			setActionLoading(true);

			const { data } = await api.delete(`/suppliers/${id}/delete`);

			ShowSuccessRequest(data);
			queryClient.invalidateQueries(['suppliers']);
			setDelayQuerySearch('');
			setActionLoading(false);
		} catch (error) {
			setActionLoading(false);
			ShowErrorRequest(error);
		}
	}

	async function handlerRevalidateSupplier() {
		try {
			setActionLoading(true);

			const cnpjs = selectedRows.map((supplier) => supplier.cnpj);
			const { data } = await api.put(`/suppliers/revalidateInfos`, {
				cnpjs,
			});

			ShowInfoRequest(data);

			handlerEstimatedTimeCycle((selectedRows.length / 3) * 60000);
			checkStatusTransactionControl(data.transactionControl, (selectedRows.length / 3) * 60000);
			setDelayQuerySearch('');

			queryClient.invalidateQueries(['suppliers']);
			setActionLoading(false);
		} catch (error) {
			setActionLoading(false);
			ShowErrorRequest(error);
		}
	}

	async function handlerGenerateReport() {
		try {
			setActionLoading(true);

			const cnpjs = selectedRows.map((supplier) => supplier.cnpj);

			const { data, headers } = await api.get('/reports', {
				responseType: 'blob',
				params: {
					cnpjs,
				},
				paramsSerializer: {
					serialize: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
				},
			});

			const fileTest = new File([data], 'testeFile', {
				type: data.type,
			});

			const url = URL.createObjectURL(fileTest);
			const a = document.createElement('a');
			a.href = url;
			a.download = headers.filename;
			document.body.appendChild(a);
			a.click();
			a.remove();

			setActionLoading(false);
			ShowSuccessRequest('ok');
		} catch (error) {
			setActionLoading(false);
			ShowErrorRequest(error);
		}
	}

	useEffect(() => {
		// clear debounce values
		return () => {
			querySearchDebounce.cancel();
		};
	}, [querySearchDebounce]);

	const columns: TableColumn<Company>[] = [
		{
			name: 'Fornecedor',
			cell: (row) => row.nome,
		},
		{
			name: 'CNPJ',
			cell: (row) => row.cnpj,
		},
		{
			name: 'Situação',
			center: true,
			cell: (row) => (
				<SituationCellContainer>
					<span>{row.situacao}</span>
					<Tooltip target='.pi-info-circle' />
					{!!row.situacao_especial && (
						<i
							className='pi pi-info-circle'
							data-pr-tooltip={row.situacao_especial!}
							data-pr-position='bottom'
							style={{ cursor: 'pointer', color: `${theme.colors.orange500}` }}
						></i>
					)}
				</SituationCellContainer>
			),
			selector: (row) => row.situacao!,
			conditionalCellStyles: [
				{
					when: (row) => row.situacao === 'ATIVA',
					style: {
						color: theme.colors.blue500,
						fontWeight: 'bold',
					},
				},
				{
					when: (row) => row.situacao === 'BAIXADA',
					style: {
						color: theme.colors.red500,
						fontWeight: 'bold',
					},
				},
			],
		},
		{
			name: 'Tipo',
			cell: (row) => row.tipo,
			compact: true,
			grow: 0,
		},
		{
			name: 'UF',
			cell: (row) => row.uf,
			compact: true,
			grow: 0,
			width: '50px',
		},
		{
			name: 'Natureza Jurídica',
			cell: (row) => row.natureza_juridica,
		},
		{
			name: 'Ações',
			center: true,
			cell: (row) => (
				<ActionsButtonsContainer>
					<Button
						className='view'
						icon={<Info size={18} />}
						rounded
						text
						aria-label='view infos'
						size='small'
						severity='info'
						disabled={actionLoading || transactionControl?.status === 'ATUALIZANDO'}
						tooltip='Visualizar fornecedor'
						tooltipOptions={{ position: 'bottom' }}
						onClick={() => router.push(`/fornecedores/${row.cnpj.replace(/[^0-9]+/g, '')}`)}
					/>
					<Button
						className='edit'
						icon={<Edit size={18} />}
						rounded
						text
						aria-label='Edit'
						size='small'
						disabled={actionLoading || transactionControl?.status === 'ATUALIZANDO'}
						tooltip='Editar informações'
						tooltipOptions={{ position: 'bottom' }}
					/>
					<Button
						className='delete'
						icon={<Trash2 size={18} />}
						rounded
						text
						aria-label='Delete'
						size='small'
						severity='danger'
						tooltip='Deletar fornecedor'
						tooltipOptions={{ position: 'bottom' }}
						disabled={actionLoading || transactionControl?.status === 'ATUALIZANDO'}
						onClick={() => setSupplierToDelete(row.id)}
					/>
				</ActionsButtonsContainer>
			),
		},
	];

	const conditionalRowStyles: ConditionalStyles<Company>[] = [
		{
			when: (row) => !!row.situacao_especial,
			style: {
				opacity: 0.5,
			},
		},
	];

	return (
		<>
			<Container>
				<Card>
					<TitleContainer>
						<h1>Fornecedores cadastrados</h1>
						{actionLoading && <ProgressSpinner style={{ width: '50px', height: '50px' }} />}
					</TitleContainer>

					<SearchContainer>
						<LabelGroup>
							<label htmlFor='search'>
								{paramsSearchType.map((type) => {
									return (
										<Chip
											key={type.key}
											label={type.label}
											className={type.key === selectParamsSearchType ? 'active' : ''}
											onClick={() => setSelectParamsSearchType(type.key)}
										/>
									);
								})}
							</label>
							<span className='p-input-icon-left'>
								{isFetching ? (
									<i className='pi pi-spin pi-spinner' />
								) : (
									<i className='pi pi-search' />
								)}

								<InputText
									id='search'
									aria-describedby='search-help'
									placeholder='Pesquise por um fornecedor'
									value={
										selectParamsSearchType === 'companyCnpj' ? cnpjMask(inputValue) : inputValue
									}
									onChange={(e) => handleSearch(e)}
								/>
							</span>
						</LabelGroup>
					</SearchContainer>

					{progress > 0 &&
						!!transactionControl &&
						transactionControl.process_type === 'REVALIDACAO_FORNECEDOR' && (
							<ProgressContainer>
								<ProgressBar
									progressDuration={progressBarControl?.estimatedTimeCycle!}
									progress={progress}
									progressTitle='Progresso de atualização dos fornecedores'
									onCloseCard={() => handlerClearRevalidateProcess()}
								/>
							</ProgressContainer>
						)}

					<DataTable<Company>
						columns={columns}
						data={companiesData!}
						title='Tabela de Fornecedores'
						responsive
						persistTableHead
						pagination
						striped
						conditionalRowStyles={conditionalRowStyles}
						progressPending={isFetching}
						progressComponent={<ProgressSpinner style={{ width: '50px', height: '50px' }} />}
						selectableRows
						onSelectedRowsChange={handleRowSelected}
						noDataComponent={<span style={{ margin: 40 }}>Nenhum registro foi encontrado</span>}
						contextComponent={
							<ContextComponentContaier>
								<span>
									{selectedRows.length}{' '}
									{selectedRows.length < 2 ? 'item selecionado' : 'itens selecionados'}
								</span>

								<div>
									<Button
										icon={<RefreshCcw size={18} />}
										rounded
										text
										aria-label='Revalidar'
										size='small'
										severity='info'
										tooltip='Revalidar fornecedores'
										tooltipOptions={{ position: 'bottom' }}
										disabled={actionLoading || transactionControl?.status === 'ATUALIZANDO'}
										onClick={() => setSupplierToRevalidateConfirmDialog(true)}
									/>
									<Button
										icon={<i className='pi pi-file-excel' style={{ fontSize: '1.2rem' }}></i>}
										rounded
										aria-label='Delete'
										severity='success'
										text
										tooltip='Download planilha de relatório'
										tooltipOptions={{ position: 'bottom' }}
										disabled={actionLoading || transactionControl?.status === 'ATUALIZANDO'}
										onClick={() => handlerGenerateReport()}
									/>
								</div>
							</ContextComponentContaier>
						}
						contextMessage={{
							singular: 'item',
							plural: 'itens',
							message: selectedRows.length < 2 ? 'selecionado' : 'selecionados',
						}}
						paginationComponentOptions={{
							rowsPerPageText: 'Linhas por página',
							rangeSeparatorText: 'de',
							selectAllRowsItem: true,
							selectAllRowsItemText: 'Todos',
						}}
					/>
				</Card>
			</Container>

			{!!supplierToDelete && (
				<ConfirmDialog
					visible={!!supplierToDelete}
					onHide={() => setSupplierToDelete(undefined)}
					message='Tem certeza que deseja remover esse fornecedor?'
					header='Deletar fornecedor'
					icon='pi pi-exclamation-triangle'
					acceptClassName='p-button-danger'
					accept={() => handlerDeleteSupplier(supplierToDelete)}
				/>
			)}

			<ConfirmDialog
				visible={!!supplierToRevalidateConfirmDialog}
				onHide={() => setSupplierToRevalidateConfirmDialog(false)}
				message={`Deseja atualizas as informaçãoes de ${selectedRows.length} fornecedores selecionados?`}
				header='Revalidar informações de fornecedores'
				icon='pi pi-info-circle'
				accept={() => handlerRevalidateSupplier()}
			/>
		</>
	);
}
