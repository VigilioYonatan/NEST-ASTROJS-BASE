import { DRIZZLE, schema } from "@infrastructure/providers/database";
import { generateId, slugify } from "@infrastructure/utils/hybrid";
import { generateCodeEntity } from "@infrastructure/utils/server";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { UserStoreDto } from "../dtos/user-store.dto";
import type { UserUpdateDto } from "../dtos/user-update.dto";
import { userEntity } from "../entities/user.entity";

@Injectable()
export class UserRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>
    ) {}

    async index() {
        const result = await this.db.query.user.findMany();
        return result;
    }

    async show(id: number) {
        const result = await this.db.query.user.findFirst({
            where: eq(userEntity.id, id),
        });
        return result;
    }

    async findByEmail(email: string) {
        const result = await this.db.query.user.findFirst({
            where: eq(userEntity.email, email),
        });
        return result;
    }

    async store(body: UserStoreDto) {
        const code = await generateCodeEntity({
            db: this.db,
            Item: userEntity,
            latestCodeColumn: "code",
            orderByColumn: userEntity.id,
            prefix: "USER-",
        });
        const slug = slugify(
            body.user_name ||
                `${body.full_name}${body.father_lastname}${generateId().slice(
                    4
                )}`
        );
        const [result] = await this.db
            .insert(userEntity)
            .values({
                ...body,
                code,
                slug,
                intentos_session: 0,
                enabled_notifications_webpush: true,
            })
            .returning();
        return result;
    }

    async update(id: number, body: UserUpdateDto) {
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
