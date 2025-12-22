import { AuthenticatedGuard } from "@modules/auth/guards/authenticated.guard";
import { RolesGuard } from "@modules/auth/guards/roles.guard";
import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { UserController } from "../controllers/user.controller";
import { UserService } from "../services/user.service";

describe("UserController (Integration)", () => {
	let app: INestApplication;
	let userService: UserService;

	beforeAll(async () => {
		// console.log("DEBUG: UserService token:", UserService);

		const moduleFixture: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [
				{
					provide: UserService,
					useValue: {
						show: vi.fn(),
						store: vi.fn(),
						update: vi.fn(),
						destroy: vi.fn(),
					},
				},
			],
		})
			.overrideGuard(AuthenticatedGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(RolesGuard)
			.useValue({ canActivate: () => true })
			.compile();

		app = moduleFixture.createNestApplication();
		userService = moduleFixture.get<UserService>(UserService);
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe("GET /user/:id", () => {
		it("should return a single user", async () => {
			const result = {
				success: true,
				user: { id: 1, name: "Test User" },
			};
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			vi.mocked(userService.show).mockResolvedValue(result as any);

			return request(app.getHttpServer())
				.get("/user/1")
				.expect(200)
				.expect((res) => {
					expect(res.body).toEqual(result);
					expect(userService.show).toHaveBeenCalledWith(1);
				});
		});

		it("should validate id is number", async () => {
			return request(app.getHttpServer()).get("/user/abc").expect(400);
		});
	});

	describe("POST /user", () => {
		it("should create a user when data is valid", async () => {
			const dto = {
				user_name: "testuser",
				full_name: "Test User",
				father_lastname: "Perez",
				mother_lastname: "Gomez",
				gender: "masculino",
				email: "test@example.com",
				documento_code: "01",
				documento: "12345678",
				password: "Password123!",
				telefono: "987654321",
				role: "administracion",
				address: "Av. Siempre Viva 123",
				is_register_automatic: false,
				status: "activo",
				estudiante_status: "activo",
				profesion: null,
				presentation: null,
				photo: null,
				wallpaper: null,
				subscription: null,
			};
			const result = { success: true, user: { id: 1, ...dto } };
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			vi.mocked(userService.store).mockResolvedValue(result as any);

			return request(app.getHttpServer())
				.post("/user")
				.send(dto)
				.expect(201)
				.then((res) => {
					expect(res.body).toEqual(result);
					expect(userService.store).toHaveBeenCalled();
				});
		});

		it("should return 400 on validation error (ZodPipe)", async () => {
			const invalidDto = {
				user_name: "newUser",
			};

			return request(app.getHttpServer())
				.post("/user")
				.send(invalidDto)
				.expect(400);
		});
	});
});
