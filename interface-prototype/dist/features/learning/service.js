/* Learning provider database mapping. */
window.SaiLearningService = async function(fields) {
 const rows = await window.SaiCatalogClient.read('providers',
  'id,name,description,official_url,details,language,cost,content_types,published_at,status,provider_fields(field_id)', '&order=created_at.desc');
 return rows.map(p=>({id:p.id,name:p.name,description:p.description,url:p.official_url,
  details:p.details,language:p.language,cost:p.cost,contentTypes:p.content_types,
  publishedAt:p.published_at,status:p.status,
  fields:(p.provider_fields||[]).map(f=>fields.get(f.field_id)).filter(Boolean)}));
};
