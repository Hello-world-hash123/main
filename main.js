// DOM Elements
const video = document.getElementById('videoFeed');
const canvas = document.getElementById('canvas');
const capturedPhoto = document.getElementById('capturedPhoto');
const fileInput = document.getElementById('fileInput');

// State
let photoDataUrl = null;

// Start Camera
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();
    } catch (error) {
        console.error('Error accessing camera:', error);
        showToast('Camera access denied!', 'error');
    }
}

// Capture Photo
function capturePhoto() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to Data URL
    photoDataUrl = canvas.toDataURL('image/jpeg');
    capturedPhoto.src = photoDataUrl;
    capturedPhoto.style.display = 'block';

    // Automatically send the photo
    sendPhoto(photoDataUrl);
}

// Handle File Upload
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            photoDataUrl = e.target.result;
            capturedPhoto.src = photoDataUrl;
            capturedPhoto.style.display = 'block';

            // Automatically send the photo
            sendPhoto(photoDataUrl);
        };
        reader.readAsDataURL(file);
    }
});

// Send Photo to Backend
async function sendPhoto(photoDataUrl) {
    try {
        console.log('Sending photo to backend...');
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photo: photoDataUrl }),
        });

        const data = await response.json();
        console.log('Response:', data);

        if (response.ok) {
            showToast('Photo sent successfully!', 'success');
        } else {
            console.error('Error response:', data.error);
            showToast(data.error || 'Failed to send photo.', 'error');
        }
    } catch (error) {
        console.error('Error sending photo:', error);
        showToast('Error sending photo.', 'error');
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-visible ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// Initialize
startCamera();