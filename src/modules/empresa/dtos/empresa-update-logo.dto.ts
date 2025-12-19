import { z } from "@infrastructure/config/zod-i18n.config";

export const empresaUpdateLogoDto = z.object({
	logo: z.array(z.instanceof(File)).min(1).max(1),
});
export type EmpresaUpdateLogoDto = z.infer<typeof empresaUpdateLogoDto>;
