import { DRIZZLE, schema } from "@infrastructure/providers/database";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { EmpresaUpdateDto } from "../dtos/empresa-update.dto";

@Injectable()
export class EmpresaRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: NodePgDatabase<typeof schema>
    ) {}

    async update(id: number, userId: number, data: EmpresaUpdateDto) {
        return this.db
            .update(schema.empresa)
            .set({
                ...data,
                user_id: userId,
            })
            .where(eq(schema.empresa.id, id));
    }
}
