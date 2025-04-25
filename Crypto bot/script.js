const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatLog = document.getElementById('chat-log');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');

function showTyping() {
  typingIndicator.style.display = 'block';
  chatLog.scrollTop = chatLog.scrollHeight;
}

function hideTyping() {
  typingIndicator.style.display = 'none';
}

async function addMessageWithMarkdown(content, isUser, typewriter = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'chat-bubble';

  const speaker = `<strong>${isUser ? 'You' : 'Bot'}:</strong>`;
  bubbleDiv.innerHTML = speaker;
  messageDiv.appendChild(bubbleDiv);
  chatLog.appendChild(messageDiv);
  chatLog.scrollTop = chatLog.scrollHeight;

  if (isUser || !typewriter) {
    const rendered = DOMPurify.sanitize(marked.parse(content || ''));
    bubbleDiv.innerHTML = `${speaker}<br>${rendered}`;
  } else {
    const plainText = content || '';
    const displayElement = document.createElement('div');
    bubbleDiv.appendChild(document.createElement('br'));
    bubbleDiv.appendChild(displayElement);

    for (let i = 0; i < plainText.length; i++) {
      displayElement.textContent += plainText[i];
      await new Promise(resolve => setTimeout(resolve, 15));
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    const rendered = DOMPurify.sanitize(marked.parse(plainText));
    bubbleDiv.innerHTML = `${speaker}<br>${rendered}`;
  }

  chatLog.scrollTop = chatLog.scrollHeight;
}

async function sendMessage(message) {
  await addMessageWithMarkdown(message, true);
  userInput.value = '';
  userInput.disabled = true;
  sendBtn.disabled = true;
  showTyping();

  try {
    const apiUrl = window.location.port === "5500"
      ? "http://localhost:5000/chat"
      : "/chat";

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    const botReply = data.response || 'Sorry, I couldn’t process that.';
    await addMessageWithMarkdown(botReply, false, true);

  } catch (error) {
    await addMessageWithMarkdown('Oops! Something went wrong. Please try again.', false);
    console.error(error);
  } finally {
    hideTyping();
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;
  await sendMessage(message);
});

// Handle suggestion buttons
suggestionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt;
    userInput.value = prompt;
    sendMessage(prompt);
  });
});

function createCoin() {
  const coin = document.createElement('div');
  coin.classList.add('coin');

  const size = Math.random() * 20 + 20;
  coin.style.width = `${size}px`;
  coin.style.height = `${size}px`;
  coin.style.left = `${Math.random() * window.innerWidth}px`;
  coin.style.animationDuration = `${Math.random() * 2 + 2}s`;

  document.body.appendChild(coin);

  setTimeout(() => {
    coin.remove();
  }, 5000);
}

// Drop coins every 300ms
setInterval(createCoin, 300);


// Auto-focus input on load
userInput.focus();
