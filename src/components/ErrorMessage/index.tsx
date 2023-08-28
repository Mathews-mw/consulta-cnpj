import { FieldError } from 'react-hook-form';
import { ErrorMessageContainer } from './styles';

interface IErrorMessageProps {
	error?: FieldError;
	erroMessage?: string;
}

export function ErrorMessage({ error, erroMessage }: IErrorMessageProps) {
	if (error) {
		return <ErrorMessageContainer>{error.message}</ErrorMessageContainer>;
	}

	return <ErrorMessageContainer>{erroMessage}</ErrorMessageContainer>;
}
