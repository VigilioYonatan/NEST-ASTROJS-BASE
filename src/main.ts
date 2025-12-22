import {
	helmetConfig,
	validateEnvironments,
} from "@infrastructure/config/server";
import { astroProxy } from "@infrastructure/utils/server";
import { SessionConfigService } from "@modules/auth/config/session.config";
import { WebPath } from "@modules/web/routers/web.routers";
import { VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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

	// get configService environment
	const configService = app.get(ConfigService);
	const corsOrigins = configService.getOrThrow<string>("CORS_ORIGINS");
	const port = configService.getOrThrow<number>("PORT");

	// Logger
	app.useLogger(app.get(Logger));

	// Security Headers
	app.use(helmet(helmetConfig(configService)));

	// Enable CORS
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
	const sessionConfig = app.get(SessionConfigService);
	sessionConfig.setup(app);

	// Start on port

	const server = await app.listen(port);
	server.on("upgrade", astroProxy.upgrade);
	// biome-ignore lint/suspicious/noConsole: Startup log
	console.log(`Application is running on: http://localhost:${port}`);
	// biome-ignore lint/suspicious/noConsole: Startup log
	console.log(`Swagger Docs available at: http://localhost:${port}/reference`);
}
bootstrap();
