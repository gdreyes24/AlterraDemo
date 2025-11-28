// GitHub Pages absolute base path
const BASE = "https://gdreyes24.github.io/AlterraDemo";

// ---- MAP SETUP ----
const map = L.map('map').setView([0, 0], 3);

// Add a base layer (optional)
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 22
}).addTo(map);


// ---- LOAD WORLD FILE ----
// Reads JGW/JPW file to obtain geotransform
async function loadWorldFile(url) {
    const response = await fetch(url);
    const text = await response.text();

    const lines = text.trim().split(/\r?\n/).map(Number);

    // World file structure:
    // 0: pixel size x
    // 3: pixel size y (negative)
    // 4: upper-left X
    // 5: upper-left Y

    return {
        pixelX: lines[0],
        pixelY: lines[3],
        originX: lines[4],
        originY: lines[5]
    };
}


// ---- LOAD THE OVERLAY ----
async function addOverlay() {
    const world = await loadWorldFile(`${BASE}/overlay.jgw`);

    const img = new Image();
    img.src = `${BASE}/overlay.jpeg`;

    img.onload = function () {
        const width = img.width * world.pixelX;
        const height = Math.abs(img.height * world.pixelY);

        // Calculate bounding box of the georeferenced raster
        const southWest = [world.originY - height, world.originX];
        const northEast = [world.originY, world.originX + width];
        const bounds = [southWest, northEast];

        L.imageOverlay(img.src, bounds).addTo(map);
        map.fitBounds(bounds);
    };
}

addOverlay();


// ---- LOAD PALM CSV ----
async function loadPalmCSV() {
    const response = await fetch(`${BASE}/palms.csv`);

    if (!response.ok) {
        console.error("Failed to fetch palms.csv");
        return;
    }

    const text = await response.text();
    const rows = text.split(/\r?\n/);

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;

        const [id, lat, lon] = row.split(",");

        L.circleMarker([parseFloat(lat), parseFloat(lon)], {
            radius: 4,
            color: "red"
        }).addTo(map).bindPopup(`Palm ID: ${id}`);
    }
}

loadPalmCSV();
