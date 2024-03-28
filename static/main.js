const messages = [
  {
    user: "assistant",
    content: "Hi, I'm Chat Buddy. Please type a prompt or question.",
  },
];

const messagesHolder = document.getElementById("messages");
const textInput = document.getElementById("text-input");
const submitButton = document.getElementById("submit-btn");

function updateMessages() {
  messagesHolder.innerHTML = "";
  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.user}`;
    messageElement.innerText = message.content;
    messagesHolder.appendChild(messageElement);
  });
}

function submitMessage() {
  const message = textInput.value;
  if (message) {
    messages.push({
      user: "user",
      content: message,
    });
    textInput.value = "";
    updateMessages();

    //request
  }
}

function init() {
  updateMessages();

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitMessage();
    }
  });

  submitButton.addEventListener("click", () => {
    submitMessage();
  });
}

init();
