<p align="center">
  <img src="./favicon.svg" width="72" alt="AIARC" />
</p>

<h1 align="center">AIARC</h1>

<p align="center">
  <strong>건축 프로젝트의 상태를 읽고,<br/>다음 일을 시작하는 AI.</strong>
</p>

<p align="center">
  <sub><strong>현재 진입점: 준공 문서 자동화</strong> · <strong>North Star: Architecture AI</strong></sub>
</p>

<p align="center">
  <img alt="Windows-first" src="https://img.shields.io/badge/Windows--first-Desktop-111111" />
  <img alt="Local-first" src="https://img.shields.io/badge/Local--first-111111" />
  <img alt="HWP-aware" src="https://img.shields.io/badge/HWP%20%2F%20HWPX-aware-111111" />
  <img alt="Prototype" src="https://img.shields.io/badge/Stage-Prototype-666666" />
</p>

<p align="center">
  <a href="https://aiarc.kr">Landing Page</a> ·
  <a href="./docs/PRODUCT_OVERVIEW.md">Product Overview</a> ·
  <a href="./docs/EVIDENCE.md">Evidence</a> ·
  <a href="./docs/PUBLIC_ROADMAP.md">Roadmap</a>
</p>

---

## 30초 안에 이해하기

AIARC는 **자재 제조·유통업체, 건설사, CM·건축사사무소**가 주고받은 문서·도면·메일·변경 흔적을 연결해 프로젝트의 현재 상태를 재구성하고, 다음 업무까지 이어가는 AI입니다.

건축 프로젝트의 현재 상태는 한곳에 기록되어 있지 않습니다.

도면, HWP, PDF, Excel, 이메일, 사진, BIM, 승인 기록과 변경본이 흩어져 있고, 사람은 이를 직접 찾아 비교하고 정리해 왔습니다.

- 이 자료가 어느 현장·공종·업무와 연결되는가
- 어떤 파일이 최신 유효본인가
- 무엇이 승인됐고 무엇이 아직 미결인가
- 변경사항이 최종 결과에 반영됐는가
- 무엇이 빠졌고 다음에 무엇을 해야 하는가

**AIARC는 건축사사무소에서 건축사보로 근무하며 감리·사용승인 실무에서 직접 겪은 문제에서 출발했습니다.**

건설사에서 정리되지 않은 현장 자료를 넘겨받아 다시 찾고, 비교하고, 누락과 최신본을 확인해 제출 가능한 상태로 만드는 일을 반복해 왔습니다.

AIARC의 핵심 아이디어는 단순한 `건축 AX`가 아닙니다.

> **흩어진 문서와 변경 흔적을 연결해 프로젝트의 현재 상태를 진단·재구성하고, 다음 업무를 판단하고 실행하는 AI**

```text
문서 · 도면 · 메일 · 사진 · BIM · 변경 기록
                    ↓
         Project State Reconstruction
                    ↓
       현재 상태 · 관계 · 미결사항
                    ↓
          Next-action reasoning
                    ↓
             업무 실행
                    ↓
          프로젝트 상태 갱신
```

> **AIARC = 프로젝트의 현재 상태를 재구성하고, 그 상태를 바탕으로 다음 업무를 수행하는 AI**

---

## 첫 번째 진입점: 준공 문서 자동화

AIARC는 이 큰 문제를 한 번에 풀지 않습니다.

첫 번째 제품은 **준공 단계의 문서 정리와 누락 검토**에서 시작합니다.

```text
현장 폴더 / ZIP
        ↓
      AIARC
        ↓
문서 인식 · 분류 · 관계 연결
        ↓
확보 / 누락 / 확인 필요 / 중복 / 최신본 후보
        ↓
       [전체 정리]
        ↓
정리된 문서 트리 + 검토할 예외만 표시
```

준공 단계는 프로젝트 전 과정에서 생성된 결과물이 모이고, 누락·최신본·관계·변경 반영 여부를 함께 판단해야 하는 지점입니다.

그래서 준공 문서는 최종 목적지가 아니라 **Project State Reconstruction을 가장 작고 검증 가능하게 시작하는 첫 관측 지점**입니다.

---

## 왜 파일 정리보다 큰 문제인가

건설 문서는 저장으로 끝나지 않습니다.

```text
생성
→ 검토
→ 승인
→ 현장 반영
→ 변경
→ 재검토 / 재승인
→ 최신본 교체
→ 준공 반영
→ 최종 제출
```

같은 도면번호나 같은 문서명이 여러 개 있어도 `최근 수정일 = 현재 유효본`이라고 단순하게 판단할 수 없습니다.

**프로젝트의 상태는 폴더 안에만 있지 않습니다.** 보완요청, 회신, 수정본과 승인 흔적이 이메일로 오가기 때문에 메일도 프로젝트 상태를 이해하기 위한 중요한 정보입니다.

AIARC는 파일 종류만 분류하는 것이 아니라 **공사 단계, 상태, 버전, 관계, 승인, 변경, 제출 필요성**을 함께 이해하는 방향으로 발전합니다.

문서 생애주기 이해는 최종 정체성이 아니라 **프로젝트 상태를 이해하기 위한 첫 번째 정보 계층**입니다.

---

## 제품 경험

AIARC는 범용 챗봇이 아니라, **자동화가 먼저 일하는 Windows 데스크톱 작업공간**을 지향합니다.

```text
파일 / 폴더 / ZIP 투입
↓
AIARC 자동 분석
↓
정상건 자동 처리
↓
누락 · 충돌 · 애매한 판단만 표시
↓
사람은 필요한 순간에만 확인
```

핵심 원칙은 단순합니다.

**UNDERSTAND → ORGANIZE → CREATE → ACT → TRACK**

- 기존의 Windows 폴더·이메일·HWP 중심 업무환경을 존중합니다.
- 정상건은 자동 처리하고 예외만 사람에게 보여줍니다.
- AI 판단은 가능한 한 원문 근거와 연결합니다.
- 법적·기술적 최종판단과 실제 날인·서명은 사람이 유지합니다.

---

## 현재 단계

**Stage: Prototype / validation**

현재 AIARC는 핵심 제품 경험과 업무 흐름을 검증하는 프로토타입 단계입니다.

현 단계에서는 실제 제품으로 이어질 UI/UX와 핵심 업무 흐름을 먼저 시연하고, 이후 실제 현장자료를 이용해 문서 분류, 최신본 후보, 누락·불일치 탐지와 업무시간 절감 효과를 검증합니다.

프로토타입에서 시뮬레이션되는 기능은 실제 구현 범위와 구분해 공개합니다.

[공개 근거와 검증계획 보기 →](./docs/EVIDENCE.md)

---

## 어디까지 가는가

```text
준공 문서 자동화
→ Document Lifecycle AI
→ Project State Reconstruction
→ Project Intelligence
→ Architecture / Construction Agent
→ Architecture AI
```

장기적으로 AIARC는 법규, 설계, 도면, BIM, 견적, 공정, 자재, 품질, 인허가, 문서와 준공 등 **건축 프로젝트에 필요한 지식업무 전반을 수행하는 건축 특화 AI**를 목표로 합니다.

중요한 것은 `건축에 AI를 적용한다`는 선언이 아닙니다.

> **프로젝트의 실제 상태를 스스로 재구성하고, 그 상태를 바탕으로 다음 업무를 수행한다.**

준공 문서 자동화는 그 시스템의 첫 번째 vertical slice입니다.

[Public Roadmap 보기 →](./docs/PUBLIC_ROADMAP.md)

---

## Repository status

이 저장소는 AIARC의 **공개 아이디어·비전 저장소**입니다.

공개 범위는 문제, 제품 경험, 검증 근거와 고수준 로드맵입니다. 상세 제품 사양, 데이터 모델, 평가체계, 사업화 전략, 내부 R&D와 실제 개발 정본은 비공개 저장소에서 관리합니다.

<p align="center">
  <strong>AIARC = AI + ARC</strong><br/>
  <sub>Architecture에서 출발해, 프로젝트의 흩어진 흔적을 하나의 현재 상태와 다음 행동으로 연결합니다.</sub>
</p>
