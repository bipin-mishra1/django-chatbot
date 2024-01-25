const messagesList = document.querySelector('.messages-list');
const messageForm = document.querySelector('.message-form');
const messageInput = document.querySelector('.message-input');
const loadingIndicator = document.querySelector('.loading');

function initializeChatHistory() {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];

  if (chatHistory.length === 0) {
    const greetingMessage = "Hi, I am your AI Chatbot, you can ask me anything.";
    addToChatHistory('AI Chatbot', greetingMessage);
    loadChatHistory(); // Refresh the chat display
  }
}

function addToChatHistory(role, content) {
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  chatHistory.push({ role, content });
  localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

async function fetchAIResponse(messageItem) {
  try {
    const response = await fetch('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'csrfmiddlewaretoken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        'message': '...' // Send a special message to request the AI response
      })
    });

    if (response.ok) {
      const data = await response.json();
      const botResponse = data.response;

      messageItem.querySelector('.message-content').textContent = botResponse;
    } else {
      console.error('Error in API response');
    }
  } catch (error) {
    console.error('Error while fetching API:', error);
  }
}

function loadChatHistory() {
  messagesList.innerHTML = '';

  const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
  chatHistory.forEach((message) => {
    const messageItem = document.createElement('li');
    messageItem.classList.add('message', message.role === 'You' ? 'sent' : 'received');
    messageItem.innerHTML = `
      <div class="message-text">
        <div class="message-sender">
          <b>${message.role}</b>
        </div>
        <div class="message-content">
          ${message.content}
        </div>
      </div>
    `;

    if (message.role === 'AI Chatbot' && message.content === '...') {
      fetchAIResponse(messageItem);
    }

    messagesList.appendChild(messageItem);
  });

  messagesList.scrollTop = messagesList.scrollHeight;
}

messageForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const message = messageInput.value.trim();
  if (message.length === 0) {
    return;
  }

  addToChatHistory('You', message);
  loadChatHistory()
  messageInput.value = '';

  loadingIndicator.style.display = 'inline';

  try {
    const response = await fetch('', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'csrfmiddlewaretoken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        'message': message
      })
    });

    if (response.ok) {
      const data = await response.json();
      const botResponse = data.response;

      addToChatHistory('AI Chatbot', botResponse);

      loadChatHistory();
    } else {
      console.error('Error in API response');
    }
  } catch (error) {
    console.error('Error while fetching API:', error);
  } finally {
    // Hide the loading indicator regardless of success or failure
    loadingIndicator.style.display = 'none';
  }
});

// Initialize chat history with greeting message on page load
initializeChatHistory();
loadChatHistory();
