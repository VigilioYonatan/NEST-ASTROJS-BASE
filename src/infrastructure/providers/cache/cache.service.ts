import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import type { Cache } from "cache-manager";

@Injectable()
export class CacheService {
	public readonly CACHE_TIMES = {
		MINUTE: 60 * 1, //1 minuto
		MINUTES_10: 60 * 10, //10 minutos
		MINUTES_30: 60 * 30, //30 minutos
		HOUR: 60 * 60, //1 hora
		HOURS_4: 60 * 60 * 4, //4 horas
		DAYS_1: 60 * 60 * 24, //8 horas
		DAYS_3: 60 * 60 * 24 * 3, //3 dias
		DAYS_7: 60 * 60 * 24 * 7, //7 dias
		DAYS_30: 60 * 60 * 24 * 30, //30 dias
	};
	constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
	async get<T>(key: string): Promise<T | undefined> {
		return await this.cacheManager.get<T>(key);
	}

	async set(key: string, value: unknown, ttl?: number): Promise<void> {
		// Aquí podrías centralizar lógica de TTL por defecto
		await this.cacheManager.set(key, value, ttl);
	}

	async del(key: string): Promise<void> {
		await this.cacheManager.del(key);
	}
	async cacheGetJson<T>(key: string): Promise<T | null> {
		// En NestJS cache-manager, cache.get puede ser asíncrono
		const value = await this.cacheManager.get<string>(key);
		if (!value) return null;

		try {
			// El valor ya debe estar en string si se usó cacheSetJson, pero si se usa sync/async get, mejor castear.
			return JSON.parse(value as unknown as string) as T;
		} catch (err) {
			// biome-ignore lint/suspicious/noConsole: <explanation>
			console.error("Error parsing cached JSON:", err);
			return null;
		}
	}

	// --- HEALTH CHECK ---
	async checkHealth(): Promise<boolean> {
		try {
			await this.cacheManager.set("health_check", "ok", 1000);
			const result = await this.cacheManager.get("health_check");
			return result === "ok";
		} catch (error) {
			// biome-ignore lint/suspicious/noConsole: Health check log
			console.error("Redis Health Check Failed:", error);
			return false;
		}
	}

	async resetCache(): Promise<void> {
		await this.cacheManager.clear();
	}
}
