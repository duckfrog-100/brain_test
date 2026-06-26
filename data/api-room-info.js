// 한국관광공사 API 객실 매칭 결과
// 주의: '객실명 직접 매칭'만 확정 참고값에 가깝고, '정확한 객실명 매칭 실패'는 참고값으로만 표시합니다.
const API_ROOM_INFO_RAW = `투숙 장소	객실 타입	contentid	매칭된 숙소명	API 객실명	기준인원	최대인원	객실이미지	비고
한화리조트 거제 벨버디어	디럭스 뽀로로 MOTIONPLAY 원룸 호텔형	2660777	한화리조트 거제 벨버디어	디럭스	4	4	https://tong.visitkorea.or.kr/cms/resource/82/4057082_image2_1.jpg	객실명 직접 매칭
한화리조트 해운대	디럭스 오션뷰 호텔형	137706	한화리조트 해운대	로얄(바다전망)	7	9	https://tong.visitkorea.or.kr/cms/resource/56/1348056_1.0_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
한화리조트 거제 벨버디어	디럭스 뽀로로 PEEKABOO 원룸 호텔형	2660777	한화리조트 거제 벨버디어	디럭스	4	4	https://tong.visitkorea.or.kr/cms/resource/82/4057082_image2_1.jpg	객실명 직접 매칭
한화리조트 거제 벨버디어	로얄 호텔형	2660777	한화리조트 거제 벨버디어	로얄	7	7	https://tong.visitkorea.or.kr/cms/resource/76/4057076_image2_1.jpg	객실명 직접 매칭
한화리조트 거제 벨버디어	스위트 뽀로로 MOTIONPLAY 호텔형	2660777	한화리조트 거제 벨버디어	스위트	5	5	https://tong.visitkorea.or.kr/cms/resource/78/4057078_image2_1.jpg	객실명 직접 매칭
한화리조트 해운대	로얄 오션뷰	137706	한화리조트 해운대	로얄(바다전망)	7	9	https://tong.visitkorea.or.kr/cms/resource/56/1348056_1.0_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
한화리조트 거제 벨버디어	로얄 오션뷰 호텔형	2660777	한화리조트 거제 벨버디어	로얄	7	7	https://tong.visitkorea.or.kr/cms/resource/76/4057076_image2_1.jpg	객실명 직접 매칭
소노벨 청송	스위트 플러스 파크뷰 침대	2770765	소노벨 청송	패밀리(취사/클린)	4	6	https://tong.visitkorea.or.kr/cms/resource/11/4071311_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
소노캄 경주	디럭스 스위트B 레이크 더블1, 싱글1/클린	232286	소노캄 경주	패밀리 취사(뷰프리)	4	6	https://tong.visitkorea.or.kr/cms/resource/31/3583931_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
소노캄 거제	탑 스위트 파노라마 침대	2578495	소노캄 거제	스위트	5	8	https://tong.visitkorea.or.kr/cms/resource/07/4060807_image2_1.jpg	객실명 직접 매칭
소노캄 거제	스위트 오션뷰 침대/클린	2578495	소노캄 거제	스위트	5	8	https://tong.visitkorea.or.kr/cms/resource/07/4060807_image2_1.jpg	객실명 직접 매칭
소노캄 경주	디럭스 스위트B 뷰프리더블1, 싱글1/클린	232286	소노캄 경주	패밀리 취사(뷰프리)	4	6	https://tong.visitkorea.or.kr/cms/resource/31/3583931_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
소노캄 비발디파크	소노캄 B 파크뷰 침대/클린	136636	소노벨·소노캄 비발디파크	패밀리(취사/미취사)	4	6	https://tong.visitkorea.or.kr/cms/resource/13/4071113_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
소노캄 여수	패밀리 에스위트 오션뷰 더블	1785294	소노캄 여수	슈페리어(트윈,더블)	2	3	https://tong.visitkorea.or.kr/cms/resource/52/4061252_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
소노캄 거제	스위트 파노라마 침대	2578495	소노캄 거제	스위트	5	8	https://tong.visitkorea.or.kr/cms/resource/07/4060807_image2_1.jpg	객실명 직접 매칭
소노펠리체 델피노	실버 파노라마 침대	3466048	소노펠리체 델피노		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
소노펠리체 델피노	실버 설악마운틴 침대	3466048	소노펠리체 델피노		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
소노펠리체 델피노	로얄 파노라마 침대/클린	3466048	소노펠리체 델피노		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
소노펠리체 델피노	로얄 파노라마 침대	3466048	소노펠리체 델피노		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 속초	호텔 주니어 패밀리 스위트	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 속초	호텔 디럭스 더블	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 부여	클린 디럭스 한실 트윈	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 부여	캐릭터 스위트 빼빼로	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 속초	콘도 스위트 더블	2662936	롯데리조트 속초	콘도 스위트 더블	4	6	https://tong.visitkorea.or.kr/cms/resource/95/4075195_image2_1.jpg	객실명 직접 매칭
롯데리조트 속초	캐릭터 패밀리 로티앤로리	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 부여	캐릭터 스위트 말랑이	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 속초	콘도 패밀리 트윈	2662936	롯데리조트 속초	콘도 패밀리 트윈	4	4	https://tong.visitkorea.or.kr/cms/resource/94/4075194_image2_1.jpg	객실명 직접 매칭
롯데리조트 속초	캐릭터 스위트 로티앤로리	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 부여	캐릭터 패밀리 빼빼로 A형	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 속초	콘도 럭셔리 A형	2662936	롯데리조트 속초	콘도 럭셔리 A형	6	8	https://tong.visitkorea.or.kr/cms/resource/76/4075176_image2_1.jpg	객실명 직접 매칭
롯데리조트 부여	콘도 스위트 트윈	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 부여	콘도 프레지덴셜 트윈	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 부여	클린 디럭스 트윈	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음
롯데리조트 속초	호텔 그랜드 디럭스 패밀리 트윈	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 속초	호텔 디럭스 패밀리 트윈	2662936	롯데리조트 속초	콘도 디럭스 패밀리 트윈	3	3	https://tong.visitkorea.or.kr/cms/resource/75/4075175_image2_1.jpg	정확한 객실명 매칭 실패 - 첫 번째 객실 참고값
롯데리조트 부여	클린 패밀리 원룸형	3465023	롯데리조트 부여		정보 없음	정보 없음	이미지 없음	객실 상세정보 없음`;
function apiNorm(s){return String(s||'').replace(/\(취사[불가능]+\)/g,'').replace(/\s+/g,'').replace(/[·.()\-_/]/g,'').replace(/앰버서더/g,'엠버서더').replace(/뷰프리더블/g,'뷰프리1더블').replace(/더블1,싱글1/g,'1더블1싱글').trim();}
function apiKey(place, room){return apiNorm(place)+'|'+apiNorm(room);}
window.API_ROOM_INFO_MAP = {};
API_ROOM_INFO_RAW.trim().split('\n').slice(1).forEach(line=>{
  const [place, room, contentid, matchedHotel, apiRoomName, baseGuests, maxGuests, imageUrl, note] = line.split('\t');
  const status = note.includes('객실명 직접 매칭') ? 'API 직접매칭' : note.includes('참고값') ? 'API 참고값' : note.includes('객실 상세정보 없음') ? 'API 상세없음' : 'API 확인불가';
  window.API_ROOM_INFO_MAP[apiKey(place, room)] = {place, room, contentid, matchedHotel, apiRoomName, baseGuests, maxGuests, imageUrl, note, status};
});
