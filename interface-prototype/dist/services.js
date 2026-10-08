/* Integration boundary. The backend team supplies window.SAI_BACKEND before this file.
 * No credentials, sessions or user content are stored in the browser by this adapter.
 */
window.SaiServices = (() => {
 const backend = window.SAI_BACKEND;
 const unavailable = () => Promise.reject(new Error('هذه الخدمة لم تُربط بعد. لم يتم حفظ أو إرسال أي بيانات.'));
 const call = (method, ...args) => backend && typeof backend[method] === 'function'
  ? Promise.resolve().then(() => backend[method](...args)) : unavailable();
 return {
  connected: !!backend,
  session: () => backend ? call('session') : Promise.resolve(null),
  catalog: () => backend ? call('catalog') : window.SAI_CATALOG ? window.SAI_CATALOG.catalog() : Promise.resolve(window.SAI_CONTENT),
  login: values => call('login', values), signup: values => call('signup', values),
  resetPassword: email => call('resetPassword', email), logout: () => call('logout'),
  recoveryRequired: () => backend?.recoveryRequired ? call('recoveryRequired') : Promise.resolve(false),
  changePassword: password => call('changePassword',password),
  profile: () => call('profile'), updateProfile: values => call('updateProfile', values),
  saved: () => call('saved'), setSaved: (kind,id,value) => call('setSaved', {kind,id,value}),
  submitExperience: values => call('submitExperience', values),
  myExperiences: () => call('myExperiences'),
  addContent: (kind, values) => call('addContent', {kind, ...values})
 };
})();
