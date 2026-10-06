/* Catalog only: authentication, saves and submissions remain unconnected. */
window.SAI_CATALOG = window.SAI_CATALOG || {
 async catalog() {
  const [fields, types] = await Promise.all([
   window.SaiCatalogClient.read('fields','id,label_ar','&order=sort_order.asc'),
   window.SaiCatalogClient.read('opportunity_types','id,label_ar')
  ]);
  const fieldLabels = new Map(fields.map(f=>[f.id,f.label_ar]));
  const typeLabels = new Map(types.map(t=>[t.id,t.label_ar]));
  const [opportunities, providers] = await Promise.all([
   window.SaiOpportunityService(fieldLabels,typeLabels),window.SaiLearningService(fieldLabels)
  ]);
  return {opportunities,providers,experiences:[],interests:['الكل',...fieldLabels.values()],opportunityTypes:[...typeLabels.values()]};
 }
};
