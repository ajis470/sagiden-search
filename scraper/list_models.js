const key = 'AIzaSyABMohOmiwRrlSMhJ4MaioMHmNjNJ3Cdps';

(async () => {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
  const json = await res.json();
  const models = json.models || [];
  // flash系のみ表示
  models.filter(m => m.name.includes('flash')).forEach(m => {
    console.log(m.name, '|', m.displayName, '|', m.supportedGenerationMethods?.join(','));
  });
})();
