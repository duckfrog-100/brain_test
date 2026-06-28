(function(){
  function hasNearbyData(data){
    return data && (
      (data.attractions && data.attractions.length) ||
      (data.culture && data.culture.length) ||
      (data.restaurants && data.restaurants.length)
    );
  }

  function getNearbyData(resortName){
    return window.NEARBY_INFO && window.NEARBY_INFO[resortName];
  }

  function safeEsc(value){
    return typeof esc === 'function' ? esc(value) : String(value ?? '');
  }

  function placeCard(item){
    const title = safeEsc(item.title || '이름 정보 없음');
    const type = safeEsc(item.type || '주변 정보');
    const distance = safeEsc(item.distance || '거리 정보 없음');
    const overview = safeEsc(item.overview || '설명 정보 없음');
    const address = safeEsc(item.address || '주소 정보 없음');
    const image = item.image ? `<img src="${safeEsc(item.image)}" alt="${title}" loading="lazy" onerror="this.outerHTML='<div class=&quot;nearby-noimg&quot;>이미지 없음</div>'">` : '<div class="nearby-noimg">이미지 없음</div>';
    const mapUrl = item.mapUrl || searchUrl(`${item.title || ''} ${item.address || ''}`, 'map');
    const infoUrl = item.infoUrl || searchUrl(item.title || '', 'web');

    return `<article class="nearby-card">
      <div class="nearby-thumb">${image}</div>
      <div class="nearby-body">
        <div class="nearby-chip-row"><span class="nearby-chip">${type}</span><span class="nearby-distance">${distance}</span></div>
        <h4>${title}</h4>
        <p class="nearby-overview">${overview}</p>
        <p class="nearby-address">${address}</p>
        <div class="nearby-links">
          <a href="${safeEsc(mapUrl)}" target="_blank">지도 보기</a>
          <a href="${safeEsc(infoUrl)}" target="_blank">정보 검색</a>
        </div>
      </div>
    </article>`;
  }

  function renderSection(title, emoji, items){
    if(!items || !items.length){
      return `<section class="nearby-section"><h3>${emoji} ${safeEsc(title)}</h3><p class="nearby-empty">조회된 정보가 없습니다.</p></section>`;
    }

    return `<section class="nearby-section">
      <h3>${emoji} ${safeEsc(title)} <span>${items.length}곳</span></h3>
      <div class="nearby-grid">${items.map(placeCard).join('')}</div>
    </section>`;
  }

  function fallbackSearchBlock(r){
    const q = nearbyQueries(r);
    return `<section class="nearby-fallback">
      <h3>직접 검색하기</h3>
      <p class="hint">이 숙소는 아직 저장된 TourAPI 주변 정보가 없어서 검색 링크를 먼저 보여줍니다.</p>
      <div class="actions nearby-actions">
        <a href="${searchUrl(q.attractionMap,'map')}" target="_blank">네이버지도 관광지</a>
        <a href="${searchUrl(q.restaurantMap,'map')}" target="_blank">네이버지도 맛집</a>
        <a href="${searchUrl(q.cafeMap,'map')}" target="_blank">네이버지도 카페</a>
        <a href="${searchUrl(q.familyMap,'map')}" target="_blank">아이랑 갈만한 곳</a>
        <a href="${searchUrl(q.attractionWeb,'web')}" target="_blank">관광지 추천 검색</a>
        <a href="${searchUrl(q.restaurantWeb,'web')}" target="_blank">맛집 추천 검색</a>
        <a href="${searchUrl(q.travelCourse,'web')}" target="_blank">여행 코스 검색</a>
      </div>
    </section>`;
  }

  window.openNearbyModal = function(no){
    const r = ROOMS.find(x => x.no === no);
    if(!r) return;

    const data = getNearbyData(r.resort);
    const infoReady = hasNearbyData(data);
    const sourceNote = data?.note || '한국관광공사 TourAPI 위치기반 주변정보';
    const matchedStay = data?.stayTitle || r.resort;
    const matchedAddress = data?.address || `${r.city || ''} ${r.region || ''}`.trim();

    const body = `<div class="nearby-modal">
      <div class="nearby-hero">
        <div>
          <p class="nearby-kicker">주변 관광 정보</p>
          <h2>📍 ${safeEsc(r.resort)}</h2>
          <p>${safeEsc(r.city)} · ${safeEsc(r.region)} · ${safeEsc(r.date)} (${safeEsc(r.day)}) · ${safeEsc(r.nights)}박</p>
        </div>
        <div class="nearby-source">${infoReady ? 'TourAPI 수집완료' : '검색 링크 제공'}</div>
      </div>

      <div class="nearby-summary">
        <div><label>매칭 숙소</label><b>${safeEsc(matchedStay)}</b></div>
        <div><label>주소/지역</label><b>${safeEsc(matchedAddress || '정보 없음')}</b></div>
        <div><label>룸타입</label><b>${safeEsc(cleanRoom(r))}</b></div>
        <div><label>출처</label><b>${safeEsc(sourceNote)}</b></div>
      </div>

      ${infoReady ? `
        ${renderSection('관광지', '🏞️', data.attractions)}
        ${renderSection('문화시설', '🎭', data.culture)}
        ${renderSection('음식점', '🍽️', data.restaurants)}
        ${fallbackSearchBlock(r)}
      ` : fallbackSearchBlock(r)}

      <p class="nearby-note">관광 정보는 참고용입니다. 영업시간, 휴무일, 예약 가능 여부, 이동시간은 방문 전에 지도 또는 공식 채널에서 다시 확인하세요.</p>
    </div>`;

    $('modalBody').innerHTML = body;
    $('modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  };
})();
