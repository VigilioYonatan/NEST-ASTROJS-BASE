import {
	getEnvironments,
	helmetConfig,
	validateEnvironments,
} from "@infrastructure/config/server";
import { astroProxy } from "@infrastructure/utils/server";
import { setupSession } from "@modules/auth/config/session.config";
import { WebPath } from "@modules/web/routers/web.routers";
import { VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import helmet from "helmet";
import { Logger } from "nestjs-pino";
import { AppModule } from "./app.module";

async function bootstrap() {
	// Validar variables de entorno ANTES de iniciar NestJS
	validateEnvironments();

	const app = await NestFactory.create(AppModule, { bufferLogs: true });

	app.useLogger(app.get(Logger));

	// Security Headers
	app.use(helmet(helmetConfig()));

	// Enable CORS
	const corsOrigins = getEnvironments().CORS_ORIGINS;
	app.enableCors({
		origin:
			corsOrigins === "*" ? "*" : corsOrigins.split(",").map((s) => s.trim()),
		credentials: true,
	});

	// Versioning
	app.setGlobalPrefix("api", { exclude: Object.values(WebPath) });
	app.enableVersioning({
		type: VersioningType.URI,
		defaultVersion: "1",
		prefix: "v",
	});

	// Swagger Configuration
	const config = new DocumentBuilder()
		.setTitle("Astro-Test API")
		.setDescription("API documentation for Astro-Test project")
		.setVersion("1.0")
		.addTag("users")
		.build();
	const document = SwaggerModule.createDocument(app, config);

	app.use(
		"/reference",
		apiReference({
			content: document,
		}),
	);

	// Session & Passport Configuration
	setupSession(app);

	// Start on port

	const server = await app.listen(getEnvironments().PORT);
	server.on("upgrade", astroProxy.upgrade);
	// biome-ignore lint/suspicious/noConsole: Startup log
	console.log(
		`Application is running on: http://localhost:${getEnvironments().PORT}`,
	);
	// biome-ignore lint/suspicious/noConsole: Startup log
	console.log(
		`Swagger Docs available at: http://localhost:${
			getEnvironments().PORT
		}/reference`,
	);
}
bootstrap();
