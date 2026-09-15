---
title: "Unity SRP Batcher 활성화에 따른 텍스처 아틀라스의 성능 영향 분석"
titleEn: "Performance Impact Analysis of Texture Atlasing with Unity SRP Batcher Enabled"
summary: "Unity 6 환경에서 텍스처 아틀라스와 SRP Batcher의 성능 영향을 분석하였다. 현대 렌더링 성능 최적화의 핵심이 Draw Call보다 상태 변경 비용에 있음을 시사한다."
code: "R—05"
year: "2026"
phase: "Archive"
members:
  - "한지성"
tags:
  - "Graphics"
  - "Unity Engine"
  - "Optimization"
visual: "orbit"
featured: false
order: 2
---

## 서론

텍스처 아틀라스는 다수의 텍스처를 하나의 텍스처로 통합하여, 동일 텍스처를 참조하도록 하는 기법으로, 이를 통해 배칭을 유도하고, Draw Call 감소에 기여할 수 있다. 이러한 방식은 전통적으로 CPU 오버헤드를 줄이는 주요 최적화 방법으로 활용되었다.
그러나 실제 렌더링 파이프라인에서 CPU 오버헤드는 Draw Call 수뿐 아니라 상태 변경에 크게 의존한다. 최근에는 SRP Batcher와 같은 기술이 도입되면서 머터리얼 데이터를 GPU에서 재사용 가능한 형태로 관리하여 상태 설정 비용을 감소시키고, 상태 변경으로 인한 CPU 오버헤드를 완하하고 있다. 이러한 변화는 텍스처 아틀라스를 통한 배칭 기반 최적화의 효과가 기존과 다르게 나타날 가능성을 시사한다.
따라서 본 연구에서는 Unity 6 환경에서 텍스처 아틀라스와 SRP Batcher의 상호작용이 렌더링 성능에 미치는 영향을 실험적으로 분석하고, 성능 변화에 영향을 미치는 주요 요인을 규명하고자 한다.

## 실험 결과

텍스처 아틀라스와 SRP Batcher의 조합에 따른 성능 변화를 비교하였다. 먼저 Draw Calls Count는 모든 조건에서 차이를 보이지 않았다. 반면 SetPass Calls Count는 텍스처 아틀라스와 SRP Batcher를 모두 사용하지 않은 조건에서 27,246으로 나타났으나, 하나라도 적용되면 4로 감소하였다.
CPU Total Frame Time은 텍스처 아틀라스 적용 시 감소하였다. 또한 SRP Batcher와 텍스처 아틀라스 둘 다 사용할 경우 둘 중 하나만 쓴 것 보다도 성능이 향상된 것으로 나타났다. 그러나 CPU Main Thread Frame Time은 SRP Batcher가 활성화된 조건에서 증가하였고, CPU Render Thread Frame Time은 감소하였다.
GPU Frame Time은 모든 조건에서 텍스처 아틀라스 적용 시 일관되게 감소하였다.

## 결론

텍스처 아틀라스와 SRP Batcher는 상태 변경 비용 감소에 기여하지만, 성능 변화는 Draw Call 수보다 상태 변경 및 스레드별 처리 구조에 의해 결정되는 것으로 나타났다. 또한 텍스처 아틀라스는 CPU뿐 아니라, GPU 성능 향상에도 효과를 보였다.
따라서 현대 렌더링 환경에서 성능 최적화는 단일 지표에 기반하기보다, 상태 변경 비용과 CPU/GPU 처리 구조를 함께 고려해야 한다.

## DBpia 주소

https://www.dbpia.co.kr/journal/articleDetail?nodeId=NODE12870213