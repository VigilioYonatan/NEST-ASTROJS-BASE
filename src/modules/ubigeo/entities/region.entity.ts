import { schema } from "@infrastructure/providers/database";
import type { Entity } from "@infrastructure/types/server";
import { type InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import type { RegionSchema } from "../schemas/region.schema";
import type { CountryEntity } from "./country.entity";

export const regionEntity = pgTable("region", {
    id: serial().primaryKey(),
    code: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    country_id: integer()
        .notNull()
        .references(() => schema.country.id),
});
export type RegionEntity = Entity<
    RegionSchema,
    InferSelectModel<typeof regionEntity>
>;

export const regionsRelations = relations(regionEntity, ({ one, many }) => ({
    country: one(schema.country, {
        fields: [regionEntity.country_id],
        references: [schema.country.id],
    }),
    cities: many(schema.city),
}));
export type RegionRelations = RegionEntity & {
    country?: CountryEntity;
    cities?: InferSelectModel<typeof schema.city>[];
};
