import { DatabaseModule } from "@infrastructure/providers/database";
import { Module } from "@nestjs/common";
import { UserController } from "../controllers/user.controller";
import { UserRepository } from "../repositories/user.repository";
import { UserService } from "../services/user.service";

@Module({
	imports: [DatabaseModule],
	controllers: [UserController],
	providers: [UserService, UserRepository],
	exports: [UserService, UserRepository],
})
export class UserModule {}
