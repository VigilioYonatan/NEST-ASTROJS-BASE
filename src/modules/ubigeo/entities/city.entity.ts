import { schema } from "@infrastructure/providers/database";
import type { Entity } from "@infrastructure/types/server";
import { type InferSelectModel, relations } from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import type { CitySchema } from "../schemas/city.schema";
import { type RegionEntity } from "./region.entity";

export const cityEntity = pgTable("city", {
	id: serial().primaryKey(),
	code: varchar({ length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	region_id: integer()
		.notNull()
		.references(() => schema.region.id),
});

export type CityEntity = Entity<
	CitySchema,
	InferSelectModel<typeof cityEntity>
>;

export const citiesRelations = relations(cityEntity, ({ one }) => ({
	region: one(schema.region, {
		fields: [cityEntity.region_id],
		references: [schema.region.id],
	}),
}));

export type CityRelations = CityEntity & {
	region?: RegionEntity;
};
