document.getElementById('verifyBtn').addEventListener('click', function() {
    // Request access to the user's camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function(stream) {
        // Create a video element to display the live camera feed
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
  
        // Append the video element to the popup or perform further actions
        document.body.appendChild(videoElement);
  
        // Capture the live camera feed
        captureLiveCameraFeed(stream);
      })
      .catch(function(error) {
        console.error('Error accessing camera:', error);
      });
  });
  
  function captureLiveCameraFeed(stream) {
    // Create a canvas element to capture frames from the live camera feed
    const canvasElement = document.createElement('canvas');
    const canvasContext = canvasElement.getContext('2d');
  
    // Set the canvas dimensions to match the video feed
    const videoElement = document.querySelector('video');
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
  
    // Periodically capture frames from the video feed
    setInterval(function() {
      canvasContext.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
  
      // Convert the canvas content to a data URL (base64-encoded image)
      const screenshotUrl = canvasElement.toDataURL('image/png');
  
      // Send the screenshot to the Python server
      sendScreenshotToServer(screenshotUrl);
    }, 1000);  // Adjust the interval as needed
  }
  
  function sendScreenshotToServer(screenshotUrl) {
    // Prepare the data to send to the server
    const requestData = {
      image_path: screenshotUrl,
    };
  
    // Send a POST request to the Flask server
    fetch('http://127.0.0.1:5000/get_age_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server
      console.log('Age status from server:', data.age_status);
      // You can now use data.age_status in your extension logic
    })
    .catch(error => {
      console.error('Error communicating with the server:', error);
    });
  }
  