import type { Environments } from "@infrastructure/config/server";
import KeyvRedis from "@keyv/redis";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_INTERCEPTOR } from "@nestjs/core";
import Keyv from "keyv";
import { getRedisUrl } from "./cache.connection";
import { CacheService } from "./cache.service";

@Global()
@Module({
	imports: [
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (configService: ConfigService<Environments>) => {
				const isProduction = configService.get("NODE_ENV") === "production";

				// Configuramos el driver de almacenamiento
				let storage: KeyvRedis<unknown> | undefined;

				if (isProduction) {
					storage = new KeyvRedis(getRedisUrl(configService));
				}

				// Creamos una única instancia de Keyv
				const keyv = new Keyv({
					store: storage,
					ttl: 5000,
				});

				return {
					store: keyv,
					ttl: 5000,
				};
			},
		}),
	],
	exports: [CacheService],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: CacheInterceptor,
		},
		CacheService,
	],
})
export class AppCacheModule {}
