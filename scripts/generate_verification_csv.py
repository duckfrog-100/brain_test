import csv
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
ROOMS_JS = ROOT / 'data' / 'rooms.js'
OUT = ROOT / 'verified_room_checklist.csv'

BRAND_DOMAIN = {
    '한화리조트': 'hanwharesort.co.kr',
    '소노호텔앤리조트': 'sonohotelsresorts.com',
    '롯데리조트': 'lotteresort.com',
    '오크밸리리조트': 'oakvalley.co.kr',
    '웰리힐리 리조트': 'wellihillipark.com',
    '호반리조트 (구 리솜리조트)': 'resom.co.kr',
    '중흥골드 스파리조트': 'jhresort.co.kr',
    '알펜시아리조트': 'alpensia.com',
    '동강시스타': 'donggangsistar.co.kr',
}

def bing_web(q: str) -> str:
    return 'https://www.bing.com/search?q=' + quote(q)

def bing_img(q: str) -> str:
    return 'https://www.bing.com/images/search?q=' + quote(q)

def clean_room(room: str) -> str:
    return re.sub(r'\(취사[불가능]+\)', '', room).strip()

def parse_raw(text: str):
    m = re.search(r"const RAW=`(.*?)`;", text, re.S)
    if not m:
        raise RuntimeError('data/rooms.js에서 RAW 데이터를 찾지 못했습니다.')
    for line in m.group(1).strip().split('\n'):
        cols = line.split('\t')
        if len(cols) < 9:
            continue
        no, brand, date, day, nights, resort, room, price, applicants = cols[:9]
        room_clean = clean_room(room)
        domain = BRAND_DOMAIN.get(brand, '')
        base = f'{resort} {room_clean}'
        official_prefix = f'site:{domain} ' if domain else ''
        yield {
            '번호': no,
            '브랜드': brand,
            '지역/도시': '',
            '리조트': resort,
            '룸타입': room_clean,
            '일자': date,
            '박수': nights,
            '요금': price,
            '신청자수': applicants,
            '자동추정_기준인원': '',
            '자동추정_최대인원': '',
            '공식확인_평수': '',
            '공식확인_기준인원': '',
            '공식확인_최대인원': '',
            '공식확인_인원추가비': '',
            '공식객실URL': '',
            '공식이미지URL': '',
            '확인상태': '확인필요',
            '확인일': '',
            '확인자': '',
            '공식객실페이지_검색': bing_web(official_prefix + base + ' 객실 안내 평수 기준인원 최대인원'),
            '정원_검색': bing_web(official_prefix + base + ' 객실정원 기준인원 최대인원'),
            '인원추가비_검색': bing_web(official_prefix + base + ' 인원추가 추가요금 추가비용'),
            '공식사진_검색': bing_img(official_prefix + base + ' 객실 사진'),
            '전체사진_검색': bing_img(base + ' 객실 사진'),
        }


def main():
    text = ROOMS_JS.read_text(encoding='utf-8')
    rows = list(parse_raw(text))
    fieldnames = list(rows[0].keys())
    with OUT.open('w', encoding='utf-8-sig', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f'완료: {OUT} / {len(rows)}건')
    print('엑셀에서 열고 공식확인_평수, 공식확인_기준인원, 공식확인_최대인원, 공식확인_인원추가비를 채우세요.')

if __name__ == '__main__':
    main()
