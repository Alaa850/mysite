export const SHOP_CLOSURE = Object.freeze({
  startsAt: '2026-10-22T23:45:00Z',
  reopensAt: '2026-10-23T17:45:00Z',
  timeZone: 'America/Chicago'
});

export function getShopClosure(now = Date.now()) {
  const timestamp = now instanceof Date ? now.getTime() : Number(now);
  const start = Date.parse(SHOP_CLOSURE.startsAt);
  const end = Date.parse(SHOP_CLOSURE.reopensAt);
  return Number.isFinite(timestamp) && timestamp >= start && timestamp < end
    ? { ...SHOP_CLOSURE, retryAfterSeconds: Math.max(1, Math.ceil((end - timestamp) / 1000)) }
    : null;
}
