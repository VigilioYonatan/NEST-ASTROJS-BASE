import { z } from "@infrastructure/config/zod-i18n.config";
import { empresaSchema } from "../schemas/empresa.schema";

export const empresaUpdateDto = empresaSchema.omit({
	id: true,
	user_id: true,
	created_at: true,
	updated_at: true,
});
export type EmpresaUpdateDto = z.infer<typeof empresaUpdateDto>;
