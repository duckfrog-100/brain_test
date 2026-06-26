# 2026 여름 휴가 콘도 객실 확인 페이지

GitHub Pages로 공유하기 위한 정적 웹페이지입니다.

## 구성

- `index.html`: 페이지 본문
- `style.css`: 디자인
- `app.js`: 필터/팝업 기능
- `data/rooms.js`: 162개 객실 데이터
- `images/`: 공식 이미지가 외부 표시를 막을 때 저장하는 폴더

## 공식 사진 URL 넣는 법

`data/rooms.js`에서 해당 객실을 찾아 아래 값을 채우면 됩니다.

```js
officialRoomUrl: "공식 객실 페이지 URL",
officialImageUrl: "공식 홈페이지 이미지 URL",
imageSource: "한화리조트 공식 홈페이지",
verificationStatus: "공식확인"
```

공식 이미지 URL이 GitHub Pages에서 표시되지 않으면 이미지를 `images/` 폴더에 저장하고 `localImageUrl`에 `images/파일명.jpg`를 넣으세요.

## GitHub Pages 켜기

Repository Settings → Pages → Build and deployment → Source를 `Deploy from a branch`로 선택 → Branch `main` / root 저장 후 생성되는 URL을 공유하세요.
