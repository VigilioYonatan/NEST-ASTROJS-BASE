import { getEnvironments } from "@infrastructure/config/server";
import { cacheTimes } from "@infrastructure/utils/server";
import type { INestApplication } from "@nestjs/common";
import * as connectRedis from "connect-redis";
// import { RedisStore } from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import passport from "passport";

export function setupSession(app: INestApplication) {
    const redisClient = new Redis({
        host: getEnvironments().REDIS_HOST,
        port: getEnvironments().REDIS_PORT,
        // password: enviroments().REDIS_PASSWORD || undefined,
    });
    const store = new connectRedis.RedisStore({
        client: redisClient,
        prefix: "sess:",
    });

    app.use(
        session({
            store,
            secret: getEnvironments().JWT_KEY,
            resave: false,
            saveUninitialized: false,
            rolling: true,
            proxy: getEnvironments().NODE_ENV === "production",
            cookie: {
                secure: getEnvironments().NODE_ENV === "production",
                httpOnly: getEnvironments().NODE_ENV === "production",
                maxAge: cacheTimes.days3 * 1000, // 3 days
            },
        })
    );

    app.use(passport.initialize());
    app.use(passport.session());
}
