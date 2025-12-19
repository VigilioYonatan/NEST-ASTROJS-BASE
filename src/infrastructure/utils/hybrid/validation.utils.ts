import { z } from "@infrastructure/config/zod-i18n.config";

/**
 * Valida un objeto con timestamps
 * @param timestamps El objeto con timestamps a validar
 */
export const timestampsObject = z.object({
    created_at: z.date().optional(),
    updated_at: z.date().optional(),
});
