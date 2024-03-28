const messages = [];

const messagesContainer = document.querySelector(".messages-container");
const messagesHolder = document.getElementById("messages");
const textInput = document.getElementById("text-input");
const submitButton = document.getElementById("submit-btn");

let submitDisabled = false;

function updateMessages() {
  messagesHolder.innerHTML = "";
  messages.forEach((message) => {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${message.role}`;
    messageElement.innerText = message.content;
    messagesHolder.appendChild(messageElement);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

async function submitMessage() {
  if (submitDisabled) {
    return;
  }
  submitDisabled = true;
  submitButton.disabled = submitDisabled;
  const message = textInput.value;
  if (message) {
    messages.push({
      role: "user",
      content: message,
    });
    textInput.value = "";
    updateMessages();

    await requestAPI(messages);
  }
  submitDisabled = false;
  submitButton.disabled = submitDisabled;
}

async function requestAPI(messages) {
  const req = await fetch("./api/anthropic", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
  });
  if (req.ok) {
    const data = await req.json();

    const message = {
      role: data.role,
      content: data.content[0].text,
    };

    messages.push(message);
    this.updateMessages();
  } else {
    console.error("Error:", req.status, req.type, req.body);
    //show alert
    showError("An error occurred while sending the message.");
  }
}

function showError(
  message,
  variant = "danger",
  icon = "info-circle",
  duration = 5000,
) {
  const alert = Object.assign(document.createElement("sl-alert"), {
    variant,
    closable: true,
    duration: duration,
    innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${message}
      `,
  });

  document.body.append(alert);
  return alert.toast();
}

async function init() {
  const test = await fetch("/api/test");
  const data = await test.json();
  console.log(data);

  textInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitMessage();
    }
  });

  submitButton.addEventListener("click", () => {
    submitMessage();
  });
}

init();
