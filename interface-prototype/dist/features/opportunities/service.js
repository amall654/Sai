/* Opportunity database mapping; RLS enforces publication and expiry. */
window.SaiOpportunityService = async function(fields, types) {
 const rows = await window.SaiCatalogClient.read('opportunities',
  'id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,published_at,status,opportunity_fields(field_id)', '&order=created_at.desc');
 return rows.map(o => ({id:o.id,title:o.title,description:o.description,
  originalText:o.original_text,sourceName:o.source_name,sourceUrl:o.source_url,
  registrationUrl:o.registration_url,type:types.get(o.type)||o.type,mode:o.mode,
  deadline:o.deadline_text||o.deadline_at||'',publishedAt:o.published_at,status:o.status,
  fields:(o.opportunity_fields||[]).map(f=>fields.get(f.field_id)).filter(Boolean)}));
};
