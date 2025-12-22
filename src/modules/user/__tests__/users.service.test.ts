import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { vi } from "vitest";
import { UserService } from "../services/user.service";

// Mock UserRepository module
vi.mock("@modules/user/repositories/user.repository", () => ({
	UserRepository: class {
		store = vi.fn();
		show = vi.fn();
		update = vi.fn();
		destroy = vi.fn();
		findByEmailToLogin = vi.fn();
	},
}));

// Mock CacheService module
vi.mock("@infrastructure/providers/cache/cache.service", () => ({
	CacheService: class {
		cacheGetJson = vi.fn();
		set = vi.fn();
		del = vi.fn();
		CACHE_TIMES = { MINUTE: 60 };
		get = vi.fn();
	},
}));

// Mock DatabaseService module
vi.mock("@infrastructure/providers/database/database.service", () => ({
	DatabaseService: class {
		generateCodeEntity = vi.fn();
	},
}));

// Mock Schema
vi.mock("@infrastructure/providers/database/database.schema", () => ({
	schema: {
		user: { id: "user_table" },
	},
}));

import { CacheService } from "@infrastructure/providers/cache/cache.service";
import { DatabaseService } from "@infrastructure/providers/database/database.service";
import { UserRepository } from "@modules/user/repositories/user.repository";

describe("UserService", () => {
	let service: UserService;
	let userRepository: UserRepository;
	let cacheService: CacheService;
	let databaseService: DatabaseService;

	const mockUser = {
		id: 1,
		user_name: "testuser",
		email: "test@test.com",
	};

	const mockRepoInstance = {
		store: vi.fn(),
		show: vi.fn(),
		update: vi.fn(),
		destroy: vi.fn(),
		findByEmailToLogin: vi.fn(),
	};

	const mockCacheInstance = {
		cacheGetJson: vi.fn(),
		set: vi.fn(),
		del: vi.fn(),
		CACHE_TIMES: { MINUTE: 60 },
	};

	const mockDbInstance = {
		generateCodeEntity: vi.fn(),
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: UserService,
					useFactory: (
						cache: CacheService,
						db: DatabaseService,
						repo: UserRepository,
					) => {
						return new UserService(cache, db, repo);
					},
					inject: [CacheService, DatabaseService, UserRepository],
				},
				{
					provide: UserRepository,
					useValue: mockRepoInstance,
				},
				{
					provide: CacheService,
					useValue: mockCacheInstance,
				},
				{
					provide: DatabaseService,
					useValue: mockDbInstance,
				},
			],
		}).compile();

		service = module.get<UserService>(UserService);
		userRepository = module.get(UserRepository);
		cacheService = module.get(CacheService);
		databaseService = module.get(DatabaseService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("store", () => {
		it("should create a user with generated code", async () => {
			const dto = {
				email: "new@test.com",
				full_name: "New",
				father_lastname: "User",
				mother_lastname: "Test",
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			} as any;

			vi.mocked(databaseService.generateCodeEntity).mockResolvedValue(
				"USER-000001",
			);
			vi.mocked(userRepository.store).mockResolvedValue({
				...mockUser,
				...dto,
				code: "USER-000001",
			});

			const result = await service.store(dto);

			expect(databaseService.generateCodeEntity).toHaveBeenCalled();
			expect(userRepository.store).toHaveBeenCalledWith(
				expect.objectContaining({
					code: "USER-000001",
					slug: expect.stringContaining("new"),
				}),
			);
			expect(result).toEqual({ success: true, user: expect.anything() });
		});
	});

	describe("show", () => {
		it("should return cached user if available", async () => {
			vi.mocked(cacheService.cacheGetJson).mockResolvedValue(mockUser);

			const result = await service.show(1);

			expect(cacheService.cacheGetJson).toHaveBeenCalledWith("users:1");
			expect(userRepository.show).not.toHaveBeenCalled();
			expect(result).toEqual({ success: true, user: mockUser });
		});

		it("should return user from repo and cache it if not in cache", async () => {
			vi.mocked(cacheService.cacheGetJson).mockResolvedValue(null);
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			vi.mocked(userRepository.show).mockResolvedValue(mockUser as any);

			const result = await service.show(1);

			expect(userRepository.show).toHaveBeenCalledWith(1);
			expect(cacheService.set).toHaveBeenCalledWith("users:1", mockUser, 60);
			expect(result).toEqual({ success: true, user: mockUser });
		});

		it("should throw NotFoundException if user not found anywhere", async () => {
			vi.mocked(cacheService.cacheGetJson).mockResolvedValue(null);
			vi.mocked(userRepository.show).mockResolvedValue(null);

			await expect(service.show(999)).rejects.toThrow(NotFoundException);
		});
	});

	describe("update", () => {
		it("should update user and invalidate cache", async () => {
			vi.mocked(userRepository.update).mockResolvedValue({
				...mockUser,
				user_name: "updated",
			} as any);

			const result = await service.update(1, {
				user_name: "updated",
			} as any);

			expect(userRepository.update).toHaveBeenCalledWith(1, {
				user_name: "updated",
			});
			expect(cacheService.del).toHaveBeenCalledWith("users:1");
			expect(result).toEqual({ success: true, user: expect.anything() });
		});
	});

	describe("destroy", () => {
		it("should delete user", async () => {
			vi.mocked(userRepository.destroy).mockResolvedValue(mockUser as any);

			const result = await service.destroy(1);

			expect(userRepository.destroy).toHaveBeenCalledWith(1);
			expect(result).toEqual({
				success: true,
				message: "Usuario eliminado correctamente",
			});
		});
	});
});
