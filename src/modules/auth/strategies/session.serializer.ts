import { UserRepository } from "@modules/user/repositories/user.repository";
import type { UserAuth } from "@modules/user/schemas/user.schema";
import { Injectable } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";

@Injectable()
export class SessionSerializer extends PassportSerializer {
	constructor(private readonly userRepository: UserRepository) {
		super();
	}

	serializeUser(
		user: UserAuth,
		done: (err: Error | null, payload: number) => void,
	): void {
		done(null, user.id); // Save only ID in session
	}

	async deserializeUser(
		payload: number,
		done: (err: Error | null, user: UserAuth | null) => void,
	) {
		try {
			const user = await this.userRepository.show(payload);
			done(null, user ? user : null);
		} catch (error) {
			done(error as Error, null);
		}
	}
}
