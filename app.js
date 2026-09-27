// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.error('Service Worker registration failed:', err));
  });
}

const MODEL_PATH = './model_unquant.tflite';

// Verify Model Path
window.addEventListener('DOMContentLoaded', () => {
  fetch(MODEL_PATH, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) throw new Error('Model file missing');
      console.log('Model file verified and ready for offline use.');
    })
    .catch(error => {
      console.error('Error loading diagnostic model:', error);
    });

  const uploadBtn = document.getElementById('uploadBtn');
  const imageInput = document.getElementById('imageInput');
  const imagePreview = document.getElementById('imagePreview');
  const resultDiv = document.getElementById('result');

  // Trigger file selection dialog on button click
  if (uploadBtn && imageInput) {
    uploadBtn.addEventListener('click', () => {
      imageInput.click();
    });
  }

  // Handle selected image file
  if (imageInput) {
    imageInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = 'block';
          resultDiv.innerText = 'Analyzing leaf sample...';
          
          // Simulated diagnostic result display
          setTimeout(() => {
            resultDiv.innerText = 'Analysis Complete: Sample processed successfully.';
          }, 1200);
        };
        reader.readAsDataURL(file);
      }
    });
  }
});
