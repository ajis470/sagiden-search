const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyABMohOmiwRrlSMhJ4MaioMHmNjNJ3Cdps');

(async () => {
  // まずflashで疎通確認
  try {
    const m = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const r = await m.generateContent('テストです。「OK」とだけ返してください。');
    console.log('gemini-2.5-flash:', r.response.text());
  } catch(e) { console.log('gemini-2.5-flash エラー:', e.message.substring(0,100)); }

  // 次にliteで確認
  try {
    const m = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });
    const r = await m.generateContent('テストです。「OK」とだけ返してください。');
    console.log('gemini-2.5-flash-lite:', r.response.text());
  } catch(e) { console.log('gemini-2.5-flash-lite エラー:', e.message.substring(0,150)); }
})();
