import { Module } from "@nestjs/common";
import { UserCacheService } from "../cache/user.cache";
import { UserController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

@Module({
	controllers: [UserController],
	providers: [UserService, UserRepository, UserCacheService],
	exports: [UserService, UserRepository, UserCacheService],
})
export class UserModule {}
