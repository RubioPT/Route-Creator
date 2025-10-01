🗺️ Route Creator
This project is a feature-rich, map-based tool designed to make geographic route planning and management accessible to everyone. Built using Leaflet.js, it offers a clean, compact interface and powerful, intuitive controls for creating and managing travel routes.

🚀 Key Features
Public Access : Anyone can create, edit, and delete routes without needing an admin password.

Interactive Drawing: Easily add route points (markers) by clicking anywhere on the map. The application automatically calculates and draws the optimal route between the points.

Drag-and-Drop Editing: All markers are draggable, allowing you to instantly modify the route by dragging a waypoint to a new location.

Intuitive Marker Deletion:

Desktop: Right-click on any marker to delete it.

Mobile/Touchscreens: Long-press (hold down) on a marker for about 0.3 seconds to delete it.

Compact User Interface: The Route Management and Route Information panels are consolidated side-by-side, maximizing the map viewing area while maintaining full functionality.

Live Route Information: The interface displays the Total Distance and Point Count for the currently selected route in real-time.

Theme Support: Supports one-click Dark/Light Theme toggling.

🛠️ Setup and How to Run
This project consists of static HTML, CSS, and JavaScript files and requires no server to run.

Download Files: Ensure you have the updated index.html, style.css, and script.js files saved in the same folder.

Open: Simply double-click the index.html file in your browser to launch the application.

Data Persistence: All routes and theme settings are saved locally in your browser's Local Storage, meaning your data will be preserved even after closing the browser.

🧭 How to Use
Site : https://rubiopt.github.io/Route-Creator

Creating a Route
Navigate to the Route Management panel.

Enter a Route Name and select a unique Color.

Click the Add button. The new route will be automatically selected.

Start clicking on the map to add your waypoints.

Editing and Deleting Markers
Modify Route: Click and drag any existing marker to a new location. The route path will instantly recalculate.

Delete Marker (Desktop): Right-click on the marker you wish to remove.

Delete Marker (Mobile/Touch): Long-press (tap and hold) on the marker for a moment.

Route Management
Switch Routes: Use the dropdown menu in the header to switch between your saved routes. The map will only display the selected route.

Delete Route: Use the Delete Route section in the management panel to permanently remove a saved route from your local storage.

Clear All: The Clear All Routes button in the header removes all stored routes and route data at once.

📦 Technologies Used
Leaflet.js: The core JavaScript library for interactive maps.

Leaflet Routing Machine: Used for fetching routing directions and drawing the path (via the OSRM service).

HTML5 / CSS3 / JavaScript: The foundational web technologies.
