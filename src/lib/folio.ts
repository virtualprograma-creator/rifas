const FOLIO_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createFolio(length = 10) {
  let folio = '';
  for (let i = 0; i < length; i++) {
    folio += FOLIO_ALPHABET[Math.floor(Math.random() * FOLIO_ALPHABET.length)];
  }
  return folio;
}

export function displayFolio(order: { folio?: string | null; id: string }) {
  return (order.folio || order.id.slice(-10)).toUpperCase();
}
