window.NEARBY_INFO = window.NEARBY_INFO || {};
(function(){
  const blobApiUrl = 'https://api.github.com/repos/duckfrog-100/brain_test/git/blobs/3650eb5e691901a383272fad55c890e7d16fda5d';
  const decodeBase64Utf8 = (value) => {
    const binary = atob(String(value || '').replace(/\s/g, ''));
    const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  };
  const parseNearbyData = (code) => {
    const trimmed = String(code || '').trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('};');
    const jsonText = trimmed.slice(start, end + 1);
    return JSON.parse(jsonText);
  };

  window.NEARBY_INFO_LOADING = true;

  fetch(blobApiUrl)
    .then(res => {
      if(!res.ok) throw new Error('GitHub blob fetch failed: ' + res.status);
      return res.json();
    })
    .then(data => {
      const code = decodeBase64Utf8(data.content);
      window.NEARBY_INFO = parseNearbyData(code);
      window.NEARBY_INFO_LOADING = false;
      window.NEARBY_INFO_READY = true;
      window.dispatchEvent(new Event('nearby-info-ready'));
    })
    .catch(err => {
      console.warn('주변 관광정보 로딩 실패', err);
      window.NEARBY_INFO_LOADING = false;
      window.NEARBY_INFO_READY = false;
    });
})();
