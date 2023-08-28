import { CheckCircle, X } from 'lucide-react';

import { Container, ProgressIndicator, ProgressRoot, ProgressGroup, Title } from './styles';

interface IProps {
	progress: number;
	progressDuration: number;
	progressTitle?: string;
	onCloseCard: () => void;
}

export function ProgressBar({ progress, progressDuration, progressTitle, onCloseCard }: IProps) {
	return (
		<Container>
			<Title>
				<span>{progressTitle}</span>

				{progress >= 100 ? (
					<button onClick={() => onCloseCard()}>
						<X size={16} strokeWidth={3} />
					</button>
				) : (
					<small>Tempo estimado: {progressDuration / 1000} s</small>
				)}
			</Title>
			<ProgressGroup>
				<ProgressRoot value={progress}>
					<ProgressIndicator style={{ transform: `translateX(-${100 - progress}%)` }} />
				</ProgressRoot>

				{progress >= 100 ? <CheckCircle /> : <span>{progress}%</span>}
			</ProgressGroup>
		</Container>
	);
}
