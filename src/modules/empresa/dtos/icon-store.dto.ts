import { z } from "@infrastructure/config/zod-i18n.config";
import { iconSchema } from "../schemas/icon.schema";

export const iconStoreDto = iconSchema.omit({
	id: true,
	code: true,
	created_at: true,
	updated_at: true,
});
export type IconStoreDto = z.infer<typeof iconStoreDto>;
