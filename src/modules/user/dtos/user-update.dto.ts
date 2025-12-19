import { createZodDto } from "nestjs-zod";
import { userSchema } from "../schemas/user.schema";

export const userUpdateSchema = userSchema
	.omit({
		id: true,
		code: true,
		password: true,
		intentos_session: true,
		intentos_session_date: true,
		slug: true,
		subscription: true,
		enabled_notifications_webpush: true,
		created_at: true,
		updated_at: true,
		deleted_at: true,
		ultima_conexion: true,
	})
	.partial();
export class UserUpdateDto extends createZodDto(userUpdateSchema) {}
