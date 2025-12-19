import { z } from "@infrastructure/config/zod-i18n.config";

export const empresaUpdateLogoLoadingDto = z.object({
    logo_loading: z.array(z.instanceof(File)).min(1).max(1),
});
export type EmpresaUpdateLogoLoadingDto = z.infer<
    typeof empresaUpdateLogoLoadingDto
>;
