// Small helper to format numbers as localized price strings (without currency symbol)
function formatPrice(value, locale = 'es-CO') {
  const n = Number(value);
  if (!isFinite(n)) return '0';
  return n.toLocaleString(locale);
}

export { formatPrice };
