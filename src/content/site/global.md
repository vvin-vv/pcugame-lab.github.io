---
# 사이트 전체에서 공유하는 기본 정보입니다.
# 개별 페이지 문구는 src/content/pages/*.md에서 수정합니다.
site:
  name: "Ludic Core Laboratory"
  shortName: "LCL"
  title: "Ludic Core Laboratory"
  description: "배재대학교 게임공학과 연구실 LCL"
  url: "https://pcugame-lab.github.io"
  github: "https://github.com/pcugame-lab"
  navigation:
    - href: "/"
      label: "Home"
      index: "00"
    - href: "/about/"
      label: "Lab"
      index: "01"
    - href: "/research/"
      label: "Research"
      index: "02"
    - href: "/projects/"
      label: "Projects"
      index: "03"
    - href: "/people/"
      label: "People"
      index: "04"

# 모든 페이지 상단의 공통 헤더
header:
  brandLines:
    - "Ludic Core"
    - "Laboratory"
  brandAriaLabel: "Ludic Core Laboratory 홈"
  desktopNavAriaLabel: "주요 메뉴"
  menuLabel: "Menu"
  menuOpenAriaLabel: "메뉴 열기"
  mobileNavAriaLabel: "모바일 메뉴"

# 모든 페이지 하단의 공통 푸터
footer:
  eyebrow: "Ludic Core Laboratory"
  titleLines:
    - "재미의 핵심을"
    - "함께 연구합니다."
  navigationLabel: "Navigate"
  connectLabel: "Connect"
  githubLabel: "GitHub"
  # {year}와 {shortName}은 빌드할 때 실제 값으로 교체됩니다.
  copyrightTemplate: "© {year} {shortName}"
  tagline: "Researching the core of fun."
  backToTopLabel: "Back to top ↑"
  backToTopAriaLabel: "페이지 맨 위로 이동"

# 화면에는 보이지 않지만 스크린 리더가 읽는 공통 문구
accessibility:
  skipLinkLabel: "본문으로 이동"
  memberInterestsLabel: "관심 연구 분야"
  # {count}는 카드에 표시되지 않은 나머지 태그 수로 교체됩니다.
  memberInterestsMoreLabel: "외 {count}개"
  projectKeywordsLabel: "프로젝트 키워드"
  researchKeywordsLabel: "연구 키워드"
  researchViewSuffix: "연구 보기"
  participantsLabel: "참여자"
  projectViewSuffix: "프로젝트 보기"
  projectVisualSuffix: "추상 그래픽"

# 홈의 검은색 카드와 푸터에 표시되는 이름
wordmark:
  - "Ludic"
  - "Core"
  - "Laboratory"

# 홈과 연구실 소개 페이지에서 함께 사용하는 연구실 정보
lab:
  statement: "스스로가 원하는 재미를 만들어낼 수 있을 때까지."
  principles:
    - title: "Fun"
      label: "재미"
      description: "진짜 재미란 무엇인가?"
    - title: "Engineering"
      label: "공학"
      description: "전자기기에서 실행하는 모든 것."
    - title: "Programming"
      label: "프로그래밍"
      description: "지속 가능한 개발을 위하여."
  facts:
    - label: "Question"
      value: "What makes play meaningful?"
    - label: "Method"
      value: "Observe → Build → Verify"
    - label: "Output"
      value: "Research & Playable Things"
---
