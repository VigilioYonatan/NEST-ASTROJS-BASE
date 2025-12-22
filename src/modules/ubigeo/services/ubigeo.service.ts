import { CacheService } from "@infrastructure/providers/cache";
import { Injectable } from "@nestjs/common";
import type { CountryRelations } from "../entities/country.entity";
import { UbigeoRepository } from "../repositories/ubigeo.repository";

@Injectable()
export class UbigeoService {
	private readonly cacheKey = "ubigeo";
	constructor(
		private readonly ubigeoRepository: UbigeoRepository,
		private readonly cacheService: CacheService,
	) {}

	async index() {
		let data = await this.cacheService.cacheGetJson<CountryRelations | null>(
			this.cacheKey,
		);

		if (!data) {
			data = await this.ubigeoRepository.findPeruWithRegionsAndCities();
			if (data) {
				await this.cacheService.set(
					this.cacheKey,
					JSON.stringify(data),
					this.cacheService.CACHE_TIMES.DAYS_30,
				);
			}
		}

		return {
			success: true,
			data,
		};
	}
}
