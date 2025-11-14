# Ollama Chat Web UI

이 프로젝트는 Ollama앱을 모방하여 로컬 LLM(Ollama)을 웹 브라우저에서 직접 사용할 수 있는 채팅 UI로 구현한 것입니다. 
**로컬 LLM을 웹 페이지로 만드는 단계를 학습**하려는 목적으로 제작되었습니다.

백엔드는 **Python Flask**로, 프론트엔드는 **Vanilla JavaScript**로 작성되었으며, 전체 애플리케이션은 **Docker**를 통해 쉽게 실행할 수 있도록 패키징되었습니다.

## 시연 영상


https://github.com/user-attachments/assets/16b949c8-4edc-4687-8b08-f25bb4a714ee



##  주요 기능

* **실시간 스트리밍 채팅:** Ollama의 응답을 실시간 스트리밍으로 받아와 자연스러운 채팅 경험을 제공합니다.
* **대화 기록:** `localStorage`를 사용하여 브라우저에 대화 기록을 저장하고 불러올 수 있습니다.
* **대화 삭제:** 사이드바에서 특정 대화 기록을 삭제할 수 있습니다.
* **커스텀 시스템 프롬프트:** JavaScript(`app.js`) 내에 "상냥한 고양이" 페르소나를 설정하는 시스템 프롬프트가 하드코딩되어 있습니다.
* **Docker 기반 배포:** `Dockerfile`과 `gunicorn`을 사용하여 프로덕션 환경과 유사하게 앱을 실행합니다.

##  기술 스택

* **백엔드:** Python, Flask, Gunicorn
* **프론트엔드:** HTML5, CSS3, Vanilla JavaScript
* **인프라:** Docker
* **LLM:** Ollama

##  실행 방법

### 사전 준비

1.  **Ollama 설치 및 실행:** 로컬 머신에 [Ollama](https://ollama.com/)가 설치되어 있어야 하며, 서비스가 실행 중이어야 합니다.
2.  **모델 다운로드:** 채팅에 사용할 모델을 미리 다운로드합니다. (예: `ollama pull gemma3:4b`)
3.  **Docker Desktop 설치:** Docker 이미지를 빌드하고 실행하기 위해 [Docker Desktop](https://www.docker.com/products/docker-desktop/)이 설치되어 있어야 합니다.
4.  **(중요)** `main.py`는 Ollama API 주소로 `http://host.docker.internal:11434`를 사용합니다. 이는 Docker 컨테이너(Flask 앱)가 Host PC(Ollama)와 통신하기 위한 Docker Desktop의 기능입니다.

### 실행 단계

1.  **프로젝트 클론:**
    ```bash
    git clone https://github.com/chakihwan/ollama-chat-app
    cd ollama-chat-app
    ```

2.  **Docker 이미지 빌드:**
    프로젝트 루트 디렉터리(`Dockerfile`이 있는 위치)에서 다음 명령어를 실행합니다.
    ```bash
    docker build -t ollama-web-app .
    ```

3.  **Docker 컨테이너 실행:**
    Host PC의 8000번 포트와 컨테이너의 5000번 포트를 연결하여 컨테이너를 실행합니다.
    ```bash
    docker run -d -p 8000:5000 ollama-web-app
    ```
    * `-d`: 백그라운드에서 실행
    * `-p 8000:5000`: Host(내 PC)의 8000번 포트를 Container의 5000번 포트와 연결

4.  **웹 페이지 접속:**
    웹 브라우저를 열고 `http://localhost:8000`으로 접속합니다.

##  프로젝트 구조
```text
.
├── Dockerfile             # 🐳 Docker 이미지 설정 파일
├── main.py                # 🐍 Flask 백엔드 서버 (Ollama 프록시)
├── requirements.txt       # 📦 Python 의존성 목록
├── static/                # 🎨 프론트엔드 정적 파일
│   ├── css/style.css      # (스타일시트)
│   ├── js/app.js          # (채팅 로직 JavaScript)
│   └── img/(하고 싶은 logo)# (이미지)
├── templates/
│   └── index3.html        # 💻 메인 채팅 HTML 페이지
├── .gitignore             # (Git 무시 목록)
└── chatTest.py            # (Ollama API 테스트용 스크립트)
```
## 🔧 설정 (Configuration)

이 프로젝트는 학습용으로 일부 설정이 하드코딩되어 있습니다.

* **Ollama API URL:**
  * Flask 서버(`main.py`)는 `http://host.docker.internal:11434`를 기본 Ollama API 주소로 사용합니다.
  * 이는 Docker Desktop 환경에서 컨테이너가 Host PC(Ollama)와 통신하기 위한 주소입니다.
  * 만약 주소를 변경해야 한다면, `docker run` 시 `OLLAMA_CHAT_URL` 환경 변수를 설정하여 오버라이드할 수 있습니다.

* **시스템 프롬프트 (페르소나):**
  * 챗봇의 기본 페르소나("상냥한 고양이")는 `static/js/app.js` 파일 내의 `SYSTEM_PROMPT` 변수에 하드코딩되어 있습니다. 이 값을 수정하여 챗봇의 페르소나를 변경할 수 있습니다.

* **기본 모델:**
  * UI에 표시되는 기본 모델(`gemma3:4b`)은 `templates/index3.html`의 `.model-pill` 부분에 하드코딩되어 있습니다.

---
