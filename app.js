const $ = (id)=>document.getElementById(id);
const esc = (s)=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const money = n => Number(n).toLocaleString('ko-KR')+'원';
const cleanRoom = r => r.roomType.replace(/\(취사[불가능]+\)/g,'').trim();
function searchUrl(q, engine='naver'){
  if(engine==='google') return 'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(q);
  if(engine==='bing') return 'https://www.bing.com/images/search?q='+encodeURIComponent(q);
  if(engine==='duck') return 'https://duckduckgo.com/?q='+encodeURIComponent(q)+'&iar=images&iax=images&ia=images';
  if(engine==='map') return 'https://map.naver.com/p/search/'+encodeURIComponent(q);
  if(engine==='web') return 'https://www.bing.com/search?q='+encodeURIComponent(q);
  return 'https://search.naver.com/search.naver?where=image&query='+encodeURIComponent(q);
}
function officialDomain(brand){
  const m={
    '한화리조트':'hanwharesort.co.kr','소노호텔앤리조트':'sonohotelsresorts.com','롯데리조트':'lotteresort.com','오크밸리리조트':'oakvalley.co.kr','웰리힐리 리조트':'wellihillipark.com','호반리조트 (구 리솜리조트)':'resom.co.kr','중흥골드 스파리조트':'jhresort.co.kr','알펜시아리조트':'alpensia.com','동강시스타':'donggangsistar.co.kr'
  };
  return m[brand] || '';
}
function officialQueries(r){
  const room=cleanRoom(r);
  const base=`${r.resort} ${room}`;
  const domain=officialDomain(r.brand);
  return {
    image:`${base} 이미지`,
    roomImage:`${base} 객실 이미지`,
    officialImage: domain ? `site:${domain} ${base} 객실 사진` : `${base} 공식 객실 사진`,
    capacity: domain ? `site:${domain} ${base} 기준인원 최대인원 객실정원` : `${base} 기준인원 최대인원 객실정원`,
    extraFee: domain ? `site:${domain} ${base} 인원추가 추가요금 추가비용` : `${base} 인원추가 추가요금 추가비용`,
    officialRoom: domain ? `site:${domain} ${base} 객실 안내` : `${base} 공식 객실 안내`
  };
}
function normForApi(s){
  if(typeof apiNorm === 'function') return apiNorm(s);
  return String(s||'').replace(/\(취사[불가능]+\)/g,'').replace(/\s+/g,'').replace(/[·.()\-_/]/g,'').trim();
}
function getApiInfo(r){
  const key = normForApi(r.resort)+'|'+normForApi(cleanRoom(r));
  return (window.API_ROOM_INFO_MAP && window.API_ROOM_INFO_MAP[key]) || null;
}
function hasApiImage(api){return api && api.imageUrl && api.imageUrl.startsWith('http');}
function isUsableApi(api){return api && ['API 사용가능','API 확인권장'].includes(api.status) && numericGuest(api.baseGuests) && numericGuest(api.maxGuests);}
function isReferenceApi(api){return api && ['API 검증필요','API 확인필요'].includes(api.status) && numericGuest(api.baseGuests) && numericGuest(api.maxGuests);}
function numericGuest(v){return /^\d+$/.test(String(v||'')) && Number(v)>0;}
function apiStatusForFilter(api){return api && api.status ? api.status : 'API 결과 없음';}
function ensureNightFilter(){
  if($('nightFilter')) return;
  const dateEl=$('dateFilter');
  if(!dateEl) return;
  const sel=document.createElement('select');
  sel.id='nightFilter';
  [['','박수 전체'],['1','1박'],['2','2박'],['3','3박']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.appendChild(o);});
  sel.onchange=render;
  dateEl.insertAdjacentElement('afterend',sel);
}
function init(){
  ensureNightFilter();
  [...new Set(ROOMS.map(r=>r.region))].sort().forEach(v=> $('region').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  [...new Set(ROOMS.map(r=>r.brand))].forEach(v=> $('brand').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  $('totalBadge').textContent=ROOMS.length+'건'; render();
}
function filtered(){
 const q=($('q')?.value||'').trim().toLowerCase();
 const df=$('dateFilter')?.value||'';
 const nf=$('nightFilter')?.value||'';
 const reg=$('region')?.value||'';
 const br=$('brand')?.value||'';
 const cap=Number($('cap')?.value||0);
 const vf=$('verified')?.value||'';
 return ROOMS.filter(r=>{
  const api=getApiInfo(r);
  const displayMax = isUsableApi(api) ? Number(api.maxGuests) : Number(r.maxGuests||0);
  const txt=[r.no,r.resort,r.roomType,r.city,r.region,r.brand,r.date,r.date.slice(5).replace('-','/'),r.day,r.nights,api?.apiRoomName,api?.note,api?.status,api?.usability].join(' ').toLowerCase();
  return (!q||txt.includes(q)) && (!df||r.date===df) && (!nf||String(r.nights)===nf) && (!reg||r.region===reg) && (!br||r.brand===br) && (!cap||displayMax>=cap) && (!vf||apiStatusForFilter(api)===vf);
 });
}
function render(){
 ensureNightFilter();
 const rows=filtered(); $('count').innerHTML=`<b>${rows.length}</b>건 표시 중`;
 const grouped={}; rows.forEach(r=>(grouped[r.brand]??=[]).push(r));
 $('app').innerHTML=Object.entries(grouped).map(([brand,items])=>groupTable(brand,items)).join('') || '<div class="empty">검색 결과가 없습니다.</div>';
}
function groupTable(brand,items){
 return `<section class="resort-group"><h2>${esc(brand)} <span>${items.length}건</span></h2><div class="list-wrap"><table class="resort-list"><thead><tr><th>번호</th><th>날짜</th><th>박수</th><th>리조트 (지역)</th><th>룸 타입</th><th>기준/최대</th><th>API 매칭</th><th>금액</th><th>신청자</th><th>액션</th></tr></thead><tbody>${items.map(row).join('')}</tbody></table></div></section>`;
}
function dayBadge(day){return `<span class="day">${esc(day)}</span>`}
function nightBadge(n){return `<span class="night">${n}박</span>`}
function statusText(r,api){
  if(api?.status==='API 사용가능') return '<span class="verified">API 사용가능</span>';
  if(api?.status==='API 확인권장') return '<span class="verified">API 확인권장</span>';
  if(api?.status==='API 검증필요') return '<span class="api-ref">API 검증필요</span>';
  if(api?.status==='API 확인필요') return '<span class="api-ref">API 확인필요</span>';
  if(api?.status==='API 미사용권장') return '<span class="api-bad">API 미사용권장</span>';
  if(api?.status==='API 별도수집') return '<span class="api-none">API 별도수집</span>';
  if(api?.status==='API 상세없음') return '<span class="api-none">API 상세없음</span>';
  return r.verificationStatus==='자동추정' ? '<span class="warn">⊘ 확인필요</span>' : '<span class="verified">공식확인</span>';
}
function capBlock(r,api){
  if(isUsableApi(api)) return `<b>${esc(api.baseGuests)}인 기준</b><small>최대 ${esc(api.maxGuests)}인 · ${esc(api.status)}</small>`;
  if(isReferenceApi(api)) return `<b>${r.baseGuests||'?'}인 기준</b><small>자동추정 최대 ${r.maxGuests||'?'}인 · API 참고 ${esc(api.baseGuests)}/${esc(api.maxGuests)}</small>`;
  return `<b>${r.baseGuests||'?'}인 기준</b><small>최대 ${r.maxGuests||'?'}인 · 자동추정</small>`;
}
function apiBlock(api){
  if(!api) return `<span class="api-muted">API 결과 없음</span>`;
  const room = api.apiRoomName && api.apiRoomName !== 'N/A' ? api.apiRoomName : '객실 정보 없음';
  const img = hasApiImage(api) ? '<span class="img-ok">이미지 있음</span>' : '<span class="api-muted">이미지 없음</span>';
  const score = api.roomScore ? `<small>객실점수 ${esc(api.roomScore)} · 숙소점수 ${esc(api.hotelScore)}</small>` : '';
  return `<b>${esc(api.status)}</b><small>${esc(room)}</small>${score}${img}`;
}
function row(r){
 const q=officialQueries(r);
 const api=getApiInfo(r);
 const grade = r.sizeHint.replace('약 ','');
 const imgLink = hasApiImage(api) ? `<a class="image" href="${esc(api.imageUrl)}" target="_blank">API이미지</a>` : `<a class="image" href="${searchUrl(q.officialImage,'duck')}" target="_blank">공식사진</a>`;
 return `<tr><td class="num">${r.no}</td><td class="date"><b>${r.date.slice(5).replace('-','/')}</b> ${dayBadge(r.day)}</td><td>${nightBadge(r.nights)}</td><td class="place"><b>${esc(r.resort)}</b><span class="region-tag">${esc(r.city)}</span></td><td class="room-cell"><div>${esc(cleanRoom(r))}</div>${statusText(r,api)}</td><td class="cap">${capBlock(r,api)}<small>${esc(grade)}</small></td><td class="api-cell">${apiBlock(api)}</td><td class="money">${money(r.price)}</td><td><span class="applicants">${r.applicants}</span></td><td class="actions-cell"><button class="detail" onclick="openModal(${r.no})">▣ 상세</button>${imgLink}<a class="home" href="${esc(r.brandHomeUrl || searchUrl(q.officialRoom,'web'))}" target="_blank">공식홈</a></td></tr>`;
}
function openModal(no){
 const r=ROOMS.find(x=>x.no===no); if(!r) return;
 const q=officialQueries(r);
 const api=getApiInfo(r);
 const apiImage = hasApiImage(api) ? `<img class="api-img" src="${esc(api.imageUrl)}" alt="${esc(api.apiRoomName || r.resort)} 객실 이미지" onerror="this.style.display='none'">` : '';
 const apiPanel = api ? `<h3>한국관광공사 API 매칭</h3>${apiImage}<div class="grid"><div><label>매칭상태</label><b>${esc(api.status)}</b></div><div><label>사용 가능 여부</label><b>${esc(api.usability)}</b></div><div><label>contentid</label><b>${esc(api.contentid)}</b></div><div><label>매칭된 숙소명</label><b>${esc(api.matchedHotel)}</b></div><div><label>API 객실명</label><b>${esc(api.apiRoomName || '정보 없음')}</b></div><div><label>API 기준/최대</label><b>${esc(api.baseGuests)} / ${esc(api.maxGuests)}</b></div><div><label>숙소/객실 점수</label><b>${esc(api.hotelScore)} / ${esc(api.roomScore)}</b></div><div><label>비고</label><b>${esc(api.note)}</b></div></div>` : `<h3>한국관광공사 API 매칭</h3><p class="hint">해당 객실은 API 매칭 결과가 없습니다.</p>`;
 $('modalBody').innerHTML=`<h2>${esc(r.resort)}</h2><p class="sub">${esc(r.city)} · ${esc(r.roomType)}</p><div class="grid"><div><label>일정</label><b>${esc(r.date)} (${esc(r.day)}) · ${r.nights}박</b></div><div><label>요금</label><b>${money(r.price)}</b></div><div><label>자동추정 기준/최대</label><b>${r.baseGuests||'?'}인 / ${r.maxGuests||'?'}인</b></div><div><label>인원추가비</label><b>${esc(r.extraGuestFee)}</b></div><div><label>평수/등급</label><b>${esc(r.sizeHint)}</b></div><div><label>매핑 근거</label><b>${esc(r.capacityRule)}</b></div></div>${apiPanel}<div class="actions">${r.brandHomeUrl?`<a href="${esc(r.brandHomeUrl)}" target="_blank">공식 홈페이지</a>`:''}${hasApiImage(api)?`<a href="${esc(api.imageUrl)}" target="_blank">API 객실이미지</a>`:''}<a href="${searchUrl(q.officialRoom,'web')}" target="_blank">공식 객실 페이지 찾기</a><a href="${searchUrl(q.officialImage,'duck')}" target="_blank">공식 홈페이지 이미지</a><a href="${searchUrl(q.capacity,'web')}" target="_blank">정원 확인</a><a href="${searchUrl(q.extraFee,'web')}" target="_blank">인원추가비 확인</a></div><p class="hint">API 검증필요·확인필요·미사용권장 항목은 확정 정원으로 사용하지 마세요. 최종 신청 전 공식 홈페이지 확인이 필요합니다.</p>`;
 $('modal').classList.add('open'); document.body.style.overflow='hidden';
}
function closeModal(e){ if(e.target.id==='modal') closeModalDirect(); }
function closeModalDirect(){ $('modal').classList.remove('open'); document.body.style.overflow=''; }
function resetFilters(){ ['q','region','brand','cap','verified','dateFilter','nightFilter'].forEach(id=>{if($(id)) $(id).value='';}); render(); }
init();