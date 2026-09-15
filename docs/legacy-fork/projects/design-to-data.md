---
title: "Design-to-Data"
titleEn: "Design-to-Data: A Machine-Verifiable Intermediate Representation Pipeline for Unity Scene Generation from Natural-Language Game Design Documents"
summary: "자연어 게임 기획서를 검증 가능한 선언적 중간표현으로 옮기고, 결정론적 실행기가 Unity 씬을 구성하도록 생성 과정을 명세와 실행으로 분리합니다."
code: "R—04"
year: "2026"
phase: "Ongoing"
tags:
  - "LLM"
  - "Unity Scene Generation"
  - "Intermediate Representation"
  - "Schema Validation"
visual: "grid"
featured: true
order: 4
---

## 질문

LLM이 자연어 게임 기획서(GDD)로 게임 씬을 만들 때, 씬 조립을 LLM의 코드 생성이나 도구 호출에 맡기면 같은 입력에도 실행마다 결과가 달라지고, 설계 요구와 최종 씬 구조의 대응을 실행 전에 기계적으로 대조할 방법이 남지 않습니다. 생성물이 명세를 만족하는지 씬을 만들기 전에 확인할 수는 없을까요?

## 접근

D2D는 생성 과정을 **명세와 실행으로 분리**합니다. LLM은 무엇을 만들지만 기술하는 선언적 중간표현 GDF(Game Data File)를 생성하고, 씬을 실제로 구축하는 행위는 결정론적으로 동작하는 Unity Editor C# 플러그인에 위임됩니다. 행위 위임이 아니라 명세 위임입니다.

GDS(Game Design Schema)는 JSON Schema로 정의된 GDF의 구조 규격이며, LLM의 생성 계약이자 AJV 기반 구조 검증의 기준으로 동시에 사용됩니다. GDS 구조 검증, 참조 무결성을 포함한 7종 커스텀 룰, 그리고 GDD 원문에서 추출한 객체·컴포넌트 계약 검증을 모두 통과한 GDF만 실행기로 전달됩니다.

기존 Unity 프로젝트는 R-GDF(Realized GDF) 추출기가 씬을 GDF 계열 구조로 역추출해 D2D의 명세·검증·수정 흐름에 편입합니다. 같은 역직렬화 능력은 평가에서 두 조건의 완성 씬을 공통 관측 표현으로 바꾸는 데에도 쓰입니다.

## 결과

MCP 도구를 통한 직접 씬 생성을 기준 조건으로 두고, 6개 GDD를 각 조건에서 5회씩 수행한 총 60회 비교 실험을 진행했습니다.

- 사전 계획 지표인 nominal total 토큰에서 36.78% 절감, 캐시 정규화 지표인 uncached+output에서 33.36% 절감(실행 단위 부트스트랩 95% 신뢰구간 23.38%–41.94%, Cliff의 δ=0.784)
- 네 토큰 지표 모두에서 절감 방향이 일치했고, 6개 GDD의 조건별 평균쌍 정확검정도 유의했습니다(W=0, 양측 p=0.0313)
- 객체 존재율(OER)과 컴포넌트 일치율(CMR)은 조건 간 통계적으로 구분되지 않았습니다. 다만 비열등성 검정을 수행하지 않아 정확도 손실이 없다고 확정하지는 않습니다
- 실패 양상은 질적으로 달랐습니다. 직접 생성에서는 과잉 생성과 실행 간 변동이, D2D에서는 컴포넌트 누락과 표현 선택이 주로 관찰되었습니다

## 남은 과제

의미적 역할과 Unity 컴포넌트 타입 사이의 계약을 강화하는 일, 사전에 허용 한계를 정한 정확도 비열등성 검정, 더 많은 GDD와 군집 구조를 반영한 통계 모형, 그리고 동일한 고정 GDF를 반복 빌드해 정규화된 씬 상태를 비교하는 결정론 실험이 남아 있습니다.
