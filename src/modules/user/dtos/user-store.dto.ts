import { createZodDto } from "nestjs-zod";
import { userSchema } from "../schemas/user.schema";

export const userStoreSchema = userSchema.omit({
    id: true,
    code: true,
    intentos_session: true,
    intentos_session_date: true,
    subscription: true,
    ultima_conexion: true,
    enabled_notifications_webpush: true,
    slug: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
});
export class UserStoreDto extends createZodDto(userStoreSchema) {}
