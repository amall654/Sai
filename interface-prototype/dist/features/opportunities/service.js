/* Opportunity database mapping; RLS enforces publication and expiry. */
function saudiOpportunityDeadline(iso, originalText='') {
 // Only convert an explicit instant. Date-only announcements must not gain an invented time.
 if(!iso || !/T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(iso))return originalText||'';
 const date=new Date(iso);
 if(Number.isNaN(date.getTime()))return originalText||'';
 return 'إغلاق التسجيل: '+new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{
  timeZone:'Asia/Riyadh',year:'numeric',month:'long',day:'numeric',
  hour:'numeric',minute:'2-digit',hour12:true
 }).format(date)+' بتوقيت السعودية';
}
window.SaiOpportunityService = async function(fields, types) {
 const rows = await window.SaiCatalogClient.read('opportunities',
  'id,title,description,original_text,source_name,source_url,registration_url,type,mode,deadline_at,deadline_text,published_at,status,opportunity_fields(field_id)', '&order=created_at.desc');
 return rows.map(o => ({id:o.id,title:o.title,description:o.description,
  originalText:o.original_text,sourceName:o.source_name,sourceUrl:o.source_url,
  registrationUrl:o.registration_url,type:types.get(o.type)||o.type,mode:o.mode,
  deadline:saudiOpportunityDeadline(o.deadline_at,o.deadline_text),publishedAt:o.published_at,status:o.status,
  fields:(o.opportunity_fields||[]).map(f=>fields.get(f.field_id)).filter(Boolean)}));
};
