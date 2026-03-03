# 📞 Extração de Telefones de Vídeo com OCR (Desktop App)

Este projeto é uma **aplicação desktop** construída com **Electron.js** que permite extrair **números de telefone brasileiros** a partir de um **vídeo**. A ferramenta utiliza OCR (Reconhecimento Óptico de Caracteres) com o Tesseract.js e o processamento de vídeo com FFmpeg para identificar números de telefone de forma automatizada.

## 🚀 Funcionalidades

- **Interface Gráfica Amigável:** Interface construída com HTML e estilizada com TailwindCSS.
- **Seleção de Vídeos:** Escolha vídeos (`.mp4`, `.avi`, `.mov`) diretamente do seu computador.
- **Extração Rápida:** Extrai frames do vídeo (1 frame por segundo) e usa OCR para reconhecer textos.
- **Validação de Telefones:** Identifica números de telefone com DDD no texto e os formata no padrão internacional E.164 (`+55`).
- **Remoção de Duplicatas:** Filtra e exibe os números de forma única.
- **Feedback em Tempo Real:** Barra de progresso e um _timer_ de contagem regressiva (limite de 60 segundos por extração).
- **Tratamento de Erros:** Alertas caso a extração demore demais ou ocorram erros.
- **Salvar Resultados:** Permite salvar os números extraídos em um arquivo `.txt` escolhido pelo usuário através de um diálogo de salvamento do sistema.
- **Limpeza Automática:** Remove arquivos e pastas temporárias após concluir a extração, poupando espaço no disco.

## 🧰 Tecnologias Utilizadas

- **[Electron](https://www.electronjs.org/)**: Para criação da aplicação desktop multiplataforma.
- **[Node.js](https://nodejs.org/)**: Backend da aplicação (Main Process).
- **[Tesseract.js](https://github.com/naptha/tesseract.js)**: Motor de OCR.
- **[Fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) e [@ffmpeg-installer/ffmpeg]**: Para manipulação do vídeo e extração de frames.
- **[TailwindCSS](https://tailwindcss.com/)**: Para estilização rápida da interface (via CDN).
- **[fs-extra](https://github.com/jprichardson/node-fs-extra)**: Para manipulação de arquivos e diretórios pesados.

## 📂 Estrutura do Projeto

```text
.
├── src/
│   ├── extractor.js        # Lógica de extração usando ffmpeg e Tesseract
│   ├── renderer.html       # Interface visual do usuário (UI)
│   └── renderer.js         # Lógica de controle de eventos da interface
├── main.js                 # Arquivo centralizador do Electron (Main Process)
├── preload.js              # Intermediário seguro (Context Bridge) entre UI e Main Process
├── package.json            # Dependências e scripts
└── README.md
```

## ⚙️ Pré-requisitos

- **Node.js** instalado (versão recomendada: LTS).
- Ferramenta de gerenciamento de pacotes (`npm`).

## ▶️ Como Rodar em Ambiente de Desenvolvimento

1. Clone o repositório ou baixe os arquivos.
2. Instale as dependências executando no terminal, dentro da pasta do projeto:

```bash
npm install
```

3. Inicie o aplicativo com o Electron:

```bash
npm run dev
```

## 📦 Como Gerar o Executável (Build)

O projeto utiliza o `electron-builder` para criar os instaladores do aplicativo.
Para gerar o build final (como `.dmg` para Mac ou `.nsis` para Windows), execute:

```bash
npm run build
```

## ▶️ Como Usar o Aplicativo

1. Abra o aplicativo.
2. Clique em **"Selecione o vídeo"** e escolha o arquivo desejado.
3. Clique em **"Extrair Telefones"**. Aguarde o processamento (você verá o timer e o progresso na tela).
4. Assim que os números forem identificados, eles aparecerão na caixa de resultados.
5. Clique em **"Salvar Resultados"** para guardá-los e selecione uma pasta no seu computador.

## ❗️ Observações Adicionais

- **Desempenho (Timeout):** O aplicativo possui um tempo limite de 60 segundos por padrão na extração. Arquivos de vídeo muito longos podem acabar em falha devido a este timeout imposto.
- **Precisão do OCR:** A acurácia da extração depende consideravelmente da nitidez dos números dentro do vídeo e dos fundos contrastantes da imagem.
- **Arquivos temporários:** Os arquivos de idiomas do Tesseract (`por.traineddata`, `eng.traineddata`) estarão presentes na pasta raiz na primeira execução ou caso já estejam em cache localmente.

## 📄 Licença

MIT - sinta-se livre para usar e modificar como quiser.

[LICENSE](https://github.com/hceregatti/extrair__telefones/blob/main/LICENSE.md)
