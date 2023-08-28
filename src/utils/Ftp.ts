import * as Ftp from 'basic-ftp';
import { Readable } from 'stream';
import PromiseFtp from 'promise-ftp';
import { NextApiResponse } from 'next';

const ShowFTP = async (filename: string, res: NextApiResponse) => {
	try {
		const ftpClient = new PromiseFtp();

		await ftpClient.connect({
			host: `${process.env.FTP_IP}`,
			user: `${process.env.FTP_USER}`,
			password: `${process.env.FTP_PASS}`,
			port: Number(`${process.env.FTP_PORT}`),
		});

		const stream = await ftpClient.get(`${process.env.FTP_URL}/${filename}`);

		await new Promise((resolve, reject) => {
			res.on('finish', resolve);
			stream.once('error', reject);
			stream.pipe(res);
		});

		return ftpClient.end();
	} catch (err) {
		console.error(err);
		return res.status(404).json({ error: err });
	}
};

const SaveFTP = async (imageFile: any) => {
	const time = new Date().getTime();
	// const format = imageFile.name.split('.').slice(-1)[0];
	const filename = `${time}.xlsx`;
	const client = new Ftp.Client();

	try {
		await client.access({
			host: '10.8.0.12',
			user: 'michel',
			password: 'amazonas@20',
			port: 21,
		});
		const stream = new Readable({
			read() {
				this.push(imageFile);
				this.push(null);
			},
		});

		await client.ensureDir('/home/michel/Sistema/relatorio_fornecedores');
		await client.uploadFrom(stream, `/home/michel/Sistema/relatorio_fornecedores/${filename}`);

		return filename;
	} catch (err) {
		console.error('ftp error: ', err);
	} finally {
		client.close();
	}
	return null;
};

const DeleteFTP = async (filename: string) => {
	const client = new Ftp.Client();
	try {
		await client.access({
			host: `${process.env.FTP_IP}`,
			user: `${process.env.FTP_USER}`,
			password: `${process.env.FTP_PASS}`,
			port: Number(`${process.env.FTP_PORT}`),
		});
		await client.remove(`${process.env.FTP_URL}/${filename}`);
	} catch (err) {
		console.error(err);
	} finally {
		client.close();
	}
	return null;
};

export { ShowFTP, SaveFTP, DeleteFTP };
