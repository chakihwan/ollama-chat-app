# 1. 기본 이미지 (Python 3.12 경량 버전)
FROM python:3.12-slim

# 2. 컨테이너 내 작업 폴더 설정
WORKDIR /app

# 3. 필요한 라이브러리 설치 (빌드 속도 최적화)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. 프로젝트 파일 복사
# (.dockerignore에 명시된 파일 제외)
COPY . .

# 5. 컨테이너가 사용할 포트
EXPOSE 5000

# 6. 앱 실행 (Gunicorn 사용)
# 'main.py' 파일의 'app' 객체를 실행합니다.
CMD ["gunicorn", "--workers", "4", "--bind", "0.0.0.0:5000", "main:app"]