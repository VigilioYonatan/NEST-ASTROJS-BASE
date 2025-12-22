import type { Environments } from "@infrastructure/config/server";
import { getRedisClient } from "@infrastructure/providers/cache/cache.connection";
import { type INestApplication, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisStore } from "connect-redis";
import session from "express-session";
import passport from "passport";

@Injectable()
export class SessionConfigService {
	constructor(private readonly configService: ConfigService<Environments>) {}

	setup(app: INestApplication) {
		const redisInstance = getRedisClient(this.configService);
		const store = new RedisStore({
			client: redisInstance,
			prefix: "sess:",
		});

		const isProd = this.configService.getOrThrow("NODE_ENV") === "production";

		app.use(
			session({
				store,
				secret: this.configService.getOrThrow("JWT_KEY"),
				resave: false,
				saveUninitialized: false,
				rolling: true,
				proxy: isProd,
				cookie: {
					secure: isProd,
					httpOnly: true, // Siempre true por seguridad
					maxAge: 1000 * 60 * 60 * 24 * 3, // 3 días en ms
				},
			}),
		);

		app.use(passport.initialize());
		app.use(passport.session());
	}
}
