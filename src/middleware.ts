import { PUBLIC_ENV } from "astro:env/client";
import { defineMiddleware } from "astro:middleware";
export const onRequest = defineMiddleware((context, next) => {
	// Si estamos en desarrollo, los datos vienen por el Header 'x-astro-locals'
	// que inyectó nuestro Proxy.
	// Rellenamos el contexto de Astro con los datos del Backend
	const locals =
		PUBLIC_ENV === "development"
			? JSON.parse(context.request.headers.get("x-astro-locals") || "{}")
			: context.locals;
	Object.assign(context.locals, locals);

	// En producción, context.locals ya viene lleno gracias al adaptador de Node.
	return next();
});
