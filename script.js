const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const Tesseract = require('tesseract.js');
const fs = require('fs-extra');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function extractPhonesE164(text) {
  const regex = /\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g;
  const matches = text.match(regex) || [];
  const numbers = matches
    .map((num) => {
      const digits = num.replace(/\D/g, '');
      if (digits.length === 10 || digits.length === 11) {
        return `+55${digits}`;
      }
      return null;
    })
    .filter(Boolean);
  return numbers;
}

const framesFolder = path.join(__dirname, 'frames');
const inputVideo = 'capturadetela.mp4';

async function extractFrames(videoPath, intervalSeconds = 1) {
  await fs.ensureDir(framesFolder);
  await fs.emptyDir(framesFolder);

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([`-vf fps=1/${intervalSeconds}`])
      .output(path.join(framesFolder, 'frame_%04d.png'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

async function processOCR() {
  const files = (await fs.readdir(framesFolder)).filter((f) => f.endsWith('.png'));
  const phonesSet = new Set();

  for (const file of files) {
    const filePath = path.join(framesFolder, file);
    const result = await Tesseract.recognize(filePath, 'por', {
      logger: (m) => console.log(m.status),
    });
    const extracted = extractPhonesE164(result.data.text);
    extracted.forEach((num) => phonesSet.add(num));
  }

  const finalList = Array.from(phonesSet).sort();

  // Save file
  const txtPath = 'formatted_phones.txt';
  fs.writeFileSync(txtPath, finalList.join('\n'), 'utf8');

  console.log(`${finalList.length} number(s) saved in '${txtPath}'`);
}

(async () => {
  try {
    console.log('Extracting frames...');
    await extractFrames(inputVideo);
    console.log('Running OCR and formatting...');
    await processOCR();
  } catch (err) {
    console.error('Error:', err);
  }
})();
