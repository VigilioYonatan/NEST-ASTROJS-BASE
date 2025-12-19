import {
	addressEntity,
	addressRelations,
} from "@modules/empresa/entities/address.entity";
import {
	companyEntity,
	companyRelations,
} from "@modules/empresa/entities/company.entity";
import {
	empresaEntity,
	empresaRelations,
} from "@modules/empresa/entities/empresa.entity";
import {
	fileEntity,
	fileRelations,
} from "@modules/empresa/entities/file.entity";
import { iconEntity } from "@modules/empresa/entities/icon.entity";
import {
	citiesRelations,
	cityEntity,
} from "@modules/ubigeo/entities/city.entity";
import { countryEntity } from "@modules/ubigeo/entities/country.entity";
import {
	regionEntity,
	regionsRelations,
} from "@modules/ubigeo/entities/region.entity";
import { userEntity } from "@modules/user/entities/user.entity";

export interface Schema {
	user: typeof userEntity;
	address: typeof addressEntity;
	addressRelations: typeof addressRelations;
	empresa: typeof empresaEntity;
	empresaRelations: typeof empresaRelations;
	company: typeof companyEntity;
	companyRelations: typeof companyRelations;
	icon: typeof iconEntity;
	file: typeof fileEntity;
	fileRelations: typeof fileRelations;
	country: typeof countryEntity;
	region: typeof regionEntity;
	regionsRelations: typeof regionsRelations;
	city: typeof cityEntity;
	citiesRelations: typeof citiesRelations;
	[key: string]: unknown;
}
export const schema: Schema = {
	user: userEntity,
	address: addressEntity,
	addressRelations,
	empresa: empresaEntity,
	empresaRelations,
	company: companyEntity, // Added missing company entity
	companyRelations,
	icon: iconEntity,
	file: fileEntity,
	fileRelations,
	country: countryEntity,
	region: regionEntity,
	regionsRelations,
	city: cityEntity,
	citiesRelations,
};
