const $ = (id)=>document.getElementById(id);
const esc = (s)=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const money = n => Number(n).toLocaleString('ko-KR')+'원';
function searchUrl(q, engine='naver'){
  if(engine==='google') return 'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(q);
  if(engine==='map') return 'https://map.naver.com/p/search/'+encodeURIComponent(q);
  return 'https://search.naver.com/search.naver?where=image&query='+encodeURIComponent(q);
}
function init(){
  [...new Set(ROOMS.map(r=>r.region))].sort().forEach(v=> $('region').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  [...new Set(ROOMS.map(r=>r.brand))].forEach(v=> $('brand').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  $('totalBadge').textContent=ROOMS.length+'건'; render();
}
function filtered(){
 const q=$('q').value.trim().toLowerCase(), reg=$('region').value, br=$('brand').value, cap=Number($('cap').value||0), vf=$('verified').value;
 return ROOMS.filter(r=>{
  const txt=[r.resort,r.roomType,r.city,r.region,r.brand].join(' ').toLowerCase();
  return (!q||txt.includes(q)) && (!reg||r.region===reg) && (!br||r.brand===br) && (!cap||Number(r.maxGuests)>=cap) && (!vf||r.verificationStatus===vf);
 });
}
function render(){
 const rows=filtered(); $('count').innerHTML=`<b>${rows.length}</b>건 표시 중`;
 const grouped={}; rows.forEach(r=>(grouped[r.brand]??=[]).push(r));
 $('app').innerHTML=Object.entries(grouped).map(([brand,items])=>`<section class="brand"><h2>${esc(brand)} <small>${items.length}건</small></h2><div class="cards">${items.map(card).join('')}</div></section>`).join('') || '<div class="empty">검색 결과가 없습니다.</div>';
}
function card(r){
 const photo = r.officialImageUrl || r.localImageUrl;
 const img = photo ? `<img class="thumb" src="${esc(photo)}" alt="${esc(r.resort+' '+r.roomType)}" onerror="this.outerHTML='<div class=&quot;thumb empty-thumb&quot;>공식 이미지 표시 실패</div>'">` : `<div class="thumb empty-thumb">공식 사진 URL<br>미등록</div>`;
 return `<article class="card">${img}<div class="card-body"><div class="top"><span class="tag">${esc(r.city)}</span><span class="status ${r.verificationStatus==='공식확인'?'ok':'auto'}">${esc(r.verificationStatus)}</span></div><h3>${esc(r.resort)}</h3><p class="room">${esc(r.roomType.replace(/\(취사[불가능]+\)/g,''))}</p><div class="meta"><b>${r.baseGuests||'?'}인 기준 / 최대 ${r.maxGuests||'?'}인</b><span>${esc(r.sizeHint)}</span><span>${r.cooking?'취사가능':'취사불가'}</span><span>${money(r.price)}</span></div><button onclick="openModal(${r.no})">상세 확인</button></div></article>`;
}
function openModal(no){
 const r=ROOMS.find(x=>x.no===no); if(!r) return;
 const query=`${r.resort} ${r.roomType.replace(/\(취사[불가능]+\)/g,'')} 객실 정원 인원추가 비용 사진`;
 const photo = r.officialImageUrl || r.localImageUrl;
 $('modalBody').innerHTML=`<h2>${esc(r.resort)}</h2><p class="sub">${esc(r.city)} · ${esc(r.roomType)}</p>${photo?`<img class="modal-img" src="${esc(photo)}" alt="${esc(r.resort)} 객실 사진">`:`<div class="modal-img empty-thumb">공식 객실 사진 URL 미등록</div>`}<div class="grid"><div><label>일정</label><b>${esc(r.date)} (${esc(r.day)}) · ${r.nights}박</b></div><div><label>요금</label><b>${money(r.price)}</b></div><div><label>기준/최대</label><b>${r.baseGuests||'?'}인 / ${r.maxGuests||'?'}인</b></div><div><label>인원추가비</label><b>${esc(r.extraGuestFee)}</b></div><div><label>평수/등급</label><b>${esc(r.sizeHint)}</b></div><div><label>매핑 근거</label><b>${esc(r.capacityRule)}</b></div><div><label>사진 출처</label><b>${esc(r.imageSource)}</b></div><div><label>확인상태</label><b>${esc(r.verificationStatus)}</b></div></div><div class="actions">${r.officialRoomUrl?`<a href="${esc(r.officialRoomUrl)}" target="_blank">공식 객실 페이지</a>`:''}${r.brandHomeUrl?`<a href="${esc(r.brandHomeUrl)}" target="_blank">브랜드 공식 홈페이지</a>`:''}<a href="${searchUrl(query,'naver')}" target="_blank">네이버 객실사진 검색</a><a href="${searchUrl(query,'google')}" target="_blank">구글 이미지 검색</a><a href="${searchUrl(r.resort,'map')}" target="_blank">지도/리뷰 사진</a></div><p class="hint">공식 이미지 URL을 data/rooms.js의 officialImageUrl에 넣으면 이 팝업에 바로 표시됩니다. 외부 표시가 막히면 images 폴더에 저장 후 localImageUrl을 사용하세요.</p>`;
 $('modal').classList.add('open'); document.body.style.overflow='hidden';
}
function closeModal(e){ if(e.target.id==='modal') closeModalDirect(); }
function closeModalDirect(){ $('modal').classList.remove('open'); document.body.style.overflow=''; }
function resetFilters(){ ['q','region','brand','cap','verified'].forEach(id=>$(id).value=''); render(); }
init();
