import { createZodDto } from "nestjs-zod";
import { userStoreClientSchema } from "./user-store-client.dto";

export const userUpdatePhotoSchema = userStoreClientSchema.pick({
	photo: true,
});
export class UserUpdatePhotoDto extends createZodDto(userUpdatePhotoSchema) {}
