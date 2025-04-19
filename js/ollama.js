const url = localStorage.getItem('url');
const interactBox = document.querySelector(".interact");

let controllerAbort = null;
let abortadoAntes = false;

export function pararGeracao() {
  if (controllerAbort) {
    controllerAbort.abort();
    console.log("Geração abortada.");
  } else {
    abortadoAntes = true;
    console.log("Abortamento solicitado antes da geração iniciar.");
  }
  controllerAbort = null
}

export async function verificarOllama(url = 'http://127.0.0.1:11434') {
  try {
    const response = await fetch(`${url}/api/tags`);
    return response.ok;
  } catch (error) {
    console.error('Erro ao conectar com Ollama:', error.message);
    return false;
  }
}

export function verificarOllamaSimples(url = 'http://127.0.0.1:11434') {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `${url}/favicon.ico?${Date.now()}`;
  });
}

export async function criaBot(contexto, chat, armazenarContexto, travarChat, url) {
  const modelo = document.querySelector(".model-select").value;
  console.log(`Modelo: ${modelo}, enviando contexto:`, contexto);

  controllerAbort = new AbortController();
  const signal = controllerAbort.signal;

  if (abortadoAntes) {
    controllerAbort.abort();
    abortadoAntes = false;
  }

  const dialog = document.createElement("span");
  dialog.classList.add("bot");
  dialog.style.opacity = 0;

  const text = document.createTextNode("Gerando...");
  dialog.appendChild(text);
  chat.appendChild(dialog);
  chat.scrollTop = chat.scrollHeight;
  dialog.style.opacity = 1;

  const decoder = new TextDecoder();
  let respostaFinal = '';

  try {
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelo,
        messages: contexto,
        stream: true
      }),
      signal: signal
    });

    const reader = response.body.getReader();
    text.nodeValue = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const linhas = chunk.trim().split('\n');

      for (let linha of linhas) {
        try {
          const json = JSON.parse(linha);
          if (json.message && json.message.content) {
            respostaFinal += json.message.content;
            text.nodeValue = respostaFinal;
            chat.scrollTop = chat.scrollHeight;
          }
        } catch (e) {
          console.warn("Erro ao parsear:", linha);
        }
      }
    }

    armazenarContexto(respostaFinal, "assistant");
    console.log("Resposta do Ollama (chat):", respostaFinal);
  } catch (err) {
    if (err.name === 'AbortError') {
      if (dialog && dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
      console.log("Geração interrompida — nada exibido.");
      
      return;
    } else {
      text.nodeValue = '[Erro durante a geração]';
      console.error("Erro:", err);
    }
  } finally {
    controllerAbort = null;
    abortadoAntes = false;
    interactBox.classList.remove("off");
  }
}

export async function listarModelosLocais() {
  const resposta = await fetch(`${localStorage.getItem("urlOllama")}/api/tags`);
  const dados = await resposta.json();

  const modelos = dados.models.map(modelo => modelo.name);
  console.log("Modelos instalados:", modelos);
  return modelos;
}
