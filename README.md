# LCL — Ludic Core Laboratory

Ludic Core Laboratory의 Astro 기반 정적 웹사이트다. 연구실 소개, 연구, 프로젝트와 구성원 정보는 Markdown으로 관리한다.

## 실행 및 검증

```bash
npm install
npm run dev            # http://localhost:4321
npm run test           # 참여자 연결 및 활동 분류 회귀 테스트
npm run content:check  # 콘텐츠 및 구성원 참조 검사
npm run check          # 콘텐츠와 Astro/TypeScript 검사
npm run build          # dist/에 정적 사이트 생성
npm run site:check     # 생성 HTML의 내부 링크 및 구조 검사
npm run validate       # 테스트, 검사, 빌드, 생성 사이트 검사
```

## 콘텐츠 위치

| 콘텐츠 | 위치 | 표시 위치 |
| --- | --- | --- |
| 사이트 공통 정보 | `src/content/site/global.md` | 헤더, 푸터, 공통 메타데이터 |
| 페이지별 문구 | `src/content/pages/*.md` | 각 페이지의 제목·안내·빈 목록 문구 |
| 연구 | `src/content/research/*.md` | 홈, 연구 목록, `/research/파일명/` |
| 프로젝트 | `src/content/projects/*.md` | 홈, 프로젝트 목록, `/projects/파일명/` |
| 구성원 | `src/content/members/*.md` | 홈, 조직도, `/people/구성원ID/` |
| 작성 양식 | `docs/templates/*.md` | 사이트에 미노출 |
| 초기 가상 연구 예시 | `docs/examples/*.md` | 사이트에 미노출 |

연구는 연구 질문·접근 방법·결과 중심으로, 프로젝트는 개발 목표·구현·결과물 중심으로 작성한다. 저장 폴더에 따라 유형을 구분한다. `.astro` 파일의 수정 없이 Markdown 추가로 상세 페이지를 생성한다.

## 연구·프로젝트 등록

1. [연구 양식](docs/templates/research.md) 또는 [프로젝트 양식](docs/templates/projects.md)을 해당 콘텐츠 폴더로 복사한다. 파일명은 영문 소문자·숫자·하이픈으로 구성한다.
2. 제목, 영문 제목, 요약, 연도, 상태, 태그와 본문을 실제 내용으로 작성한다. 양식의 참여자 이름과 안내 문장은 반드시 대체한다.
3. `members`에 구성원 파일의 `name`을 정확하게 입력한다. 이름 앞뒤 공백은 제거하며 부분 일치나 유사 이름 검색은 수행하지 않는다.
4. `npm run validate`로 검증한다.

```yaml
members:
  - "박재규"
```

Design-to-Data의 초기 등록 참여자는 박재규다. 공동 참여 활동은 `members` 배열에 실제 참여자를 추가한다. 입력 순서는 표시 순서이며, 첫 참여자를 책임자나 주저자로 해석하지 않는다.

참여자 이름은 구성원 엔트리와 연결하고, 개인 페이지의 참여 연구·프로젝트 목록은 자동으로 생성한다. 구성원 파일에 활동 목록을 중복 작성하지 않는다. 개인 페이지는 직책 연도와 관계없이 전체 참여 이력을 표시한다.

| 필드 | 작성 기준 |
| --- | --- |
| `title`, `titleEn`, `summary` | 비어 있지 않은 제목·영문 제목·요약 |
| `code` | 연구 `R—01`, 프로젝트 `P—01` 형식. 유형 안에서 고유한 값 |
| `year` | `"2026"`과 같은 네 자리 문자열 |
| `phase` | `Exploration`(탐색), `Ongoing`(진행 중), `Archive`(보관) |
| `members` | 등록된 구성원의 이름 배열. 한 명 이상, 중복 불가 |
| `tags` | 한 개 이상의 키워드 |
| `visual` | `orbit`, `grid`, `wave` 중 하나 |
| `featured` | 홈 노출 여부. 생략 시 `false` |
| `order` | 0 이상의 정수. 유형 안에서 중복 불가, 작은 값부터 표시 |

진행 상태와 결과의 검증 수준은 별개다. 계획, 구현 내용과 측정 결과를 본문에서 구분하고, 결과물·논문·저장소 링크는 Markdown 링크로 기재한다.

미등록 이름, 중복 참여자와 빈 명단은 콘텐츠 검사와 직접 빌드에서 오류로 처리한다. 구성원 이름 변경 시 해당 이름을 참조한 활동도 함께 갱신한다. 동명이인은 현재 지원하지 않으며 구성원 이름 중복을 오류로 처리한다. 구성원 파일명을 변경하면 개인 페이지 주소도 변경된다.

## 구성원 등록

`src/content/members/영문-이름.md`를 추가한다.

```md
---
name: "이름"
nameEn: "English Name"
photo: "/images/members/name.jpg"
interests:
  - "Game Design"
positions:
  - year: 2026
    role: "Researcher"
    group: "Undergraduate"
    level: "member"
github: "https://github.com/username"
---

자유로운 자기소개 문장.
```

자기소개는 개인의 자유로운 문체를 유지한다. `photo`, `github`, `website`, `email`, `monogram`은 선택 항목이다. 사진을 생략하면 연구실 아이콘을 표시한다. 사진은 `public/images/members/`에 저장한다. 관심 분야가 없으면 `interests: []`로 작성한다.

`positions`는 연도별 직책 이력이며 같은 연도를 중복 입력할 수 없다. `group`은 `Undergraduate` 또는 `Graduate Student`, `level`은 `leadership` 또는 `member`를 사용한다. 직책명은 `role`에 작성한다. 조직도는 기존 직책 우선순위와 이름순 정렬을 유지한다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 PNG를 WebP로 변환하고 `npm run validate` 통과 후 변환 결과를 자동 커밋하여 GitHub Pages로 배포한다. 저장소의 **Settings → Pages → Source**는 **GitHub Actions**로 설정한다.

### 이미지 변환

```bash
npm run images:optimize  # PNG → WebP, 정적 참조 경로 수정, 원본 삭제
npm run validate        # 변환 후 사이트 검증
git add -A              # 원하는 변경 범위를 확인한 뒤 스테이징
```

Git에서 추적 중인 파일과 `.gitignore`에 포함되지 않은 새 파일의 PNG를 변환한다. 기본 설정은 `quality: 82`, `alphaQuality: 100`, `effort: 4`이며 해상도와 투명도를 유지하는 손실 압축이다. 설정은 `scripts/optimize-images.mjs`에서 변경한다. 모든 이미지의 변환·디코딩 확인과 참조 수정이 완료된 뒤 PNG를 삭제한다. 기존 WebP와의 파일명 충돌, 손상된 PNG 또는 애니메이션 PNG가 있으면 변경 전에 중단한다.

Markdown, Astro, CSS, JS/TS, JSON 등의 상대 경로와 `public/` 이미지의 `/images/...` 정적 경로를 수정한다. 외부 URL은 유지한다. 문자열 조합으로 생성하는 동적 경로는 직접 수정해야 한다. 아주 작은 PNG는 WebP 변환 후 크기가 증가할 수 있다.

**Git 이력의 용량 증가를 예방하려면 PNG를 처음 커밋하기 전에 변환해야 한다.** push 후 CI에서 삭제한 PNG는 이전 커밋에 남는다. 기존 이력의 용량 감소에는 별도 이력 재작성이 필요하며, 이 자동화는 이력을 재작성하지 않는다. [GitHub의 대용량 파일 및 이력 삭제 안내](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)를 참조한다.

로컬에서 `npm run images:hooks`를 한 번 실행하면 PNG 추가·수정 커밋을 차단하는 훅을 활성화한다. 차단 시 변환 명령을 실행한 뒤 WebP, 참조 변경, PNG 삭제를 다시 스테이징한다. 이 설정은 해당 clone에만 적용되며 기존 `core.hooksPath` 설정을 대체하므로 다른 훅을 사용하는 경우 해당 훅에 `node scripts/check-png-staging.mjs`를 통합한다.

CI는 `main`에서만 실행하며 `contents: write` 권한으로 변환 결과를 push한다. 브랜치 보호 규칙이 자동 push를 금지하면 해당 단계에서 실패하므로 커밋 전에 로컬 변환을 수행한다. 실행 중 `main`에 새 커밋이 추가되면 이전 실행의 push는 실패할 수 있으며, 후속 실행에서 최신 상태를 처리한다. 자동 커밋은 [새 push 워크플로를 실행하지 않으므로](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) 같은 실행에서 검증한 사이트를 배포한다.

기존 가상 연구 3개는 `docs/examples/`에 보관하며 공개 사이트에 포함하지 않는다. Design-to-Data의 기존 본문과 주소는 유지한다.
