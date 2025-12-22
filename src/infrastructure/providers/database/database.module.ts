import type { Environments } from "@infrastructure/config/server";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schema } from "./database.schema";
import { DatabaseService, DRIZZLE } from "./database.service";

@Global()
@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: DRIZZLE,
			inject: [ConfigService],
			useFactory: async (configService: ConfigService<Environments>) => {
				const pool = new Pool({
					connectionString: configService.getOrThrow("DATABASE_URL"),
				});
				const db = drizzle(pool, {
					schema,
					logger: configService.getOrThrow("NODE_ENV") === "development",
				});
				return db;
			},
		},
		DatabaseService,
	],
	exports: [DRIZZLE, DatabaseService],
})
export class DatabaseModule {}
