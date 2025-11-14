// DOM 로드가 완료된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {

  const $ = (id) => document.getElementById(id);

  // DOM 요소 선택
  const appContainer = $("app-container");
  const sidebarToggle = $("sidebar-toggle");
  const chatTitle = $("chat-title");
  const chatDiv = $("chat");
  const promptTA = $("prompt");
  const sendBtn = $("send");
  const newChatBtn = $("new-chat");
  const emptyState = $("empty-state");
  const historyList = $("history-list");
  
  const sendIcon = sendBtn.querySelector(".send-icon");
  const spinner = sendBtn.querySelector(".spinner");

  // ▼▼▼ 파일 첨부 관련 DOM 변수 모두 삭제됨 ▼▼▼

  // --- 1. 상태 관리 변수 ---
  const SYSTEM_PROMPT = { 
    role: "system", 
    content: "너는 상냥한 고양이야. 나의 가장 친한 친구지 고양이처럼 냥냥으로 끝날때는 반말로해. 말 끝에는 항상 냥냥으로 끝나해야해. 예를 들면, 안녕하세요 -> 안녕하다냥냥, 궁금해요 -> 궁금하다냥냥" 
  };

  let allChats = JSON.parse(localStorage.getItem('allChats')) || [];
  let currentChatId = null;
  let currentChatHistory = [SYSTEM_PROMPT];

  // attachedFileBase64 변수 삭제됨

  // --- 2. 핵심 로직 함수 ---

  function saveChatsToStorage() {
    localStorage.setItem('allChats', JSON.stringify(allChats));
  }

  function saveCurrentChat() {
    if (currentChatId === null) return;

    const chat = allChats.find(c => c.id === currentChatId);
    if (chat) {
      chat.messages = [...currentChatHistory];
      saveChatsToStorage();
    }
  }

  // ▼▼▼ (수정) 삭제 버튼을 포함하도록 renderSidebar 변경 ▼▼▼
  function renderSidebar() {
    historyList.innerHTML = "";
    
    if (currentChatId === null) {
      newChatBtn.classList.add("active");
    } else {
      newChatBtn.classList.remove("active");
    }

    allChats.slice().reverse().forEach(chat => {
      // (신규) 항목 전체를 감싸는 컨테이너
      const itemContainer = document.createElement("div");
      itemContainer.className = "history-item-container";

      // (기존) 채팅 불러오기 버튼
      const btn = document.createElement("button");
      btn.className = "nav-item";
      btn.textContent = chat.title;
      btn.dataset.chatId = chat.id;
      
      if (chat.id === currentChatId) {
        btn.classList.add("active");
      }
      
      btn.addEventListener("click", () => {
        loadChat(chat.id);
      });

      // (신규) 삭제 버튼
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-chat-btn";
      deleteBtn.innerHTML = "&times;"; // "X" 문자
      deleteBtn.title = "Delete chat";
      deleteBtn.dataset.chatId = chat.id;

      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // 중요: 삭제 시 채팅이 로드되지 않게 함
        deleteChat(chat.id);
      });

      // 컨테이너에 두 버튼 추가
      itemContainer.appendChild(btn);
      itemContainer.appendChild(deleteBtn);
      historyList.appendChild(itemContainer);
    });
  }
  
  // ▼▼▼ (신규) 채팅 삭제 함수 ▼▼▼
  function deleteChat(chatId) {
    // 사용자에게 한 번 더 확인
    if (!confirm("이 대화 기록을 삭제하시겠습니까?")) {
      return;
    }
    
    // allChats 배열에서 해당 ID를 가진 채팅 제거
    allChats = allChats.filter(chat => chat.id !== chatId);
    
    // localStorage 업데이트
    saveChatsToStorage();
    
    // 만약 현재 열려있는 채팅을 삭제했다면, 새 채팅창으로 리셋
    if (currentChatId === chatId) {
      startNewChat();
    }
    
    // 사이드바 목록 새로고침
    renderSidebar();
  }

  function loadChat(chatId) {
    const chat = allChats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chat.id;
    currentChatHistory = [...chat.messages];
    
    chatTitle.textContent = chat.title;
    
    renderChatMessages();
    renderSidebar();
  }

  function renderChatMessages() {
    chatDiv.innerHTML = "";
    currentChatHistory.slice(1).forEach(msg => {
      addBubble(msg.role, msg.content);
    });
    checkEmptyState();
  }

  function startNewChat() {
    currentChatId = null;
    currentChatHistory = [SYSTEM_PROMPT];
    chatDiv.innerHTML = "";
    chatTitle.textContent = "New Chat";
    checkEmptyState();
    renderSidebar();
    promptTA.focus();
    // removeImagePreview() 호출 삭제됨
  }

  function checkEmptyState() {
    if (currentChatHistory.length <= 1) {
      emptyState.style.display = "flex";
      chatDiv.style.display = "none";
    } else {
      emptyState.style.display = "none";
      chatDiv.style.display = "flex";
    }
  }

  function addBubble(role, text, attachId = null) {
    checkEmptyState();
    const div = document.createElement("div");
    div.className = `bubble ${role}`;
    if (attachId) div.dataset.attachId = attachId;
    div.textContent = text; 
    chatDiv.appendChild(div);
    chatDiv.scrollTop = chatDiv.scrollHeight;
    return div;
  }

  function updateAttachedBubble(attachId, appendText) {
    const node = [...chatDiv.querySelectorAll(".bubble")]
      .find(n => n.dataset.attachId === attachId);
    if (node) {
      node.textContent += appendText;
      chatDiv.scrollTop = chatDiv.scrollHeight;
    }
  }

  function setSending(isSending) {
    sendBtn.disabled = isSending;
    promptTA.disabled = isSending;
    // attachBtn.disabled 삭제됨
    if (isSending) {
      sendIcon.style.display = "none";
      spinner.style.display = "inline-block";
    } else {
      sendIcon.style.display = "inline-block";
      spinner.style.display = "none";
    }
  }

  // --- 3. 메시지 전송 메인 함수 (단순화됨) ---

  async function sendMessage() {
    const content = promptTA.value.trim();
    
    // ▼▼▼ 이미지 체크 로직 삭제됨 ▼▼▼
    if (!content || sendBtn.disabled) return;
    
    promptTA.value = "";
    autoResizeTA();

    const isNewChat = (currentChatId === null);
    
    // ▼▼▼ userMessage 객체 생성 단순화 ▼▼▼
    const userMessage = { 
      role: "user", 
      content: content
    };

    addBubble("user", content); 
    currentChatHistory.push(userMessage);

    // removeImagePreview() 호출 삭제됨

    if (isNewChat) {
      currentChatId = Date.now();
      const newChatTitle = content.substring(0, 40) + (content.length > 40 ? '...' : ''); // 제목 생성
      const newChat = {
        id: currentChatId,
        title: newChatTitle,
        messages: [...currentChatHistory]
      };
      allChats.push(newChat);
      chatTitle.textContent = newChat.title;
      renderSidebar();
    }
    
    saveCurrentChat(); 

    const attachId = String(Date.now());
    addBubble("assistant", "", attachId);
    setSending(true);
    
    let assistantAccum = "";

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // ▼▼▼ 모델 이름 가져오는 로직 (이미지 체크 삭제) ▼▼▼
          model: document.querySelector(".model-pill").textContent || "gemma3:4b", 
          messages: currentChatHistory,
        }),
      });

      if (!resp.ok) throw new Error(`Server error: ${resp.statusText} - ${await resp.text()}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          try {
            const obj = JSON.parse(trimmed);
            if (obj.message && typeof obj.message.content === "string") {
              assistantAccum += obj.message.content;
              updateAttachedBubble(attachId, obj.message.content);
            }
            if (obj.done) {
              currentChatHistory.push({ role: "assistant", content: assistantAccum });
              saveCurrentChat(); 
              return;
            }
          } catch (e) { console.warn("Failed to parse stream line:", trimmed, e); }
        }
      }
    } catch (e) {
      updateAttachedBubble(attachId, `\n[에러] 응답을 가져오는 중 문제가 발생했습니다.\n${e.message}`);
      console.error(e);
    } finally {
      setSending(false);
      promptTA.focus();
    }
  }

  // --- 4. 파일 첨부 관련 함수 (모두 삭제됨) ---


  // --- 5. 이벤트 리스너 및 초기화 ---

  sidebarToggle.addEventListener("click", () => {
    appContainer.classList.toggle("sidebar-collapsed");
  });

  newChatBtn.addEventListener("click", startNewChat);

  promptTA.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);

  function autoResizeTA() {
    promptTA.style.height = 'auto';
    promptTA.style.height = (promptTA.scrollHeight) + 'px';
  }
  promptTA.addEventListener('input', autoResizeTA);

  // --- 6. 초기 실행 ---
  renderSidebar();
  startNewChat();

}); // <-- DOMContentLoaded 닫는 괄호