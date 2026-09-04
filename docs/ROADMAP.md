# AIARC Product Roadmap

Updated: 2026-09-04

## 0. Roadmap principle

AIARC의 최종 제품은 크지만, 개발은 **하나의 건설 문서 workflow를 실제로 끝내는 작은 제품**에서 시작한다.

로드맵의 기본 원칙:

```text
설명 가능한 데모
→ 실제 현장자료에서 작동
→ 한 개 workflow를 끝까지 자동화
→ 반복사용 가능한 제품
→ 여러 workflow로 확장
→ 여러 현장을 관리
→ 건설 공무 AI Agent
```

첫 프로토타입에서 상용제품의 모든 기술문제를 해결하지 않는다.

특히 다음 항목은 중요하지만 초기 제출의 blocker가 되어서는 안 된다.

- 모든 HWP 서식 자동화
- 완전자율 이메일 발송
- 실시간 회신 추적 완성
- 다중회사 권한체계
- 온프레미스 LLM
- 모든 건설 ERP 연동
- 모든 공무업무 자동화

---

# Phase 0. 모두의 창업 Prototype

## 목적

**건설 공무 문서업무가 AI로 실제 대체될 수 있다는 것을 짧은 데모로 증명한다.**

제품 전체보다 `Before → AIARC → After`가 명확해야 한다.

## 핵심 데모

```text
뒤섞인 실제 준공현장 폴더
        ↓
      AIARC
        ↓
문서 자동인식 / 분류
        ↓
확보 / 누락 / 확인필요
        ↓
준공 폴더 자동정리
        ↓
누락자료 요청메일 생성
```

추가로 품질관리서 workflow를 통해 `정리만 하는 AI가 아니라 업무를 수행하는 Agent`라는 방향을 보여준다.

## MUST

### A. 현장 폴더 ingestion

- Windows 폴더 선택
- 파일 목록/경로/확장자 읽기
- 파일명과 가능한 문서내용 추출
- 분석 진행상태 표시

### B. 문서 분류

- 현장 문서를 카테고리별로 분류
- 준공 체크리스트 항목과 매칭
- 사람이 결과를 수정할 수 있음

### C. 준공 상태

```text
확보
누락
확인 필요
중복/구버전 후보
```

을 화면에 표시.

### D. 자동 정리

- 제출용 번호 폴더 생성
- 원본은 보존
- 기본값은 복사 방식
- 자동분류 결과를 새 output 폴더에 생성

### E. 품질관리서 workflow UI

최소 다음 상태를 표현한다.

```text
작성 필요
→ 제조/유통/시공 확인
→ 감리 회신 대기
→ 건축주/최종단계
→ 최종본
```

### F. 이메일 action proof

- 누락자료 선택
- 수신자 입력 또는 추천
- 요청 메일 제목/본문 자동작성
- 필요 자료명 명시
- 사용자가 최종 확인

## SHOULD

시간이 허용되는 순서대로:

1. 실제 Gmail 또는 Outlook draft 생성
2. 중복/최신본 판별
3. 현장정보 자동추출
4. HWP 품질관리서 템플릿 1종 자동작성
5. 회신 첨부파일 자동분류

## HWP 결정 규칙

HWP는 AIARC 상용제품의 핵심이다.

그러나 Phase 0에서 HWP 자동화가 제출일정을 위협하면 **프로토타입 blocker로 만들지 않는다.**

우선순위:

```text
1. 실제 HWP 자동작성 1종
2. 제한된 템플릿 자동채움
3. 생성값 preview + HWP 수동반영
```

어느 수준이든 `AIARC가 어떤 값을 왜 채우는지`가 보여야 한다.

## Phase 0 Definition of Done

실제 또는 익명화된 현장자료로 다음 데모가 끊김 없이 된다.

```text
폴더 선택
→ 분석
→ 준공상태 확인
→ 자동정리
→ 누락항목 확인
→ 요청메일 생성
→ 품질관리서 workflow 확인
```

제품을 처음 보는 사람이 1분 이내에 다음을 이해해야 한다.

> `건설현장의 메일과 파일을 AI가 읽고, 정리하고, 작성하고, 다음 업무까지 이어주는 프로그램이구나.`

---

# Phase 0.5. Validation + Public-ready Repository

## 목적

프로토타입을 지원사업/인터뷰에 사용하면서 저장소를 public 전환할 수 있는 상태로 정리한다.

현재 repository는 private 유지.

## 검증

### 실무자 데모

현장 공무/건설 실무자에게 실제 화면을 보여준다.

확인할 질문:

- 실제 현장에서 가장 시간을 많이 쓰는 문서업무는 무엇인가
- 자동분류 결과를 믿을 수 있는가
- 누락체크가 유용한가
- 품질관리서 workflow가 실제 흐름과 맞는가
- HWP 자동작성에 어느 정도 가치가 있는가
- 메일 자동화 중 어디까지 AI에게 맡길 수 있는가
- 회사 PC에 설치할 의향이 있는가
- 유료라면 어떤 가격방식이 자연스러운가

### 자료 테스트

가능하면 서로 다른 2~3개 현장 폴더에서 테스트.

한 현장에 과적합된 규칙을 피한다.

## Public 전환 체크리스트

다음 조건을 충족한 뒤 repository visibility 변경을 검토한다.

- 실제 현장명/주소/담당자/회사명 제거
- 실제 이메일/전화번호 제거
- 계약금액/민감정보 제거
- 실제 도면/성적서/법정문서 원본 미포함
- API key/credential/secret history 점검
- `.env.example`만 공개
- 익명화된 demo dataset 준비
- README의 기능/제한사항 최신화
- 라이선스 결정
- `SECURITY.md` 작성
- 개인정보/외부 AI 전송범위 문서화
- HWP/메일 API의 제3자 라이선스 표기 검토

**Public 전환은 제품 검증과 별개다. 공개를 위해 프로토타입 개발을 지연하지 않는다.**

---

# Phase 1. Usable Alpha

## 제품 목표

`데모`에서 `한 현장에 실제로 계속 켜두고 쓸 수 있는 프로그램`으로 이동한다.

가칭:

> **AIARC Document Agent Alpha**

## 핵심 사용자

한 번에 현장 1~3개를 관리하는 공무 담당자.

## 기능

### 1. Persistent project

프로그램을 껐다 켜도 현장 상태가 유지된다.

- 현장 마스터
- 관계자
- 문서 인덱스
- workflow 상태
- 사용자 수정 이력

### 2. Folder watcher

사용자가 지정한 폴더에 새 파일이 들어오면 탐지.

```text
새 파일
→ 분류
→ 기존 문서와 연결
→ 사용자가 확인
→ 현장 상태 갱신
```

### 3. Email integration v1

Gmail 또는 Outlook 중 하나부터 실제 연동.

- 현장관련 메일 검색
- 첨부 다운로드
- 첨부 문서 자동귀속
- 요청메일 draft 생성

초기에는 사용자가 발송을 승인한다.

### 4. HWP v1

가장 가치가 높은 HWP 서식 1~3종 지원.

1순위 후보:

- 품질관리서
- 반복성이 높은 자재/준공 관련 서식

지원방식은 기술검증 후 결정한다.

### 5. Evidence UI

AI가 왜 특정 문서로 판단했는지 원문/추출값을 보여준다.

### 6. Safe recovery

잘못된 분류/이동을 되돌릴 수 있다.

## Phase 1 목표

- 실사용자 3~5명
- 실제 현장 반복사용
- 가장 많이 수정되는 AI 판정을 기록
- 실제 절감되는 작업시간을 측정
- 가장 가치가 높은 workflow 2번째 후보 결정

---

# Phase 2. Quality Document Agent

## 목표

품질관리서와 자재 증빙관리 workflow를 실제 제품 수준으로 만든다.

이 Phase에서 AIARC의 첫 번째 완성형 agent loop를 만든다.

## 핵심 흐름

```text
자재 관련자료 수신
→ 자재/현장 자동귀속
→ 납품확인서 / 시험성적서 / 인증자료 연결
→ 품질관리서 작성
→ 관계자 확인상태 관리
→ 다음 관계자 요청메일
→ 회신 감지
→ 최신본 판별
→ 다음 단계
→ 최종본
→ 준공자료 편입
```

## 주요 기능

### Material record

자재 하나를 중심으로 문서가 묶인다.

### Cross-document check

가능한 범위에서:

- 제조사
- 제품명
- 규격
- 인증/성적서 번호
- 날짜

등의 불일치 후보를 찾는다.

최종 적합성 판단은 사람이 한다.

### Workflow engine

문서가 어떤 단계에 있는지 명시적으로 관리.

### Reply tracking

메일 thread와 첨부파일을 workflow와 연결.

### Version graph

단순 `최종`, `최종2`, `진짜최종` 파일명이 아니라 회신관계와 수정순서를 이용해 버전관계를 표현한다.

## 제품 결과

사용자가 품질관리서별 상태를 한 화면에서 볼 수 있어야 한다.

```text
완료
회신 대기
작성 필요
보완 필요
최종본
```

---

# Phase 3. Closeout Agent

## 목표

공사 중 쌓인 Document Graph를 이용해 준공 시점의 대규모 수작업을 줄인다.

## 기능

### Dynamic closeout checklist

현장별 요구목록을 등록/학습하고 고정된 하나의 표준목록으로 가정하지 않는다.

### Continuous readiness

준공 직전에만 체크하지 않고 공사 중 계속 상태를 갱신.

### Missing evidence action

```text
누락 발견
→ 보유 가능성이 높은 관계자 추천
→ 요청메일
→ 회신
→ 자동편입
```

### Package generation

- 번호별 폴더
- INDEX
- 제출목록
- 누락/해당없음 기록
- 최종 ZIP/package

### Completion dashboard

현장 전체의 제출 준비상태를 보여준다.

---

# Phase 4. Material Approval + Inspection

## 목표

준공에서 공사 중 반복업무로 사용빈도를 높인다.

## 자재승인

```text
자재 선택
→ 관련 업체자료 수집
→ 시험성적서/인증서/카탈로그 연결
→ 승인 package 구성
→ 감리 요청
→ 보완요청 회신
→ Rev 관리
→ 승인본 확정
```

## 검측/검수

- 관련 도면/사진/자재자료 연결
- 기존 양식 작성 보조
- 제출/회신 상태관리

이 단계부터 AIARC가 `준공 때 쓰는 프로그램`이 아니라 **매일 쓰는 공무 도구**가 된다.

---

# Phase 5. Construction Document Graph

## 목표

AIARC의 핵심 데이터 구조를 파일 중심에서 관계 중심으로 완성한다.

```text
Project
├─ Parties
├─ Contracts
├─ Materials
├─ Work items
├─ Documents
├─ Email threads
├─ Revisions
├─ Approvals
└─ Workflows
```

## 가능해지는 기능

- `이 자재 최신 승인본 보여줘`
- `감리에게 보냈지만 답 없는 서류 보여줘`
- `준공에 필요한데 확보 안 된 자료 보여줘`
- `설계변경 이후 영향받을 문서 보여줘`
- `시험성적서와 납품확인서 규격이 다른 자재 찾아줘`

AIARC는 이때부터 단순 automation script가 아니라 **현장 문서상태를 이해하는 시스템**이 된다.

---

# Phase 6. Multi-project / Team Product

## 목표

개인 공무담당자의 desktop tool에서 회사 제품으로 확장한다.

## 기능

- 다수 현장 dashboard
- 사용자/조직 권한
- 현장별 접근권한
- 회사 표준양식 library
- 회사 공통 관계자/업체 DB
- 감사로그
- 승인 workflow
- 팀 알림
- 중앙 정책 + local agent 구조

## 보안 옵션

고객 요구와 경제성이 확인되면:

- 회사 서버 저장
- private cloud
- on-premise
- local model

등을 검토한다.

---

# Phase 7. Construction Backoffice AX

## 목표

Document Agent에서 건설 공무의 더 넓은 실행 레이어로 확장한다.

확장 후보:

```text
자재승인
품질관리
검측/검수
공정보고
기성자료 준비
설계변경 증빙 정리
준공/사용승인
계약/공문 workflow
```

단, 고위험 업무를 무리하게 자동화하지 않는다.

### AI가 강하게 수행할 영역

- 자료수집
- 문서이해
- 대조
- 작성 보조
- 누락 탐지
- communication
- 상태 추적
- package 생성

### 사람의 책임을 유지할 영역

- 기술적 최종 판단
- 계약/법률 판단
- 실제 기성률/수량 책임확정
- 설계변경 승인판단
- 법정 날인/서명

---

# Phase 8. AIARC Platform

장기적으로 여러 workflow가 같은 engine을 사용한다.

```text
Document Intelligence
        +
Project Document Graph
        +
Workflow Engine
        +
HWP / Office Actions
        +
Email Agent
        +
Evidence / Audit Layer
```

이 공통 engine 위에 건설업무별 agent가 올라간다.

```text
AIARC
├─ Quality Document Agent
├─ Material Approval Agent
├─ Inspection Agent
├─ Closeout Agent
├─ Progress Billing Assistant
└─ Future Backoffice Agents
```

최종 목표:

> **건설회사의 문서업무가 사람의 기억, 받은편지함, 폴더 탐색에 의존하지 않게 만들고, AIARC가 각 현장의 문서상태와 다음 행동을 지속적으로 관리하는 것.**

---

# What not to do

로드맵 진행 중 다음 유혹을 피한다.

- 데모 전에 자체 AI 모델 만들기
- ERP 전체를 먼저 만들기
- 모든 법정서식을 한 번에 지원하기
- HWP 기술문제 하나 때문에 전체 프로토타입 중단하기
- 사용자가 요청하지 않은 현장관리 기능 확장
- AI가 최종 법적/기술 판단을 하는 것처럼 포장하기
- 실사용 검증 전에 자동발송/완전자율성을 과도하게 높이기

항상 다음 질문으로 다음 Phase를 선택한다.

> **지금 공무담당자가 실제로 반복하고 있는 업무 중, AIARC가 가장 안전하게 더 많이 끝낼 수 있는 다음 한 단계는 무엇인가?**
