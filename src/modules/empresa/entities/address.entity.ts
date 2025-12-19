import { schema } from "@infrastructure/providers/database";
import {
	type InferInsertModel,
	type InferSelectModel,
	relations,
} from "drizzle-orm";
import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const addressEntity = pgTable("address", {
	id: serial("id").primaryKey(),
	ubigeo: varchar("ubigeo", { length: 10 }),
	urbanizacion: varchar("urbanizacion", { length: 300 }),
	direccion: varchar("direccion", { length: 300 }),
	cod_local: varchar("cod_local", { length: 20 }),
	city_id: integer("city_id").references(() => schema.city.id),
	user_id: integer("user_id").references(() => schema.user.id),
});

export const addressRelations = relations(addressEntity, ({ one }) => ({
	city: one(schema.city, {
		fields: [addressEntity.city_id],
		references: [schema.city.id],
	}),
	user: one(schema.user, {
		fields: [addressEntity.user_id],
		references: [schema.user.id],
	}),
}));

export type Address = InferSelectModel<typeof addressEntity>;
export type NewAddress = InferInsertModel<typeof addressEntity>;
