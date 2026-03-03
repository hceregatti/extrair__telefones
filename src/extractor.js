const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const Tesseract = require('tesseract.js');
const fs = require('fs-extra');
const path = require('path');

let ffmpegPath = ffmpegInstaller.path;
// In production builds, ffmpeg is packed into app.asar.unpacked (or we pretend it to be so we can run it, assuming asarUnpack is used or just string replacement is needed for the binary to execute outside the asar).
if (ffmpegPath.includes('app.asar')) {
  ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
}
ffmpeg.setFfmpegPath(ffmpegPath);

function extractPhonesE164(text) {
  const regex = /\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}/g;
  const matches = text.match(regex) || [];
  return matches
    .map((num) => {
      const digits = num.replace(/\D/g, '');
      if (digits.length === 10 || digits.length === 11) {
        return `+55${digits}`;
      }
      return null;
    })
    .filter(Boolean);
}

async function extractFrames(videoPath, framesDir, intervalSeconds = 1) {
  await fs.ensureDir(framesDir);
  await fs.emptyDir(framesDir);
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([`-vf fps=1/${intervalSeconds}`])
      .output(path.join(framesDir, 'frame_%04d.png'))
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

async function processOCR(framesDir) {
  const files = (await fs.readdir(framesDir)).filter((f) => f.endsWith('.png'));
  const phonesSet = new Set();
  for (const file of files) {
    const filePath = path.join(framesDir, file);
    const result = await Tesseract.recognize(filePath, 'por', {
      logger: (m) => console.log(m.status),
    });
    const extracted = extractPhonesE164(result.data.text);
    extracted.forEach((num) => phonesSet.add(num));
  }
  return Array.from(phonesSet).sort();
}

const { app } = require('electron');

/**
 * Extract phone numbers from a video file.
 * @param {string} videoPath Absolute path to the input video.
 * @returns {Promise<string[]>} Sorted array of formatted phone numbers.
 */
async function extractPhonesFromVideo(videoPath) {
  const userDataPath = app.getPath('userData');
  const framesDir = path.join(userDataPath, 'frames');
  console.log('Extracting frames...');
  await extractFrames(videoPath, framesDir);
  console.log('Running OCR...');
  const phones = await processOCR(framesDir);
  const txtPath = path.join(userDataPath, 'formatted_phones.txt');
  await fs.writeFile(txtPath, phones.join('\n'), 'utf8');
  console.log(`${phones.length} number(s) saved in '${txtPath}'`);
  return phones;
}

module.exports = { extractPhonesFromVideo };
