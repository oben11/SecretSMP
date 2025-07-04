document.addEventListener('DOMContentLoaded', function() {
    // Get references to the HTML elements
    const toggleButton = document.getElementById('toggleButton');
    const overlay = document.getElementById('overlay');

    /**
     * Toggles the 'active' class on the overlay element.
     * This function is used by both buttons to either show or hide the overlay.
     */
    function toggleOverlay() {
        overlay.classList.toggle('in');
    }

    const redirectDelaySeconds = 1; // Change this value to configure the delay

    // Delay before executing the code for channel.html
    if (window.location.pathname.endsWith('channel.html')) {
        setTimeout(() => {
            overlay.classList.toggle('in');
        }, redirectDelaySeconds * 1000);
    }

    // Add click event listener to the main toggle button
    if (toggleButton) {
        toggleButton.addEventListener('click', function() {
            toggleOverlay();
            setTimeout(() => {
                window.location.href = 'channel.html';
            }, redirectDelaySeconds * 1000);
        });
    }

    // Add click event listener to the close button inside the overlay
});
