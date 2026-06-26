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
function init(){
  [...new Set(ROOMS.map(r=>r.region))].sort().forEach(v=> $('region').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  [...new Set(ROOMS.map(r=>r.brand))].forEach(v=> $('brand').insertAdjacentHTML('beforeend',`<option>${esc(v)}</option>`));
  $('totalBadge').textContent=ROOMS.length+'건'; render();
}
function filtered(){
 const q=$('q').value.trim().toLowerCase(), reg=$('region').value, br=$('brand').value, cap=Number($('cap').value||0), vf=$('verified').value;
 return ROOMS.filter(r=>{
  const txt=[r.no,r.resort,r.roomType,r.city,r.region,r.brand,r.date,r.day].join(' ').toLowerCase();
  return (!q||txt.includes(q)) && (!reg||r.region===reg) && (!br||r.brand===br) && (!cap||Number(r.maxGuests)>=cap) && (!vf||r.verificationStatus===vf);
 });
}
function statusClass(r){ return r.verificationStatus==='공식확인' ? 'ok' : 'auto'; }
function render(){
 const rows=filtered(); $('count').innerHTML=`<b>${rows.length}</b>건 표시 중`;
 const grouped={}; rows.forEach(r=>(grouped[r.brand]??=[]).push(r));
 $('app').innerHTML=Object.entries(grouped).map(([brand,items])=>groupTable(brand,items)).join('') || '<div class="empty">검색 결과가 없습니다.</div>';
}
function groupTable(brand,items){
 return `<section class="resort-group"><h2>${esc(brand)} <span>${items.length}건</span></h2><div class="list-wrap"><table class="resort-list"><thead><tr><th>번호</th><th>날짜</th><th>박수</th><th>리조트 (지역)</th><th>룸 타입</th><th>기준/최대</th><th>평수/등급</th><th>금액</th><th>신청자</th><th>액션</th></tr></thead><tbody>${items.map(row).join('')}</tbody></table></div></section>`;
}
function dayBadge(day){return `<span class="day">${esc(day)}</span>`}
function nightBadge(n){return `<span class="night">${n}박</span>`}
function statusText(r){return r.verificationStatus==='자동추정' ? '<span class="warn">⊘ 확인필요</span>' : '<span class="verified">공식확인</span>'}
function row(r){
 const q=officialQueries(r);
 const fit = r.maxGuests>=5 ? '넉넉' : r.maxGuests>=4 ? '최적' : '확인필요';
 const grade = r.sizeHint.replace('약 ','');
 const desc = r.capacityRule.includes('스위트')||r.capacityRule.includes('로얄') ? '스위트/로얄급' : r.maxGuests>=4 ? '4인 가족 투숙 가능' : '세부 확인 필요';
 return `<tr><td class="num">${r.no}</td><td class="date"><b>${r.date.slice(5).replace('-','/')}</b> ${dayBadge(r.day)}</td><td>${nightBadge(r.nights)}</td><td class="place"><b>${esc(r.resort)}</b><span class="region-tag">${esc(r.city)}</span></td><td class="room-cell"><div>${esc(cleanRoom(r))}</div>${statusText(r)}</td><td class="cap"><b>${r.baseGuests||'?'}인 기준</b><small>최대 ${r.maxGuests||'?'}인 · ${fit}</small></td><td class="size"><b>${esc(grade)}</b><small>${esc(desc)}</small></td><td class="money">${money(r.price)}</td><td><span class="applicants">${r.applicants}</span></td><td class="actions-cell"><button class="detail" onclick="openModal(${r.no})">▣ 상세</button><a class="apply" href="${searchUrl(q.capacity,'web')}" target="_blank">정원확인 →</a></td></tr>`;
}
function openModal(no){
 const r=ROOMS.find(x=>x.no===no); if(!r) return;
 const q=officialQueries(r);
 $('modalBody').innerHTML=`<h2>${esc(r.resort)}</h2><p class="sub">${esc(r.city)} · ${esc(r.roomType)}</p><div class="grid"><div><label>일정</label><b>${esc(r.date)} (${esc(r.day)}) · ${r.nights}박</b></div><div><label>요금</label><b>${money(r.price)}</b></div><div><label>기준/최대</label><b>${r.baseGuests||'?'}인 / ${r.maxGuests||'?'}인</b></div><div><label>인원추가비</label><b>${esc(r.extraGuestFee)}</b></div><div><label>평수/등급</label><b>${esc(r.sizeHint)}</b></div><div><label>매핑 근거</label><b>${esc(r.capacityRule)}</b></div><div><label>사진 출처</label><b>미리보기 이미지 미사용</b></div><div><label>확인상태</label><b>${r.verificationStatus==='자동추정'?'정원 확인필요':esc(r.verificationStatus)}</b></div></div><div class="actions">${r.officialRoomUrl?`<a href="${esc(r.officialRoomUrl)}" target="_blank">공식 객실 페이지</a>`:''}${r.brandHomeUrl?`<a href="${esc(r.brandHomeUrl)}" target="_blank">브랜드 공식 홈페이지</a>`:''}<a href="${searchUrl(q.officialRoom,'web')}" target="_blank">공식 객실 페이지 찾기</a><a href="${searchUrl(q.capacity,'web')}" target="_blank">정원 확인</a><a href="${searchUrl(q.extraFee,'web')}" target="_blank">인원추가비 확인</a><a href="${searchUrl(q.roomImage,'duck')}" target="_blank">DuckDuckGo 객실 이미지</a><a href="${searchUrl(q.officialImage,'duck')}" target="_blank">DuckDuckGo 공식도메인 이미지</a><a href="${searchUrl(q.officialImage,'bing')}" target="_blank">Bing 공식사진 후보</a><a href="${searchUrl(q.image,'naver')}" target="_blank">네이버 객실사진</a><a href="${searchUrl(q.image,'google')}" target="_blank">구글 이미지</a><a href="${searchUrl(r.resort,'map')}" target="_blank">지도/리뷰 사진</a></div><p class="hint">현재 화면에서는 미리보기 이미지를 표시하지 않습니다. 정원/추가비는 공식 페이지에서 확인 후 data/rooms.js에 공식확인값으로 반영하는 구조입니다.</p>`;
 $('modal').classList.add('open'); document.body.style.overflow='hidden';
}
function closeModal(e){ if(e.target.id==='modal') closeModalDirect(); }
function closeModalDirect(){ $('modal').classList.remove('open'); document.body.style.overflow=''; }
function resetFilters(){ ['q','region','brand','cap','verified'].forEach(id=>$(id).value=''); render(); }
init();
