# Drizzle ORM: Guía Definitiva & Cheatsheet (2026)

Este documento condensa desde lo básico hasta patrones de arquitectura senior.

---

## 1. Migraciones vs Prototipado

Drizzle ofrece dos flujos de trabajo principales para gestionar la base de datos.

### `drizzle-kit push` (Prototipado Rapido)

Sincroniza el estado de tu esquema TypeScript directamente con la DB.

-   **Uso:** Desarrollo temprano, pruebas, side-projects.
-   **Peligro:** Puede borrar datos si cambias nombres de columnas.
-   **Comando:** `bun drizzle-kit push`

### `drizzle-kit generate` + `migrate` (Producción)

Genera archivos SQL inmutables que representan el historial de cambios.

-   **Uso:** Entornos de producción, equipos, CI/CD.
-   **Flujo:**
    1.  Cambias `schema.ts`.
    2.  `bun drizzle-kit generate` (Crea SQL en `/drizzle`).
    3.  `bun drizzle-kit migrate` (Aplica SQL a la DB).

---

## 2. Definición de Schema y Relaciones

```typescript
import {
    pgTable,
    serial,
    text,
    integer,
    primaryKey,
    uniqueIndex,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla Básica
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
});

// Relación 1:1 (User <-> Profile)
export const profiles = pgTable("profiles", {
    id: serial("id").primaryKey(),
    bio: text("bio"),
    userId: integer("user_id")
        .references(() => users.id)
        .unique(), // unique() fuerza 1:1
});

// Relación 1:N (User <-> Posts)
export const posts = pgTable(
    "posts",
    {
        id: serial("id").primaryKey(),
        title: text("title"),
        authorId: integer("author_id").references(() => users.id),
    },
    (table) => ({
        // Índices y Constraints Extras
        titleIndex: index("title_idx").on(table.title), // Índice Simple
        compositeIdx: index("user_title_idx").on(table.authorId, table.title), // Índice Compuesto
    })
);

// Relación N:M (Post <-> Category) mediante Tabla Intermedia
export const categories = pgTable("categories", {
    id: serial("id").primaryKey(),
    name: text("name"),
});

export const postCategories = pgTable(
    "post_categories",
    {
        postId: integer("post_id").references(() => posts.id),
        categoryId: integer("category_id").references(() => categories.id),
    },
    (t) => ({
        pk: primaryKey({ columns: [t.postId, t.categoryId] }), // Llave compuesta
    })
);
```

### Definición de Relations (Para API de Consultas)

Esto habilita la sintaxis `db.query.findMany({ with: ... })`.

```typescript
export const usersRelations = relations(users, ({ one, many }) => ({
    profile: one(profiles, {
        // 1:1 inversa
        fields: [users.id],
        references: [profiles.userId],
    }),
    posts: many(posts), // 1:N
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
    author: one(users, {
        fields: [posts.authorId],
        references: [users.id],
    }),
    categories: many(postCategories), // N:M parte 1
}));

export const postCategoriesRelations = relations(postCategories, ({ one }) => ({
    post: one(posts, {
        fields: [postCategories.postId],
        references: [posts.id],
    }),
    category: one(categories, {
        fields: [postCategories.categoryId],
        references: [categories.id],
    }),
}));
```

---

## 3. Patrones Avanzados

### Polimorfismo (Discriminator Pattern)

SQL no soporta polimorfismo nativo. El patrón estándar es usar una columna `type` y opcionalmente columnas específicas o tablas JSON.

**Ejemplo:** Un sistema de notificaciones que referencia diferentes entidades.

```typescript
export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    type: text("type", { enum: ["POST_LIKE", "NEW_FOLLOWER"] }).notNull(),

    // Opción A: References "sueltas" (Nullable FKs)
    postId: integer("post_id").references(() => posts.id), // Lleno si type === 'POST_LIKE'
    followerId: integer("follower_id").references(() => users.id), // Lleno si type === 'NEW_FOLLOWER'
});
```

### Subqueries

Drizzle permite usar subconsultas como columnas computadas.

```typescript
import { sql } from "drizzle-orm";

// Seleccionar usuarios con su conteo de posts (sin hacer JOIN masivo)
const usersWithCounts = await db
    .select({
        id: users.id,
        name: users.name,
        postCount: db.$count(posts, eq(posts.authorId, users.id)), // Helper moderno
    })
    .from(users);

// O Manualmente con sq
const sq = db
    .select({
        authorId: posts.authorId,
        count: sql<number>`count(*)`.as("count"),
    })
    .from(posts)
    .groupBy(posts.authorId)
    .as("sq");

const res = await db
    .select()
    .from(users)
    .leftJoin(sq, eq(users.id, sq.authorId));
```

### Views & Materialized Views

Abstracciones a nivel de DB. Útil para reportes complejos.

```typescript
import { pgView } from "drizzle-orm/pg-core";

export const userStatsView = pgView("user_stats").as((qb) => {
    return qb
        .select({
            userId: users.id,
            postCount: count(posts.id).as("post_count"),
        })
        .from(users)
        .leftJoin(posts, eq(users.id, posts.authorId))
        .groupBy(users.id);
});

// Consulta la View como tabla normal
const stats = await db.select().from(userStatsView);
```

---

## 4. Consultas Senior y Optimización

### Prepared Statements

Esencial para High Performance. Drizzle prepara la consulta en la DB una vez y solo envía parámetros. **Reduce la latencia de red y CPU de DB.**

```typescript
const userById = db
    .select()
    .from(users)
    .where(eq(users.id, sql.placeholder("id")))
    .prepare("get_user_by_id");

// Uso repetido (Ultra rápido)
const u1 = await userById.execute({ id: 1 });
const u2 = await userById.execute({ id: 2 });
```

### Streaming (Iterator Mode)

Para datasets masivos, no cargues todo en memoria. Usa iteradores.

```typescript
const usersIterator = await db.select().from(users).iterator();

// Procesa 1 a 1 sin explotar la RAM del servidor
for await (const user of usersIterator) {
    await processUser(user);
}
```

### Batching (Consultas en Lote)

Reduce Round-Trips a la DB enviando múltiples queries en un solo request.

```typescript
/* Solo disponible si el driver lo soporta (como Neon o Vercel Postgres) */
// const [usersData, postsData] = await db.batch([
//   db.select().from(users),
//   db.select().from(posts)
// ]);
```

### Partial Select

**Nunca hagas `select *`** en tablas grandes. Selecciona solo lo que necesitas.

```typescript
const list = await db.query.users.findMany({
    columns: {
        id: true,
        name: true, // No traemos password, bio, ni JSON blobs gigantes
    },
});
```

---

## 5. Paginación por Cursor (Cursor Pagination)

La paginación por `offset` (`LIMIT 10 OFFSET 10000`) es lenta en tablas grandes.
**Cursor Pagination** usa un índice (ej. `id` o `created_at`) para saltar directamente.

**Estrategia:** "Dame 10 items donde `created_at` sea menor al del último item que vi".

```typescript
import { lt, desc, and } from "drizzle-orm";

async function getPosts(cursor?: Date, limit = 10) {
    return db.query.posts.findMany({
        limit: limit,
        orderBy: [desc(posts.createdAt)], // Orden determinista
        where: cursor
            ? lt(posts.createdAt, cursor) // WHERE created_at < cursor
            : undefined,
    });
}

// Uso
const page1 = await getPosts();
const lastItem = page1[page1.length - 1];
const page2 = await getPosts(lastItem.createdAt);
```

---

## 6. Trucos de Experto

### Soft Delete (Borrado Lógico)

En lugar de borrar, ocultamos.

```typescript
// 1. Añadir columna
// isDeleted: boolean('is_deleted').default(false)

// 2. Abstraer en funciones
async function findActiveUsers() {
    return db.select().from(users).where(eq(users.isDeleted, false));
}

// 3. O usar Middleware/Extensions (Experimental/Custom)
// Puedes crear una función 'softDelete' helper
const softDeleteUser = (id: number) =>
    db.update(users).set({ isDeleted: true }).where(eq(users.id, id));
```

### JSON Operations

Postgres y Drizzle son muy buenos con JSON.

```typescript
// metadata: jsonb('metadata')

await db
    .select()
    .from(products)
    .where(sql`${products.metadata}->>'color' = 'red'`); // Query cruda eficiente
```

### Logging & Debugging

Para ver qué SQL está generando Drizzle exactamente.

```typescript
const db = drizzle(client, {
    schema,
    logger: true, // <--- Esencial para debugging
});
```

## 7. Ejemplo CRUD Completo

Patrón común para Repositories (como se usa en este proyecto).

```typescript
import { eq } from "drizzle-orm";
// Asumiendo inyeccion de dependencias o import directo
// import { db } from "@/db";
// import { users } from "@/schema";

export class UsersRepository {
    // 1. INDEX: Listar todos
    async index() {
        return await this.db.query.users.findMany();
    }

    // 2. SHOW: Mostrar uno por ID
    async show(id: number) {
        return await this.db.query.users.findFirst({
            where: eq(users.id, id),
        });
    }

    // 3. STORE: Crear nuevo
    async store(body: typeof users.$inferInsert) {
        const [newUser] = await this.db.insert(users).values(body).returning();
        return newUser;
    }

    // 4. UPDATE: Actualizar
    async update(id: number, body: Partial<typeof users.$inferInsert>) {
        await this.db.update(users).set(body).where(eq(users.id, id));

        return { message: "User updated successfully" };
    }

    // 5. DESTROY: Eliminar
    async destroy(id: number) {
        await this.db.delete(users).where(eq(users.id, id));

        return { message: "User deleted successfully" };
    }
}
```

## Resumen de Mejores Prácticas

1.  **Strict Mode**: Siempre `strict: true` en `drizzle.config.ts`.
2.  **Schema Separation**: Divide tu schema en archivos si crece (`users.sql.ts`, `posts.sql.ts`).
3.  **Indexes**: Siempre añade índices a FKs y columnas de búsqueda (`where`).
4.  **Zod**: Usa `drizzle-zod` para generar validaciones de API automáticamente.
