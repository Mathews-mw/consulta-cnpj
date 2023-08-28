import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { api } from '@/lib/axios/baseApi';
import { queryClient } from '@/lib/queryClient';
import { TransactionControl } from '@prisma/client';
import { ShowErrorRequest } from '@/utils/ShowErrorRequest';
import { createContext, ReactNode, useEffect, useState, useRef } from 'react';

interface ITransactionControlResponse {
	message: string;
	transactionControl: TransactionControl;
}

interface IProgressBarControl {
	estimatedTimeCycle: number;
	startTimeCycle: dayjs.Dayjs;
}

interface RevalidateSuppliersContextType {
	progress: number;
	transactionControl: TransactionControl | undefined;
	progressBarControl: IProgressBarControl | undefined;
	checkStatusTransactionControl: (
		transactionControl: TransactionControl,
		estimatedTime: number
	) => void;
	handlerEstimatedTimeCycle: (estimetedTime: number) => void;
	handlerClearRevalidateProcess: () => void;
}

export const RevalidateSuppliersContext = createContext({} as RevalidateSuppliersContextType);

export function RevalidateSuppliersContextProvider({ children }: { children: ReactNode }) {
	const [progress, setProgress] = useState(0);
	const [estimatedTimeCycle, setSstimatedTimeCycle] = useState(0);
	const [transactionControl, setTransactionControl] = useState<TransactionControl>();
	const [progressBarControl, setProgressBarControl] = useState<IProgressBarControl>();

	function handlerEstimatedTimeCycle(estimetedTime: number) {
		setSstimatedTimeCycle(estimetedTime);

		setProgressBarControl({
			estimatedTimeCycle: estimetedTime,
			startTimeCycle: dayjs(),
		});
	}

	function checkStatusTransactionControl(
		transactionControl: TransactionControl,
		estimatedTime: number
	) {
		setTransactionControl(transactionControl);

		setTimeout(() => {
			api
				.get<ITransactionControlResponse>('/transactionControl', {
					params: {
						transactionId: transactionControl.id,
					},
				})
				.then((response) => {
					setTransactionControl(response.data.transactionControl);
					return response.data;
				})
				.then((data) => {
					if (
						data.transactionControl.process_type === 'REVALIDACAO_FORNECEDOR' &&
						data.transactionControl.status === 'CONCLUIDA'
					) {
						toast('Atualização de fornecedores concluída com sucesso', {
							position: 'top-right',
							autoClose: 5000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							bodyStyle: {
								fontSize: 14,
							},
							theme: 'light',
							type: 'success',
						});
						queryClient.invalidateQueries(['suppliers']);
					}

					if (
						data.transactionControl.process_type === 'GERAR_RELATORIO' &&
						data.transactionControl.status === 'CONCLUIDA'
					) {
						toast('O Relatório está pronto para ser baixado', {
							position: 'top-right',
							autoClose: 5000,
							hideProgressBar: false,
							closeOnClick: true,
							pauseOnHover: true,
							draggable: true,
							bodyStyle: {
								fontSize: 14,
							},
							theme: 'light',
							type: 'success',
						});
						queryClient.invalidateQueries(['spreadsheets']);
					}
				})
				.catch((error) => {
					ShowErrorRequest(error);
				});
		}, estimatedTime);
	}

	function handlerClearRevalidateProcess() {
		setProgress(0);
		setSstimatedTimeCycle(0);
		setTransactionControl(undefined);
		setProgressBarControl(undefined);
	}

	const timer = useRef<NodeJS.Timer | number | undefined>();
	const interval = estimatedTimeCycle / 100;
	console.log('estimatedTimeCycle: ', estimatedTimeCycle);
	console.log('progress: ', progress);

	useEffect(() => {
		let progressIncrement = progress;

		if (interval > 0) {
			timer.current = setInterval(() => {
				progressIncrement += 1;

				if (progressIncrement >= 100) {
					progressIncrement = 100;

					clearInterval(timer.current);
				}

				setProgress(progressIncrement);
			}, interval);
		}

		return () => {
			if (timer.current) {
				clearInterval(timer.current);
				timer.current = 0;
			}
		};
	}, [timer, interval, estimatedTimeCycle]);

	return (
		<RevalidateSuppliersContext.Provider
			value={{
				progress,
				transactionControl,
				progressBarControl,
				checkStatusTransactionControl,
				handlerEstimatedTimeCycle,
				handlerClearRevalidateProcess,
			}}
		>
			{children}
		</RevalidateSuppliersContext.Provider>
	);
}
