import { styled } from '../../../styles';

export const Container = styled('div', {});

export const Form = styled('form', {
	display: 'flex',
	flexDirection: 'column',
	flexWrap: 'wrap',
	gap: '1rem',
});

export const LabelGroup = styled('div', {
	display: 'flex',
	flexDirection: 'column',
	gap: 2,
});

export const CheckBoxContent = styled('div', {
	display: 'flex',
	alignItems: 'center',
	gap: 8,
});
