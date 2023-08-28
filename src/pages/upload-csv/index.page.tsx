import qs from 'qs';
import { z } from 'zod';
import dayjs from 'dayjs';
import Papa from 'papaparse';
import { useQuery } from '@tanstack/react-query';
import { useContext, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { OverlayPanel } from 'primereact/overlaypanel';
import DataTable, { TableColumn } from 'react-data-table-component';

import { Card } from '@/components/Card';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/axios/baseApi';
import { Button } from 'primereact/button';
import { SpreadSheet } from '@prisma/client';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ShowInfoRequest } from '@/utils/ShowInfoRequest';
import { ShowErrorRequest } from '@/utils/ShowErrorRequest';
import { ProgressSpinner } from 'primereact/progressspinner';
import { RevalidateSuppliersContext } from '@/contexts/RevalidateSuppliersContext';

import { FileUp, Upload } from 'lucide-react';
import {
	Container,
	TitleContainer,
	FileContainer,
	ButtonsContainer,
	FileInfosContainer,
	ButtonUpload,
	FileStatusTag,
	UploadStatusContainer,
	OverlayContent,
} from './styles';
import { ShowSuccessRequest } from '@/utils/ShowSuccessRequest';

const MAX_FILE_SIZE = 50000;
const ACCEPTED_FILE_TYPES = ['text/csv'];
const uploadFormSchema = z.object({
	file: z
		.any()
		.refine((files) => files?.length === 1, 'Arquivo CSV é obrigatório.')
		.refine(
			(files) => files?.[0]?.size <= MAX_FILE_SIZE,
			`Tamanho máximodo suportado do arquivo é de 5MB.`
		)
		.refine(
			(files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type),
			'apenas o formato csv é aceito.'
		),
});

type uploadFormData = z.infer<typeof uploadFormSchema>;

export default function UploadCsv() {
	const {
		handleSubmit,
		register,
		formState: { errors, isSubmitting },
	} = useForm<uploadFormData>({
		resolver: zodResolver(uploadFormSchema),
	});

	const { progress, transactionControl, checkStatusTransactionControl, handlerEstimatedTimeCycle } =
		useContext(RevalidateSuppliersContext);

	const [actionLoading, setActionLoading] = useState(false);
	const [csvFile, setCsvFile] = useState<File>();
	const [csvParsedData, setCsvParsedData] = useState<any[]>([]);

	const overlayPanelRef = useRef(null);

	const { data: spreeadSheetsData, isFetching } = useQuery<SpreadSheet[]>(
		['spreadsheets'],
		async () => {
			const { data } = await api.get('/spreadsheets');

			return data;
		}
	);

	function handlerReadCsvFile(file: File) {
		setCsvFile(file);
		Papa.parse(file, {
			skipEmptyLines: true,
			delimiter: ';',
			complete: function (results) {
				setCsvParsedData(results.data);
			},
		});
	}

	async function handlerUploadFile(data: uploadFormData) {
		const config = {
			headers: { 'content-type': 'multipart/form-data' },
			onUploadProgress: (event: any) => {
				console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
			},
		};

		const formData = new FormData();

		try {
			setActionLoading(true);

			formData.append('file', data.file[0]);
			const { data: dataResult } = await api.post('/importCnpj', formData, config);

			handlerEstimatedTimeCycle((csvParsedData[0].length / 3) * 60000);
			checkStatusTransactionControl(
				dataResult.transactionControl,
				(csvParsedData[0].length / 3) * 60000
			);
			setActionLoading(false);
			ShowInfoRequest(dataResult);
		} catch (error) {
			setActionLoading(false);
			ShowErrorRequest(error);
		}
	}

	async function handlerGenerateReport() {
		try {
			setActionLoading(true);

			const { data, headers } = await api.get('/importCnpj', {
				responseType: 'blob',
				params: {
					cnpjs: csvParsedData[0],
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

	function handlerDownloadSingleReport(fileName: string) {
		const a = document.createElement('a');
		a.href = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/relatorios/${fileName}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}

	const columns: TableColumn<SpreadSheet>[] = [
		{
			name: 'Nome do arquivo',
			cell: (row) => row.file_name,
			grow: 1,
		},
		{
			name: 'Data do relatório',
			cell: (row) => dayjs(row.created_at).format('DD/MM/YYYY [às] HH:mm:ss'),
			center: true,
		},
		{
			name: 'Download',
			cell: (row) => (
				<Button
					icon={<i className='pi pi-file-excel' style={{ fontSize: '1.2rem' }}></i>}
					rounded
					aria-label='download'
					severity='success'
					text
					tooltip='download relatório'
					tooltipOptions={{ position: 'bottom' }}
					disabled={actionLoading || isSubmitting}
					onClick={() => handlerDownloadSingleReport(row.file_name)}
				/>
			),
			center: true,
		},
	];

	return (
		<Container>
			<Card>
				<TitleContainer>
					<h1>Upload CSV</h1>
					<Button
						type='button'
						icon={<i className='pi pi-info-circle' style={{ fontSize: '1.2rem' }}></i>}
						text
						severity='info'
						// @ts-ignore
						onClick={(e) => overlayPanelRef.current.toggle(e)}
					/>
					<OverlayPanel ref={overlayPanelRef}>
						<OverlayContent>
							<p>
								Baixe o{' '}
								<a href={`${process.env.NEXT_PUBLIC_APP_BASE_URL}/relatorios/modelo.csv`}>modelo</a>{' '}
								para ver o exemplo de arquivo aceito na aplicação para fazer o upload.
							</p>
						</OverlayContent>
					</OverlayPanel>

					{actionLoading && <ProgressSpinner style={{ width: '50px', height: '50px' }} />}
				</TitleContainer>

				<form onSubmit={handleSubmit(handlerGenerateReport)}>
					<FileContainer>
						<ButtonsContainer>
							<div className='btns-group'>
								<ButtonUpload>
									<Upload size={22} />
									Carregar arquivo
									<input
										hidden
										accept='text/csv'
										type='file'
										// @ts-ignore
										onChangeCapture={(e) => handlerReadCsvFile(e.target.files[0])}
										disabled={
											actionLoading || isSubmitting || transactionControl?.status === 'ATUALIZANDO'
										}
										{...register('file')}
									/>
								</ButtonUpload>
								<Button
									type='submit'
									label='Enviar'
									disabled={
										actionLoading || isSubmitting || transactionControl?.status === 'ATUALIZANDO'
									}
								/>
							</div>

							{progress > 0 &&
								!!transactionControl &&
								transactionControl.process_type === 'GERAR_RELATORIO' && (
									<UploadStatusContainer>
										<div className='group'>
											{transactionControl.status === 'ATUALIZANDO' && (
												<ProgressSpinner style={{ width: '25px', height: '25px', margin: 0 }} />
											)}
											<FileStatusTag
												severity={
													transactionControl.status === 'ATUALIZANDO' ? 'processing' : 'sucess'
												}
											>
												{progress}%
											</FileStatusTag>
										</div>
										{transactionControl.status === 'ATUALIZANDO' ? (
											<small>Relatório está sendo gerado</small>
										) : (
											<small>Relatório pronto para ser baixado</small>
										)}
									</UploadStatusContainer>
								)}
						</ButtonsContainer>

						{!!csvFile && (
							<FileInfosContainer>
								<FileUp strokeWidth={1} />
								<div className='infos'>
									<span>{csvFile.name}</span>
									<span>{csvFile.size} bytes</span>
								</div>
							</FileInfosContainer>
						)}

						{errors.file && <ErrorMessage erroMessage={errors.file.message?.toString()} />}
					</FileContainer>
				</form>
			</Card>

			<Card>
				<DataTable<SpreadSheet>
					columns={columns}
					data={spreeadSheetsData!}
					title='Relatórios gerados'
					responsive
					persistTableHead
					pagination
					striped
					progressPending={isFetching}
					progressComponent={<ProgressSpinner style={{ width: '50px', height: '50px' }} />}
					noDataComponent={<span style={{ margin: 40 }}>Nenhum registro foi encontrado</span>}
					paginationComponentOptions={{
						rowsPerPageText: 'Linhas por página',
						rangeSeparatorText: 'de',
						selectAllRowsItem: true,
						selectAllRowsItemText: 'Todos',
					}}
				/>
			</Card>
		</Container>
	);
}
