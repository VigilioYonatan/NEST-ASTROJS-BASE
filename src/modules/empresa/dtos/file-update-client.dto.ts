import { z } from "@infrastructure/config/zod-i18n.config";
import { fileStoreClientDto } from "./file-store-client.dto";

export const fileUpdateFileDto = fileStoreClientDto.pick({ file: true });

export type FileUpdateClientDto = z.infer<typeof fileUpdateFileDto> & {
	name: string;
};
