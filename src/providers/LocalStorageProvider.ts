import fs from 'fs';
import multer, { Multer } from 'multer';

interface IStorageProvider {
	storage(): Multer;
	delete(file: string): Promise<void>;
}

export const LocalStorageProvider: IStorageProvider = {
	storage: () => {
		const upload = multer({
			storage: multer.diskStorage({
				destination: './public/uploads',
				filename: (req, file, cb) => cb(null, new Date().getTime() + '-' + file.originalname),
			}),
		});

		return upload;
	},

	delete: async (file: string) => {
		const filename = `./public/uploads/${file}`;

		try {
			await fs.promises.stat(filename);
		} catch (error: any) {
			console.log(error);
			throw new Error(error);
		}

		await fs.promises.unlink(filename);
	},
};
