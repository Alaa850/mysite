function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export default {
  async fetch(request) {
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }
    return jsonResponse({
      mode: process.env.REPAIR_REQUEST_MODE === 'mock' ? 'mock' : 'production',
      turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || ''
    });
  }
};
