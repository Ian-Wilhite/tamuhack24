chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'verifyAge') {
    // Make a request to your Python server to determine if the user is over 18
    fetch('http://127.0.0.1:5000/get_age_status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_path: request.imagePath }), // Adjust the key based on your server's expectations
    })
    .then(response => response.json())
    .then(data => {
      if (data.age_status) {
        sendResponse({ allowed: true });
      } else {
        // Block the website
        chrome.webRequest.onBeforeRequest.addListener(
          function(details) {
            return { cancel: true };
          },
          { urls:  ["https://pornhub.com/*",
          "https://cnn.com/*",
          "https://coolmathgames.com/*",
          "https://foxnews.com/*",
          "https://brazzers.com/*",
          "https://wikipedia.com/*",
          "https://twitter.com/*",
          "https://omegle.com/*",
          "https://4chan.org/*",
          "https://bovada.lv/*",
          "https://reddit.com/*",
          "https://pokerstars.com/*",
          "https://tinder.com/*",
          "https://grindr.com/*"] }, // Add your blocked URLs
          ['blocking']
        );

        sendResponse({ allowed: false });
      }
    })
    .catch(error => {
      console.error('Error communicating with the server:', error);
      sendResponse({ allowed: false });
    });

    // Return true to indicate that the sendResponse callback will be called asynchronously
    return true;
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'requestCameraAccess') {
    // Make a request to your server to determine if the user should be granted camera access
    // Assume the server approves access for demonstration purposes
    const isCameraAccessAllowed = true;  // Replace with the actual result from your server

    sendResponse({ allowed: isCameraAccessAllowed });
  }
});
