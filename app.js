let tfliteModel;
let labels = [];

// Initialize assets
async function initApp() {
  try {
    tflite.setWasmPath('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-tflite@0.0.1-alpha.9/dist/');
    tfliteModel = await tflite.loadTFLiteModel('./model/model_unquant.tflite');
    
    const response = await fetch('./model/labels.txt');
    const text = await response.text();
    labels = text.split('\n').map(l => l.trim()).filter(Boolean);
    
    console.log("CropGuard Ready.");
  } catch (err) {
    alert("Error loading diagnostic model. Check network connection for initial setup.");
  }
}

async function fetchTreatment(cleanLabel) {
  try {
    const res = await fetch('./remedies.json');
    const remedies = await res.json();
    
    const matchedKey = Object.keys(remedies).find(
      key => key.toLowerCase() === cleanLabel || cleanLabel.includes(key.toLowerCase())
    );

    return matchedKey ? remedies[matchedKey] : "No specific remedy found for this diagnosis.";
  } catch (err) {
    return "Unable to retrieve remedies.";
  }
}

document.getElementById('imageUpload').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file || !tfliteModel) return;

  // Display Image Preview
  const imgElement = document.getElementById('imagePreview');
  imgElement.src = URL.createObjectURL(file);
  document.getElementById('imagePreviewContainer').classList.remove('hidden');

  imgElement.onload = async () => {
    // Model Inference
    const tensor = tf.browser.fromPixels(imgElement)
      .resizeBilinear([224, 224])
      .expandDims(0)
      .toFloat()
      .div(127.5)
      .sub(1);

    const outputTensor = tfliteModel.predict(tensor);
    const predictions = await outputTensor.data();

    let maxIndex = 0;
    for (let i = 1; i < predictions.length; i++) {
      if (predictions[i] > predictions[maxIndex]) maxIndex = i;
    }

    const rawLabel = labels[maxIndex] || "Unknown";
    const cleanLabel = rawLabel.replace(/^[0-9]+\s*/, '').trim().toLowerCase();
    const confidence = (predictions[maxIndex] * 100).toFixed(1);

    // Update UI elements
    document.getElementById('statusBadge').innerText = rawLabel.replace(/^[0-9]+\s*/, '');
    document.getElementById('confidenceScore').innerText = `Confidence: ${confidence}%`;
    
    const treatment = await fetchTreatment(cleanLabel);
    document.getElementById('remedyText').innerText = treatment;

    document.getElementById('resultCard').classList.remove('hidden');
  };
});

// Offline Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js');
}

initApp();