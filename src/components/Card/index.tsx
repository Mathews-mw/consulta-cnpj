import { ReactNode } from 'react';
import { CardContainer } from './styles';

interface Props {
	children: ReactNode;
}

export function Card({ children }: Props) {
	return <CardContainer>{children}</CardContainer>;
}
