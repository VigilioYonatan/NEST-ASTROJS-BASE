import { z } from "@infrastructure/config/zod-i18n.config";
import { PASSWORD_REGEX } from "@infrastructure/utils/hybrid";
import { createZodDto } from "nestjs-zod";
import { userStoreSchema } from "./user-store.dto";

export const userStoreClientSchema = userStoreSchema.extend({
	repeat_password: z
		.string()
		.min(8)
		.max(100)
		.refine((val) => PASSWORD_REGEX.test(val), {
			message: "Repetir contraseña no válida.",
		}),
	photo: z.array(z.instanceof(File)).min(1).max(1).nullable().optional(),
	wallpaper: z.array(z.instanceof(File)).min(1).max(1).nullable().optional(),
});
export class UserStoreClientDto extends createZodDto(userStoreClientSchema) {}
