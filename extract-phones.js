const ffmpeg = require("fluent-ffmpeg");
const Tesseract = require("tesseract.js");
const fs = require("fs-extra");
const path = require("path");

// Regex para capturar e formatar números de telefone
function extrairTelefonesE164(texto) {
  const regex = /\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g;
  const encontrados = texto.match(regex) || [];
  const numeros = encontrados.map((num) => {
    const digitos = num.replace(/\D/g, "");
    if (digitos.length === 10 || digitos.length === 11) {
      return `+55${digitos}`;
    }
    return null;
  }).filter(Boolean);
  return numeros;
}

const pastaFrames = path.join(__dirname, "frames");
const videoEntrada = "capturadetela.mp4";

async function extrairFrames(videoPath, intervaloSegundos = 1) {
  await fs.ensureDir(pastaFrames);
  await fs.emptyDir(pastaFrames);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([`-vf fps=1/${intervaloSegundos}`])
      .output(path.join(pastaFrames, "frame_%04d.png"))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

async function processarOCR() {
  const arquivos = (await fs.readdir(pastaFrames)).filter(f => f.endsWith(".png"));
  const telefonesSet = new Set();

  for (const arquivo of arquivos) {
    const caminho = path.join(pastaFrames, arquivo);
    const resultado = await Tesseract.recognize(caminho, "por", { logger: m => console.log(m.status) });
    const extraidos = extrairTelefonesE164(resultado.data.text);
    extraidos.forEach(num => telefonesSet.add(num));
  }

  const listaFinal = Array.from(telefonesSet).sort();

  // Salvar como TXT
  const txtPath = "telefones_formatados.txt";
  fs.writeFileSync(txtPath, listaFinal.join("\n"), "utf8");

  console.log(`${listaFinal.length} número(s) salvos em '${txtPath}'`);
}

(async () => {
  try {
    console.log("Extraindo frames...");
    await extrairFrames(videoEntrada);
    console.log("Executando OCR e formatando...");
    await processarOCR();
  } catch (err) {
    console.error("Erro:", err);
  }
})();