import { schema } from "@infrastructure/providers/database";
import type { Entity } from "@infrastructure/types/server";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	boolean,
	integer,
	json,
	jsonb,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { EmpresaSchema } from "../schemas/empresa.schema";

export const empresaEntity = pgTable("empresa", {
	id: serial("id").primaryKey(),
	name_empresa: varchar({ length: 255 }).notNull(),
	dial_code: varchar({ length: 20 }).notNull(),
	model_ai_groq: varchar({ length: 100 }).notNull(),
	telefono: varchar({ length: 20 }).notNull(),
	token_ai: varchar({ length: 255 }).notNull(),
	color_primary: varchar({ length: 100 }).notNull(),
	timezone: varchar({ length: 100 }).notNull(),
	enabled_automatic_payment: boolean().default(false).notNull(),
	enabled_send_sunat: boolean().default(false).notNull(),
	enabled_send_pdf: boolean().default(false).notNull(),
	logo_facturacion: json().$type<FilesSchema[]>(),
	certificado_digital: jsonb().$type<FilesSchema[]>(),
	address_id: integer()
		.references(() => schema.address.id)
		.notNull(),
	user_id: integer()
		.references(() => schema.user.id)
		.notNull(),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const empresaRelations = relations(empresaEntity, ({ one }) => ({
	// BelongsTo Address (Relación 1:1)
	address: one(schema.address, {
		fields: [empresaEntity.address_id],
		references: [schema.address.id],
	}),
	// **company debe tener una FK que apunte a empresa.id.**
	company: one(schema.company, {
		fields: [empresaEntity.id],
		references: [schema.company.empresa_id],
		relationName: "company_details",
	}),
	// BelongsTo User (Relación N:1)
	user: one(schema.user, {
		fields: [empresaEntity.user_id],
		references: [schema.user.id],
	}),
}));

export type EmpresaEntity = Entity<
	EmpresaSchema,
	InferSelectModel<typeof empresaEntity>
>;
