import '../lib/dayjs';

import '../lib/prime-react';
import 'primeicons/primeicons.css';
import 'react-toastify/dist/ReactToastify.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';

import { globalStyles } from '@/styles/global';
import type { AppProps } from 'next/app';
import { Container } from '@/styles/app.styles';
import { Header } from '@/components/Header';
import { ToastContainer } from 'react-toastify';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevalidateSuppliersContextProvider } from '@/contexts/RevalidateSuppliersContext';

globalStyles();
export default function App({ Component, pageProps }: AppProps) {
	return (
		<QueryClientProvider client={queryClient}>
			<RevalidateSuppliersContextProvider>
				<Container>
					<Header />
					<Component {...pageProps} />
					<ToastContainer />
				</Container>
			</RevalidateSuppliersContextProvider>
			<ReactQueryDevtools />
		</QueryClientProvider>
	);
}
