import { criaBot, listarModelosLocais, pararGeracao, verificarOllama, verificarOllamaSimples } from "./ollama.js";

const chatInput = document.querySelector(".inputText");
const interactBox = document.querySelector(".interact");
const painel = document.querySelector(".starting");
const chat = document.querySelector(".chat");
const sendButton = document.querySelector(".send");
const optionButton = document.querySelector(".optionsButton");
const modelList = document.querySelector(".model-select");
const configMenu = document.querySelector(".backMenu");
const showMenu = document.querySelector(".showMenu");
const verificarUrl = document.querySelector(".verificarUrl");
const ollamaUrl = document.querySelector(".inputOllamaUrl");
const resetButton = document.querySelector(".newChatButton");
const welcome = document.querySelector(".welcome")

  // mensagens de boas vindas
const boasVindas = [
  "Olá, como posso te ajudar hoje?",
  "Pronto para conversar com a inteligência artificial?",
  "Oi, o que você gostaria de descobrir?",
  "Olá, estamos prontos para te ajudar!",
  "Fale comigo, sua jornada começa agora!",
  "Olá, em que posso ser útil para você?",
  "Vamos conversar? Estou aqui para ajudar!",
  "Oi, o que você quer saber hoje?",
  "Bem-vindo! Vamos explorar juntos!",
  "Olá, pronto para uma conversa inteligente?",
  "Oi! No que posso te auxiliar hoje?",
  "Olá! Preparado para aprender algo novo?",
  "E aí, vamos bater um papo inteligente?",
  "Oi, estou aqui para tirar suas dúvidas!",
  "Seja bem-vindo! Como posso colaborar com você?",
  "Vamos começar? Me diga o que você precisa!",
  "Pronto para descobrir algo incrível hoje?",
  "Oi! Que tal começarmos com uma boa conversa?",
  "Estou à disposição! Qual o seu próximo passo?",
  "Olá! Vamos juntos nessa jornada de conhecimento?"
];

let url = localStorage.getItem("urlOllama");

function random(min, max){
  return parseInt(Math.random() * (max - min) + min);
}

function mensagemEntrada(){
  const newMessage = random(0, boasVindas.length);
  console.log(newMessage)
  welcome.innerHTML = `${boasVindas[newMessage]}`
}

mensagemEntrada()

async function trazerModels(url) { 
  const array = await listarModelosLocais(url);

  // Limpa os options anteriores
  modelList.innerHTML = '';

  for (let i of array) {
      const newModel = document.createElement("option");
      newModel.value = i;
      const text = document.createTextNode(i);
      newModel.appendChild(text);
      modelList.appendChild(newModel);
  }
}

function armazenarContexto(content, role) {
  let contexto = JSON.parse(localStorage.getItem("context")) || [];
  contexto.push({ role: role, content: content });
  localStorage.setItem("context", JSON.stringify(contexto));
  return localStorage.getItem("context");
}

function obterContexto() {
  return JSON.parse(localStorage.getItem("context")) || [];
}

function sendMessage(message) {
  const dialog = document.createElement("span");
  dialog.classList.add("user");
  dialog.style.opacity = 0;
  const text = document.createTextNode(message);
  dialog.appendChild(text);
  chat.appendChild(dialog);
  chat.scrollTop = chat.scrollHeight;
  dialog.style.opacity = 1;

  armazenarContexto(message, "user");

  setTimeout(() => {
    const contexto = obterContexto();
    criaBot(contexto, chat, armazenarContexto, travarChat, url);
  }, 1000);
}

function travarChat() {
    interactBox.classList.toggle("off")
}

function startChat() {
  painel.classList.add("painelOff");
}

function removeLocal(item){
  localStorage.removeItem(item)
}

function modelSelect(){
  const selected = localStorage.getItem("selectedModel")
  const optionExists = [...modelList.options].some(opt => opt.value === selected)

  if (selected && optionExists) {
    modelList.value = selected
  } else {
    console.log(`Modelo "${selected}" não encontrado. Criando selectedModel vazio no armazenamento.`)
    localStorage.setItem("selectedModel", '')
    modelList.value = ''
  }
}

function newChat(){
  interactBox.classList.remove("off");
  painel.classList.remove("painelOff");
  chat.innerHTML = '';
  localStorage.removeItem("context");
  pararGeracao();
}

removeLocal("context")

trazerModels(url).then(() => {
  modelSelect()
})




optionButton.addEventListener("click", (e) =>{
  configMenu.classList.toggle("backMenuOff")
  showMenu.classList.toggle("showMenuOff")
})

configMenu.addEventListener("click", (e) =>{
  if (e.target.classList[0] === "backMenu"){
    configMenu.classList.toggle("backMenuOff")
    showMenu.classList.toggle("showMenuOff")
  }
})

sendButton.addEventListener("click", e =>{
  if (interactBox.classList.value === "interact" && chatInput.value !== "") {
    sendMessage(chatInput.value);
    startChat();
    chatInput.value = "";
    interactBox.classList.add("off");
  }
})

verificarUrl.addEventListener("click", async function(e){
    const tempOllama = ollamaUrl.value;
  if(await verificarOllama(tempOllama)){
    localStorage.setItem("urlOllama", tempOllama);
    console.log(tempOllama);
    document.querySelector(".containerUrl span").style.backgroundColor = "green";
    document.querySelector(".containerUrl span").style.filter = "drop-shadow(0px 0px 2px green)";
    url = tempOllama;
    trazerModels(url)
  } else{
      document.querySelector(".containerUrl span").style.backgroundColor = "red"
      document.querySelector(".containerUrl span").style.filter = "drop-shadow(0px 0px 2px red)"
      modelList.innerHTML = ''
  }
});

resetButton.addEventListener("click", e => {
  newChat()
})

chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && interactBox.classList.value === "interact" && chatInput.value !== "") {
    sendMessage(chatInput.value);
    startChat();
    chatInput.value = "";
    chatInput
    interactBox.classList.add("off");
  }
});

modelList.addEventListener("click", e =>{
  if(modelList.value !== localStorage.getItem("selectedModel")){
      localStorage.setItem("selectedModel", modelList.value)
      console.log(modelList.value)
  }
})


  // Cards de Sujestões em ordem
document.querySelector(".container1").addEventListener("click", e =>{
  chatInput.value = "Você agora se transformou em uma especialista em enigmas lógicos. Sua tarefa é criar enigmas desafiadores e interessantes para testar a capacidade de raciocínio lógico de quem os resolve. Cada enigma deve ser único, com uma solução lógica clara e explicação detalhada. Os enigmas podem envolver dedução, padrões, puzzles matemáticos, raciocínio abstrato ou outras formas de desafios intelectuais. Ao criar um enigma, forneça também a resposta correta e uma explicação passo a passo sobre como chegar a ela. As respostas devem ser lógicas e precisas, sem ambiguidades. Seja criativo ao variar os tipos de enigmas, mas sempre busque um equilíbrio entre dificuldade e clareza na resolução."
})

document.querySelector(".container2").addEventListener("click", e =>{
  chatInput.value = "Você agora se transformou no escritor Stephen King, e sua tarefa é reescrever a história clássica da Chapeuzinho Vermelho, mas com o seu estilo único de narrativa. A história deve manter os elementos principais – como a Chapeuzinho, sua visita à casa da avó e o lobo – mas com uma reviravolta sombria, tensa e cheia de elementos de horror psicológico, mistério e tensão. Em vez de um conto infantil, você deve criar uma versão mais sombria e complexa, explorando temas como medo, a natureza humana e o sobrenatural. O lobo pode ser algo muito mais ameaçador e sinistro, e a história deve criar uma sensação de claustrofobia e perigo iminente. Inclua elementos do estilo de King, como uma construção lenta da tensão, personagens profundos e um final que deixe os leitores com um sentimento de desconforto."
})

document.querySelector(".container3").addEventListener("click", e =>{
  chatInput.value = "Você agora é um assistente especializado em criar ideias inovadoras para aplicações web focadas em produtividade. Seu objetivo é sugerir uma ideia de aplicação que ajude os usuários a gerenciar melhor o tempo, tarefas e objetivos, otimizando a eficiência. A aplicação deve ser simples, prática e acessível, focando em resolver um problema real de produtividade. Considere elementos como organização de tarefas, integração com outras ferramentas, métodos de produtividade (como Pomodoro ou GTD), ou até mesmo funcionalidades para evitar distrações. Seja criativo, mas mantenha a ideia voltada para uma solução prática e eficaz."
})