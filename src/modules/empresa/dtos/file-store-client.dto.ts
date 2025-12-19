import { z } from "@infrastructure/config/zod-i18n.config";
import { fileStoreDto } from "./file-store.dto";

export const fileStoreClientDto = fileStoreDto.extend({
	file: z
		.array(z.instanceof(File))
		.min(1)
		.max(1)
		.refine(
			(files) => files.every((file) => file.size <= 250 * 1024 * 1024),
			"Tamaño máximo 250MB",
		),
});

export type FileStoreClientDto = z.infer<typeof fileStoreClientDto>;
