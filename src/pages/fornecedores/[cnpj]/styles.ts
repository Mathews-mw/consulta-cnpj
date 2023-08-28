import { styled } from '@/styles';

export const Container = styled('div', {});

export const TitleContainer = styled('div', {
	display: 'flex',
	justifyContent: 'space-between',
	alignItems: 'center',
});

export const SectionContainer = styled('div', {
	display: 'flex',
	flexDirection: 'column',
});

export const SectionTitle = styled('h5', {
	fontWeight: 'bold',
	fontSize: 16,
	color: '$gray500',

	margin: '1rem 0 0.5rem',

	borderBottom: 'solid 1px $gray300',
});

export const SectionInfos = styled('div', {
	display: 'flex',
	flexDirection: 'column',

	lineHeight: '200%',
});

export const ActivitiesContainer = styled('div', {
	display: 'flex',
	alignItems: 'center',
	gap: 5,
});

export const PrincipalTag = styled('span', {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',

	width: 18,
	height: 18,

	background: '$primary500',
	color: '$gray100',
	borderRadius: '50%',

	fontSize: 10,
	fontWeight: 'bold',

	cursor: 'pointer',
});

export const PartnersContainer = styled('div', {});
