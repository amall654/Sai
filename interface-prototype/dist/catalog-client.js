/* Public read-only client. Never put secret/service_role keys in this file. */
window.SaiCatalogClient = {
 async read(table, columns, query = '') {
  const response = await fetch(`https://xzdhyccemkndxabwbrpe.supabase.co/rest/v1/${table}?select=${encodeURIComponent(columns)}${query}`, {
   headers: {apikey: 'sb_publishable_s4IBiCHXNUIB2YkJnaV_LQ_Wm-K_02h'},
   signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error('تعذّر تحميل المحتوى من قاعدة البيانات. حاول مرة أخرى.');
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('تعذّر قراءة المحتوى.');
  return rows;
 }
};
