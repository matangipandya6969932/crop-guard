// Register Service Worker for PWA Offline Capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(reg => console.log('Service Worker registered successfully:', reg.scope))
      .catch(err => console.log('Service Worker registration failed:', err));
  });
}

// Target the correct model file name uploaded to GitHub
const MODEL_PATH = './model_unquant.tflite';

// Simple model check on startup
window.addEventListener('DOMContentLoaded', () => {
  fetch(MODEL_PATH, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Model file missing');
      }
      console.log('Model file verified and ready for offline use.');
    })
    .catch(error => {
      console.error('Error loading diagnostic model:', error);
      alert('Error loading diagnostic model. Check network connection for initial setup.');
    });
});
