import { DRIZZLE, schema } from "@infrastructure/providers/database";
import { toNull } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { userEntity } from "../entities/user.entity";
import type {
	UserFindByEmailToLogin,
	UserSchema,
} from "../schemas/user.schema";

@Injectable()
export class UserRepository {
	constructor(
		@Inject(DRIZZLE) public readonly db: NodePgDatabase<typeof schema>,
	) {}

	async show(id: number): Promise<UserSchema | null> {
		const result = await this.db.query.user.findFirst({
			where: eq(userEntity.id, id),
		});
		return toNull(result);
	}

	async findByEmailToLogin(
		email: string,
	): Promise<UserFindByEmailToLogin | null> {
		const result = await this.db.query.user.findFirst({
			where: eq(userEntity.email, email),
			columns: {
				id: true,
				email: true,
				password: true,
			},
		});
		return toNull(result);
	}

	async store(body: Omit<UserSchema, "id">): Promise<UserSchema> {
		const [result] = await this.db
			.insert(userEntity)
			.values({
				...body,
				intentos_session: 0,
				enabled_notifications_webpush: true,
			})
			.returning();
		return result;
	}

	async update(id: number, body: Partial<UserSchema>) {
		const result = await this.db
			.update(userEntity)
			.set(body)
			.where(eq(userEntity.id, id))
			.returning();
		return result;
	}

	async destroy(id: number) {
		const result = await this.db
			.delete(userEntity)
			.where(eq(userEntity.id, id))
			.returning();
		return result;
	}
}
