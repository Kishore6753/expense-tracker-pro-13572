 // PUBLIC_INTERFACE
 export async function runApiDiagnostics(apiBase) {
   /** Runs basic API diagnostics in development: checks health and categories endpoints and logs results. */
   const base = apiBase || '';
   const mkUrl = (p) => `${base}${p}`;
   const results = {};
   try {
     const healthRes = await fetch(mkUrl('/'));
     results.health = {
       ok: healthRes.ok,
       status: healthRes.status,
       contentType: healthRes.headers.get('content-type') || '',
     };
     // Try to parse json if possible
     const ct = results.health.contentType.toLowerCase();
     results.health.sample =
       ct.includes('application/json') ? await healthRes.json().catch(() => null) : (await healthRes.text().catch(() => '')).slice(0, 120);
   } catch (e) {
     results.health = { ok: false, error: String(e) };
   }
   try {
     const catRes = await fetch(mkUrl('/api/categories'));
     results.categories = {
       ok: catRes.ok,
       status: catRes.status,
       contentType: catRes.headers.get('content-type') || '',
     };
     const ct = results.categories.contentType.toLowerCase();
     results.categories.sample =
       ct.includes('application/json') ? await catRes.json().catch(() => null) : (await catRes.text().catch(() => '')).slice(0, 120);
   } catch (e) {
     results.categories = { ok: false, error: String(e) };
   }
   // eslint-disable-next-line no-console
   console.info('API diagnostics:', results);
   return results;
 }
