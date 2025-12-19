import { z } from "@infrastructure/config/zod-i18n.config";
import { PASSWORD_REGEX } from "@infrastructure/utils/hybrid";
import { createZodDto } from "nestjs-zod";
import { userSchema } from "../schemas/user.schema";

export const userUpdatePasswordSchema = userSchema
    .pick({ password: true })
    .extend({
        repeat_password: z
            .string()
            .min(8)
            .max(100)
            .refine((val) => PASSWORD_REGEX.test(val), {
                message: "Repetir contraseña no válida.",
            }),
    });
export class UserUpdatePasswordDto extends createZodDto(
    userUpdatePasswordSchema
) {}
