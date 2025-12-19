import { CacheService } from "@infrastructure/providers/cache";
import { Injectable } from "@nestjs/common";
import type { UserStoreDto } from "../dtos/user-store.dto";
import type { UserUpdateDto } from "../dtos/user-update.dto";
import { UserRepository } from "../repositories/user.repository";

@Injectable()
export class UserCacheService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly cacheService: CacheService
    ) {}

    async index() {
        const cacheKey = "users:index";
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;

        const result = await this.userRepository.index();
        await this.cacheService.set(cacheKey, result, 10000); // 10s cache for list
        return result;
    }

    async store(body: UserStoreDto) {
        const result = await this.userRepository.store(body);
        await this.cacheService.del("users:index");
        return result;
    }

    async show(id: number) {
        const cacheKey = `users:${id}`;
        const cached = await this.cacheService.get(cacheKey);
        if (cached) return cached;

        const user = await this.userRepository.show(id);
        await this.cacheService.set(cacheKey, user, 60000); // 60s
        return user;
    }

    async update(id: number, userUpdateDto: UserUpdateDto) {
        const result = await this.userRepository.update(id, userUpdateDto);
        await this.cacheService.del(`users:${id}`);
        await this.cacheService.del("users:index");
        return result;
    }

    async destroy(id: number) {
        const result = await this.userRepository.destroy(id);
        await this.cacheService.del(`users:${id}`);
        await this.cacheService.del("users:index");
        return result;
    }
}
