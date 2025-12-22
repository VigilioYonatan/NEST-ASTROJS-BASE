import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { schema } from "@infrastructure/providers/database/database.schema";
import { DatabaseService } from "@infrastructure/providers/database/database.service";
import { generateId, slugify } from "@infrastructure/utils/hybrid";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { UserStoreDto } from "../dtos/user-store.dto";
import type { UserUpdateDto } from "../dtos/user-update.dto";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserService {
	private readonly CACHE_KEY = "users";
	constructor(
		private readonly cacheService: CacheService,
		private readonly databaseService: DatabaseService,
		private readonly userRepository: UserRepository,
	) {}

	async store(body: UserStoreDto) {
		const slug = slugify(
			body.user_name ||
				`${body.full_name}${body.father_lastname}${generateId().slice(4)}`,
		);
		const code = await this.databaseService.generateCodeEntity({
			Item: schema.user,
			latestCodeColumn: "code",
			orderByColumn: schema.user.id,
			prefix: "USER-",
		});
		const user = await this.userRepository.store({
			...body,
			slug,
			code,
			intentos_session: 0,
			intentos_session_date: null,
			enabled_notifications_webpush: true,
			ultima_conexion: null,
			subscription: null,
			deleted_at: null,
			created_at: null,
			updated_at: null,
		});
		return { success: true, user };
	}

	async show(id: number) {
		const cacheKey = `${this.CACHE_KEY}:${id}`;
		let user = await this.cacheService.cacheGetJson(cacheKey);
		if (!user) {
			user = await this.userRepository.show(id);
			if (!user) {
				throw new NotFoundException(`User with ID ${id} not found`);
			}
		}
		await this.cacheService.set(
			cacheKey,
			user,
			this.cacheService.CACHE_TIMES.MINUTE,
		);
		return { success: true, user };
	}
	async update(id: number, userUpdateDto: UserUpdateDto) {
		const user = await this.userRepository.update(id, userUpdateDto);
		await this.cacheService.del(`${this.CACHE_KEY}:${id}`);
		return { success: true, user };
	}

	async destroy(id: number) {
		await this.userRepository.destroy(id);
		return { success: true, message: "Usuario eliminado correctamente" };
	}
}
