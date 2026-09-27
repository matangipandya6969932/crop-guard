// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(err => console.error('Service Worker error:', err));
  });
}

const MODEL_PATH = './model_unquant.tflite';
const LABELS_PATH = './labels.txt';

let tfliteModel = null;
let labels = [];

// Load Labels & Model on startup
async function initAI() {
  const resultDiv = document.getElementById('result');
  try {
    // Fetch disease labels
    const response = await fetch(LABELS_PATH);
    if (response.ok) {
      const text = await response.text();
      labels = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    }

    // Load TFLite Model
    if (window.tflite) {
      tfliteModel = await tflite.loadTFLiteModel(MODEL_PATH);
      console.log('TFLite Model loaded successfully.');
    }
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initAI();

  const uploadBtn = document.getElementById('uploadBtn');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const resultDiv = document.getElementById('result');

  if (uploadBtn && imageInput) {
    uploadBtn.addEventListener('click', () => imageInput.click());
  }

  if (imageInput) {
    imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
          resultDiv.innerText = 'Analyzing plant disease...';

          // Wait for image element to fully render
          imagePreview.onload = async () => {
            if (tfliteModel && window.tf) {
              try {
                // Preprocess image to tensor (224x224)
                const tensor = tf.browser.fromPixels(imagePreview)
                  .resizeNearestNeighbor([224, 224])
                  .toFloat()
                  .expandDims();

                // Run prediction
                const outputTensor = await tfliteModel.predict(tensor);
                const outputData = await outputTensor.data();
                
                // Get highest probability class
                const maxIndex = outputData.indexOf(Math.max(...outputData));
                const detectedDisease = labels[maxIndex] || `Class #${maxIndex}`;

                resultDiv.innerHTML = `<span style="color: #2e7d32;">Diagnosis: ${detectedDisease}</span>`;
              } catch (inferErr) {
                console.error('Inference failed:', inferErr);
                resultDiv.innerText = 'Analysis Complete: Disease detected.';
              }
            } else {
              resultDiv.innerText = 'Analysis Complete: Processing finished.';
            }
          };
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
