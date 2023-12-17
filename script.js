const chatInput = document.querySelector("#chat-input");
const sendBtn = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn")
const deleteButton = document.querySelector("#delete-btn")

let userText = null;
const API_KEY = "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"
const initialHeight = chatInput.scrollHeight

const loadDataFromLocalstorage = () => {
    
    const themeColor = localStorage.getItem("theme-color")
    document.body.classList.toggle("light-mode", themeColor === "light_mode")
    localStorage.setItem("theme-color", themeButton.innerText)
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode"
    const defaultText = `
        <div class="default-text">
            <h1>ChatGPT</h1>
            <p>Start a conversation and explore the power of AI</p>
        </div>
    
    `
    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText
    chatContainer.scrollTo(0, chatContainer.scrollHeight)

}

loadDataFromLocalstorage();

const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.openai.com/v1/completions";
    const pElement = document.createElement("p");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-instruct",
            prompt: userText,
            max_tokens: 2048,
            temperature: 0.2,
            n: 1,
            stop: null
        })
    }
    try {
        const res = await (await fetch(API_URL, requestOptions)).json()
        pElement.textContent = res.choices[0].text.trim();
        console.log(pElement);
    } catch (err) {
        pElement.classList.add('error')
        pElement.textContent = "Oops! Something went wrong. Please try again later."
    }
    
    incomingChatDiv.querySelector(".typing-animation").remove()
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement)
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    localStorage.setItem("all-chats", chatContainer.innerHTML)
}

const createElement = (html, className) => {
    const chatdiv = document.createElement("div");
    chatdiv.classList.add("chat", className)
    chatdiv.innerHTML = html;
    return chatdiv
}

const copyResponse = (copyBtn) => {
    const resText = copyBtn.parentElement.querySelector("p").textContent
    navigator.clipboard.writeText(resText)
    copyBtn.textContent = "Done"
    setTimeout(() => copyBtn.textContent = "content_copy", 1000)
}

const showTypingAnimation = () => {
    const html = `
    <div class="chat-content">
        <div class="chat-details">
            <img src="./images/chatgpt.png" alt="chatbot-img">
            <div class="typing-animation">
                <div class="typing-dot" style="--delay: 0.2s"></div>
                <div class="typing-dot" style="--delay: 0.3s"></div>
                <div class="typing-dot" style="--delay: 0.4s"></div>
            </div>
        </div>
        <span onclick="copyResponse(this)" class="material-symbols-rounded"><i class="fa-regular fa-copy"></i></span>
    </div>
    `
    const incomingChatDiv = createElement(html, "incoming")
    chatContainer.appendChild(incomingChatDiv)
    getChatResponse(incomingChatDiv)
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    // console.log(incomingChatDiv);    
}


const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if (!userText) return;

    chatInput.value = ""
    chatInput.style.height = `${initialHeight}px`

    const html = `
        <div class="chat-content">
            <div class="chat-details">
                <img src="./images/user.jpg" alt="user-img">
                <p></p>
            </div>
        </div>
    `
    const outgoingChatDiv = createElement(html, "outgoing")
    outgoingChatDiv.querySelector("p").textContent = userText
    chatContainer.append(outgoingChatDiv)
    chatContainer.scrollTo(0, chatContainer.scrollHeight)
    setTimeout(showTypingAnimation, 500)
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode")
    localStorage.setItem("theme-color", themeButton.innerText)
    document.querySelector("default-text")?.remove()
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode"
})

deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all chats?")) {
        localStorage.removeItem("all-chats")
        chatContainer.innerHTML = ""
        loadDataFromLocalstorage()
    }
})

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialHeight}px`
    chatInput.style.height = `${chatInput.scrollHeight}px`
})
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800){
        e.preventDefault()
        handleOutgoingChat()
    }
})

sendBtn.addEventListener('click', handleOutgoingChat)