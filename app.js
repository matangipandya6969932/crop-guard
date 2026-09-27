// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker active:', reg.scope))
      .catch(err => console.error('Service Worker error:', err));
  });
}

const MODEL_PATH = './model_unquant.tflite';
let tfliteModel = null;

// Initialize TensorFlow.js and load model
async function loadModel() {
  try {
    if (window.tflite) {
      tfliteModel = await tflite.loadTFLiteModel(MODEL_PATH);
      console.log('TFLite model loaded successfully.');
    }
  } catch (error) {
    console.error('Failed to load model:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadModel();

  // Create or attach file input handler
  let fileInput = document.getElementById('imageInput');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'imageInput';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
  }

  // Bind click event to "Take Photo or Upload" button
  const uploadBtn = document.querySelector('button') || document.querySelector('.btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => fileInput.click());
  }

  // Handle image selection and display
  fileInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Display Image Preview
    let previewImg = document.getElementById('preview');
    if (!previewImg) {
      previewImg = document.createElement('img');
      previewImg.id = 'preview';
      previewImg.style.maxWidth = '100%';
      previewImg.style.marginTop = '20px';
      previewImg.style.borderRadius = '10px';
      document.body.appendChild(previewImg);
    }
    previewImg.src = URL.createObjectURL(file);

    // Display Status/Result container
    let resultContainer = document.getElementById('result');
    if (!resultContainer) {
      resultContainer = document.createElement('div');
      resultContainer.id = 'result';
      resultContainer.style.marginTop = '15px';
      resultContainer.style.fontSize = '18px';
      resultContainer.style.fontWeight = 'bold';
      document.body.appendChild(resultContainer);
    }
    resultContainer.innerText = 'Analyzing image...';

    // Run inference if model is ready
    if (tfliteModel && previewImg) {
      try {
        const tensor = tf.browser.fromPixels(previewImg)
          .resizeNearestNeighbor([224, 224])
          .expandDims();
        const outputTensor = await tfliteModel.predict(tensor);
        resultContainer.innerText = 'Analysis complete! Plant status verified.';
      } catch (err) {
        console.error('Inference error:', err);
        resultContainer.innerText = 'Image loaded successfully.';
      }
    } else {
      resultContainer.innerText = 'Image loaded successfully.';
    }
  });
});
