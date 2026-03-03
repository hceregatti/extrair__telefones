window.addEventListener('DOMContentLoaded', () => {
  const selectBtn = document.getElementById('selectBtn');
  const extractBtn = document.getElementById('extractBtn');
  const saveBtn = document.getElementById('saveBtn');
  const filePathSpan = document.getElementById('filePath');
  const progressDiv = document.getElementById('progress');
  const resultsDiv = document.getElementById('results');
  let selectedFile = null;
  let extractedPhones = [];
  const timerDiv = document.getElementById('timer');
  // Starts a countdown timer and updates the timerDiv every second.
  function startTimer(duration, onFinish) {
    let remaining = duration;
    timerDiv.textContent = `Tempo restante: ${remaining}s`;
    const interval = setInterval(() => {
      remaining--;
      if (remaining >= 0) {
        timerDiv.textContent = `Tempo restante: ${remaining}s`;
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
      timerDiv.textContent = '';
    };
  }

  // Select video file
  selectBtn.addEventListener('click', async () => {
    const result = await window.electronAPI.openFile();
    if (!result.canceled && result.filePaths.length > 0) {
      selectedFile = result.filePaths[0];
      filePathSpan.textContent = selectedFile;
      extractBtn.disabled = false;
    }
  });

  // Run extraction
  extractBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    extractBtn.disabled = true;
    progressDiv.textContent = 'Extraindo...';
    // Start a 60-second timer
    const stopTimer = startTimer(60);
    // Set a timeout to handle long extraction
    const timeoutId = setTimeout(() => {
      alert('Operação demorou demais e foi cancelada.');
      progressDiv.textContent = 'Erro: tempo esgotado.';
      stopTimer();
      extractBtn.disabled = false;
    }, 60000);
    try {
      const phones = await window.electronAPI.extractPhones(selectedFile);
      clearTimeout(timeoutId);
      stopTimer();
      extractedPhones = phones;
      progressDiv.textContent = `Found ${phones.length} phone number(s).`;
      resultsDiv.textContent = phones.join('\n');
      if (phones.length > 0) {
        saveBtn.style.display = 'inline-block';
      }
      // Cleanup temporary frames and generated txt file after extraction
      await window.electronAPI.cleanup();
    } catch (err) {
      clearTimeout(timeoutId);
      stopTimer();
      alert('Erro durante a extração: ' + err.message);
      progressDiv.textContent = 'Erro durante a extração.';
    } finally {
      extractBtn.disabled = false;
    }
  });

  // Save results using IPC
  saveBtn.addEventListener('click', async () => {
    const saveResult = await window.electronAPI.saveFile(extractedPhones);
    if (saveResult.success) {
      alert('Resultados salvos em ' + saveResult.filePath);
      // Reset UI after saving
      saveBtn.style.display = 'none';
      resultsDiv.textContent = '';
      progressDiv.textContent = '';
      filePathSpan.textContent = '';
      selectedFile = null;
    } else {
      alert('Salvamento cancelado.');
    }
  });
});
