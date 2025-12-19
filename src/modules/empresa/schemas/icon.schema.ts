import { z } from "@infrastructure/config/zod-i18n.config";
import { filesSchema } from "@modules/uploads/schemas/upload.schema";

export const iconSchema = z.object({
    id: z.number(),
    code: z.string(),
    name: z.string(),
    slug: z.string(),
    photo: z.array(filesSchema([100, 300])),
    created_at: z.date(),
    updated_at: z.date(),
});

export type IconSchema = z.infer<typeof iconSchema>;

export type IconSchemaFromServer = IconSchema & {
    // user_academic: UserCreated;
};
