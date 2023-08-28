import Link from 'next/link';
import { useRef } from 'react';

import { Menu } from 'primereact/menu';
import { useRouter } from 'next/router';
import { Tooltip } from 'primereact/tooltip';
import { MenuItem } from 'primereact/menuitem';

import { HeaderContainer, LogoContainer, Logo, NavContainer } from './styles';

export function Header() {
	const router = useRouter();

	const menu = useRef<Menu>(null);
	const items: MenuItem[] = [
		{
			label: 'Consultas',
			items: [
				{
					label: 'Fornecedores cadastrados',
					icon: 'pi pi-building',
					command: () => {
						router.push('/fornecedores');
					},
				},
				{
					label: 'Upload CSV',
					icon: 'pi pi-file-import',
					command: () => {
						router.push('/upload-csv');
					},
				},
			],
		},
	];

	return (
		<HeaderContainer>
			<LogoContainer>
				<Link href='/'>
					<Logo>KAYE</Logo>
				</Link>
				<Tooltip target='.home-tooltipe' position='bottom'>
					Home
				</Tooltip>
			</LogoContainer>

			<NavContainer>
				<Tooltip target='.suppliers-tooltipe' position='bottom'>
					Menu fornecedores
				</Tooltip>
				<i
					className='pi pi-briefcase suppliers-tooltipe'
					style={{ fontSize: '1.5rem' }}
					onClick={(e) => menu?.current?.toggle(e)}
				>
					<Menu model={items} popup ref={menu} />
				</i>

				<Tooltip target='.user-tooltipe' position='bottom'>
					Menu usuário
				</Tooltip>
				<i className='pi pi-user user-tooltipe' style={{ fontSize: '1.5rem' }}></i>

				<Tooltip target='.config-tooltipe' position='bottom'>
					Configurações
				</Tooltip>
				<i className='pi pi-cog config-tooltipe' style={{ fontSize: '1.5rem' }}></i>
			</NavContainer>
		</HeaderContainer>
	);
}
