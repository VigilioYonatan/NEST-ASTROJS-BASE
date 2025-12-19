import { schema } from "@infrastructure/providers/database";
import type { Entity } from "@infrastructure/types/server";
import type { FilesSchema } from "@modules/uploads/schemas/upload.schema";
import { type InferSelectModel, relations } from "drizzle-orm";
import {
	integer,
	jsonb,
	pgTable,
	serial,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import type { FileSchema } from "../schemas/file.schema";

export const fileEntity = pgTable("file", {
	id: serial().primaryKey(),
	name: varchar({ length: 256 }).unique().notNull(),
	file: jsonb().$type<FilesSchema[]>().notNull(),
	history: jsonb().$type<string[]>().notNull(),
	user_id: integer()
		.notNull()
		.references(() => schema.user.id),
	created_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
	updated_at: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const fileRelations = relations(fileEntity, ({ one }) => ({
	user: one(schema.user, {
		fields: [fileEntity.user_id],
		references: [schema.user.id],
	}),
}));

export type FileEntity = Entity<
	FileSchema,
	InferSelectModel<typeof fileEntity>
>;
export type FileEntitySelect = InferSelectModel<typeof fileEntity>;
