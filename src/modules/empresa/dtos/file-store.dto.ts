import { z } from "@infrastructure/config/zod-i18n.config";
import { fileSchema } from "../schemas/file.schema";

export const fileStoreDto = fileSchema.omit({
	id: true,
	history: true,
	user_id: true,
	created_at: true,
	updated_at: true,
});

export type FileStoreDto = z.infer<typeof fileStoreDto>;
