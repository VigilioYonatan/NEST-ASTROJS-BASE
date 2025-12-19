import { z } from "@infrastructure/config/zod-i18n.config";
import { iconSchema } from "../schemas/icon.schema";

export const iconUpdateDto = iconSchema.omit({
    id: true,
    code: true,
    created_at: true,
    updated_at: true,
});
export type IconUpdateDto = z.infer<typeof iconUpdateDto>;
