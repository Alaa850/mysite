const siteOrigin = 'https://techpro99.com';
const key = '7f11ece60d8e6a31b291e346cf27b5c1';
const keyLocation = `${siteOrigin}/${key}.txt`;

async function fetchWithRetry(url, attempts = 6) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'user-agent': 'TecPro99-IndexNow/1.0' } });
      if (response.ok) return response;
      lastError = new Error(`${url} returned HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 10_000));
    }
  }

  throw lastError;
}

const sitemapResponse = await fetchWithRetry(`${siteOrigin}/sitemap.xml`);
const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>\s*(https:\/\/techpro99\.com\/[^<]*)\s*<\/loc>/g)]
  .map((match) => match[1]);

if (urlList.length === 0) {
  throw new Error('No canonical TecPro99 URLs were found in the live sitemap.');
}

const response = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: 'techpro99.com', key, keyLocation, urlList })
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow returned HTTP ${response.status}: ${await response.text()}`);
}

console.log(`IndexNow accepted ${urlList.length} URLs with HTTP ${response.status}.`);
