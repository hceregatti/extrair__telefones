# 📞 Extração de Telefones de Vídeo com OCR

Este projeto em Node.js permite extrair **números de telefone brasileiros** a partir de **um vídeo**, utilizando OCR (Reconhecimento Óptico de Caracteres) com o Tesseract.js e o processamento de vídeo com FFmpeg.

## 🚀 Funcionalidades

- Extrai frames de um vídeo a cada X segundos.
- Executa OCR em cada frame para reconhecer textos.
- Identifica números de telefone com DDD no texto.
- Formata os números no padrão internacional E.164 (`+55`).
- Remove duplicatas automaticamente.
- Salva os resultados em um arquivo `telefones_formatados.txt`.

## 🧰 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Tesseract.js](https://github.com/naptha/tesseract.js)
- [Fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [fs-extra](https://github.com/jprichardson/node-fs-extra)
- [FFmpeg](https://ffmpeg.org/) (fornecido automaticamente via dependência npm)

## 📂 Estrutura

```
.
├── frames/                   # Pasta temporária dos frames extraídos
├── capturadetela.mp4         # Vídeo de entrada
├── telefones_formatados.txt  # Telefones extraídos (saída)
├── script.js                 # Código principal
└── README.md
```

## ⚙️ Pré-requisitos

- Node.js e npm instalados
- Instale as dependências do projeto:

```bash
npm install
```

## ▶️ Como Usar

1. Coloque seu vídeo no mesmo diretório com o nome `capturadetela.mp4` (ou edite o caminho no código).
2. Execute o script:

```bash
node script.js
```

3. Após a execução, os números extraídos estarão no arquivo `telefones_formatados.txt`.

## 📝 Exemplo de Saída

```
+5511999998888
+5511987654321
+551132456789
```

## 🛠 Personalização

- **Intervalo entre frames:** Altere o valor `intervaloSegundos` na função `extrairFrames` para capturar mais ou menos imagens.
- **Regex de telefones:** A função `extrairTelefonesE164()` pode ser ajustada conforme o padrão desejado.

## ❗️ Observações

- A acurácia depende da qualidade do vídeo e da nitidez dos números.
- O Tesseract pode demorar em vídeos longos ou com muitos frames.

## 📄 Licença

MIT - sinta-se livre para usar e modificar como quiser.

[LICENSE](https://github.com/hceregatti/extrair__telefones/blob/main/LICENSE.md)
