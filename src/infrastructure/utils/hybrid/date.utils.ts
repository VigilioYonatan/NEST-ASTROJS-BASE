import dayjs from "dayjs";
import "dayjs/locale/es";
import type { EmpresaSchemaFromServer } from "@modules/empresa/schemas/empresa.schema";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { TIMEZONE_DEFAULT } from "../../consts/hybrid";

dayjs.extend(relativeTime);
dayjs.locale("es");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

/**
 * Obtiene la hora de una fecha
 * @param date La fecha
 */
export function getHour(
    date: Date | string,
    empresa: EmpresaSchemaFromServer | null = null
): string {
    return dayjs(date)
        .tz(empresa?.timezone || TIMEZONE_DEFAULT!)
        .format("HH:mm");
}

/**
 * Formatea una fecha con timezone
 * @param date La fecha
 * @param format El formato de la fecha
 */
export function formatDateTz(
    date: Date,
    // format = "D [de] MMMM [de] YYYY, hh:mm A",
    format = "DD/MM/YYYY, HH:mm A",
    empresa: EmpresaSchemaFromServer | null = null
) {
    return dayjs(date)
        .tz(empresa?.timezone || TIMEZONE_DEFAULT!)
        .format(format);
}

export function formatDateUTC(
    date: Date | string,
    format = "DD/MM/YYYY, HH:mm A"
) {
    return dayjs(date).utc().format(format);
}

export function formatDateTzUTC(
    date: Date | string,
    empresa: EmpresaSchemaFromServer | null = null
) {
    return dayjs(date).tz(empresa?.timezone || TIMEZONE_DEFAULT!);
}

// 21-10-1998
export function formatInput(date: Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

export function now() {
    return dayjs().tz();
}

// formatoTemporizadorFlexible , pasas minutos y te da el formato que quieras
export function formatoTemporizadorFlexible(
    minutos: number,
    segundos = 0,
    formato = "HH:MM:SS"
) {
    // Convertimos todo a segundos y redondeamos para evitar decimales
    const totalSegundos = Math.floor(minutos * 60 + segundos);

    const horas = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const secs = totalSegundos % 60; // ya es entero

    const valores = {
        HH: horas.toString().padStart(2, "0"),
        H: horas.toString(),
        MM: mins.toString().padStart(2, "0"),
        M: mins.toString(),
        SS: secs.toString().padStart(2, "0"),
        S: secs.toString(),
        hh: (horas % 12 || 12).toString().padStart(2, "0"),
        h: (horas % 12 || 12).toString(),
    };

    return formato.replace(
        /HH|H|MM|M|SS|S|hh|h/g,
        (match: string) => valores[match as keyof typeof valores]
    );
}

export function showTime(
    date: Date | string,
    empresa: EmpresaSchemaFromServer | null = null
) {
    return dayjs()
        .tz(empresa?.timezone || TIMEZONE_DEFAULT!)
        .to(date);
}

export default dayjs;
