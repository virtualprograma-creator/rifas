export function formatSpanishDate(date: Date | string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC', // IMPORTANTE: Previene errores de hidratación entre servidor y cliente
  })
    .format(new Date(date))
    .replace(/\s+de\s+/gi, ' ')
    .toUpperCase();
}
