(function () {
  'use strict';

  // Admin şifresi kaldırıldı.
  const STORAGE = {
    hats: 'hats',
    routes: 'routes',
    theme: 'theme'
  };

  let hatlar = [];
  const rotalar = {};
  let holdTimer; // Mobile long press timer

  // Map centered on Turkey (Ankara, Zoom 6)
  const map = L.map('map').setView([39.9334, 32.8597], 6);
  const tileLayers = {
    OSM: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }),
    Carto: L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© CartoDB' }),
    Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' })
  };
  tileLayers.OSM.addTo(map);

  const hatSelect = document.getElementById('hatSelect');
  const hatNameEl = document.getElementById('hatName');
  const pointCountEl = document.getElementById('pointCount');
  const totalDistanceEl = document.getElementById('totalDistance');
  const themeBtn = document.getElementById('themeToggleBtn');
  const layerSelect = document.getElementById('layerSelect');
  const locateBtn = document.getElementById('locateBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  // Yeni menü elementleri
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const menuContainer = document.getElementById('menuContainer');

  init();

  function init() {
    loadTheme();
    loadHats();
    loadRoutes();
    renderHatSelect();
    setupControls();
    updateInfo(hatSelect.value);
  }

  function setupControls() {
    hatSelect.onchange = () => {
      const id = hatSelect.value;
      if (rotalar[id]) showRoute(id);
      updateInfo(id);
    };

    themeBtn.onclick = toggleTheme;

    layerSelect.onchange = () => {
      for (let key in tileLayers) map.removeLayer(tileLayers[key]);
      tileLayers[layerSelect.value].addTo(map);
    };

    locateBtn.onclick = () => {
      map.locate({ setView: true, maxZoom: 15 });
    };

    map.on('locationfound', e => {
      L.marker(e.latlng).addTo(map).bindPopup('Your Location').openPopup();
    });

    fullscreenBtn.onclick = () => {
      document.body.classList.toggle('fullscreen');
    };

    // Add route point on map click
    map.on('click', e => {
      const id = hatSelect.value;
      if (!id) return alert('Please select a Route first or add a new one.');
      addPoint(id, e.latlng);
    });

    // Clear all routes
    document.querySelector('button[onclick="clearRoutes()"]').onclick = () => {
      if (!confirm('Are you sure you want to clear ALL routes? This action cannot be undone.')) return;
      Object.keys(rotalar).forEach(id => {
        if (rotalar[id].control) map.removeControl(rotalar[id].control);
        rotalar[id] = { points: [], control: null };
      });
      localStorage.removeItem(STORAGE.routes);
      hatSelect.value = '';
      updateInfo(null);
    };

    // Modal show/close
    window.showModal = id => document.getElementById(id)?.classList.remove('hidden');
    window.closeModal = id => document.getElementById(id)?.classList.add('hidden');

    renderRotaManager();
    setupMenuToggle(); // Yeni menü toggle işlevini çağır
  }
  
  // Yeni Menü Toggle İşlevi
  function setupMenuToggle() {
    if (menuToggleBtn && menuContainer) {
        menuToggleBtn.onclick = () => {
            menuContainer.classList.toggle('open');
            // Buton metnini de değiştirir
            if (menuContainer.classList.contains('open')) {
                menuToggleBtn.textContent = '✖ Close';
            } else {
                menuToggleBtn.textContent = '☰ Menu';
            }
        };
    }
  }


  function loadTheme() {
    const theme = localStorage.getItem(STORAGE.theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      themeBtn.textContent = 'Light Theme';
    }
  }

  function toggleTheme() {
    const dark = document.body.classList.toggle('dark-mode');
    themeBtn.textContent = dark ? 'Light Theme' : 'Dark Theme';
    localStorage.setItem(STORAGE.theme, dark ? 'dark' : 'light');
  }

  function loadHats() {
    const raw = localStorage.getItem(STORAGE.hats);
    hatlar = raw ? JSON.parse(raw) : [];
  }

  function saveHats() {
    localStorage.setItem(STORAGE.hats, JSON.stringify(hatlar));
  }

  function renderHatSelect() {
    const currentId = hatSelect.value;
    hatSelect.innerHTML = '<option value="">Select Route</option>';
    hatlar.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h.id;
      opt.textContent = h.name;
      hatSelect.appendChild(opt);
    });
    if (hatlar.some(h => h.id === currentId)) {
        hatSelect.value = currentId;
    }
  }

  function renderRotaManager() {
    const removeSel = document.getElementById('removeHatSelect');
    removeSel.innerHTML = '<option value="">Select Route</option>';
    hatlar.forEach(h => {
      removeSel.appendChild(new Option(h.name, h.id));
    });

    document.getElementById('addHatBtn').onclick = () => {
      const name = document.getElementById('newHatName').value.trim();
      const color = document.getElementById('newHatColor').value;
      if (!name) return alert('Please enter a name');
      const id = name.toLowerCase().replace(/\s+/g, '-');
      hatlar.push({ id, name, color });
      saveHats();
      renderHatSelect();
      renderRotaManager();
      hatSelect.value = id;
      hatSelect.dispatchEvent(new Event('change'));
    };

    document.getElementById('removeHatBtn').onclick = () => {
      const id = removeSel.value;
      if (!id) return;
      
      if (!confirm(`Are you sure you want to delete route "${hatlar.find(h => h.id === id)?.name || id}"?`)) return;

      if (rotalar[id] && rotalar[id].control) {
        map.removeControl(rotalar[id].control);
      }
      
      hatlar = hatlar.filter(h => h.id !== id);
      delete rotalar[id];
      saveHats();
      localStorage.removeItem(STORAGE.routes); 
      
      if (hatSelect.value === id) {
          hatSelect.value = '';
          updateInfo(null);
      }

      renderHatSelect();
      renderRotaManager();
    };
  }

  function loadRoutes() {
    const raw = localStorage.getItem(STORAGE.routes);
    if (!raw) return;
    const data = JSON.parse(raw);
    for (let id in data) {
      const points = data[id].map(p => L.latLng(p.lat, p.lng));
      const control = createRoute(id, points);
      rotalar[id] = { points, control };
    }
  }

  function saveRoutes() {
    const out = {};
    for (let id in rotalar) {
      const pts = rotalar[id].points;
      if (pts.length) {
        out[id] = pts.map(p => ({ lat: p.lat, lng: p.lng }));
      }
    }
    localStorage.setItem(STORAGE.routes, JSON.stringify(out));
  }

  // Delete marker function (used by right-click and long-press)
  function deleteMarker(id, i) {
    if (!rotalar[id]) return;
    
    // 1. Delete the point
    rotalar[id].points.splice(i, 1);
    
    // 2. Remove control
    if (rotalar[id].control) map.removeControl(rotalar[id].control);
    
    // 3. Recreate the route
    if (rotalar[id].points.length > 0) {
        rotalar[id].control = createRoute(id, rotalar[id].points).addTo(map);
    } else {
        rotalar[id].control = null;
        delete rotalar[id];
        // If route is empty, also remove from the list of hats
        hatlar = hatlar.filter(h => h.id !== id);
        saveHats();
        
        // If the deleted route was selected, clear selection and info
        if (hatSelect.value === id) {
             hatSelect.value = ''; 
        }
        renderHatSelect(); 
    }
    
    // 4. Update info and save
    updateInfo(hatSelect.value); 
    saveRoutes();
  }

  function createRoute(id, points) {
    const color = (hatlar.find(h => h.id === id) || {}).color || 'blue';
    return L.Routing.control({
      waypoints: points,
      lineOptions: { styles: [{ color, weight: 5 }] },
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: true,
      createMarker: (i, wp) => {
        const marker = L.marker(wp.latLng, { draggable: true });

        // Update route on drag end
        marker.on('dragend', (e) => {
          rotalar[id].points[i] = e.target.getLatLng();
          if (rotalar[id].control) map.removeControl(rotalar[id].control);
          rotalar[id].control = createRoute(id, rotalar[id].points).addTo(map);
          updateInfo(hatSelect.value);
          saveRoutes();
        });

        // Desktop: Delete on right-click
        marker.on('contextmenu', (e) => {
          e.originalEvent.preventDefault(); 
          deleteMarker(id, i);
        });
        
        // Mobile: Delete on long press (300ms)
        marker.on('touchstart', (e) => {
          if (e.originalEvent.touches.length > 1) return;
          holdTimer = setTimeout(() => {
            deleteMarker(id, i);
            holdTimer = null; 
          }, 300); 
        });
        marker.on('touchend touchcancel', () => {
          if (holdTimer) clearTimeout(holdTimer);
        });
        
        return marker;
      },
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' })
    }).addTo(map);
  }
function createRoute(id, points) {
    const color = (hatlar.find(h => h.id === id) || {}).color || 'blue';
    return L.Routing.control({
      waypoints: points,
      lineOptions: { styles: [{ color, weight: 5 }] },
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: true,
      
      // *** YENİ EKLENEN KISIM: ***
      // Talimatlar panelini açılır/kapanır hale getirir
      collapsible: true, 
      // Panel varsayılan olarak kapalı başlasın
      collapsed: true,
      // Panel açılırken ve kapanırken bir animasyon ekler
      // useSummary: true, 
      // *** YENİ EKLENEN KISIM SONU ***

      createMarker: (i, wp) => {
        const marker = L.marker(wp.latLng, { draggable: true });

        // Update route on drag end
        marker.on('dragend', (e) => {
          rotalar[id].points[i] = e.target.getLatLng();
          if (rotalar[id].control) map.removeControl(rotalar[id].control);
          rotalar[id].control = createRoute(id, rotalar[id].points).addTo(map);
          updateInfo(hatSelect.value);
          saveRoutes();
        });

        // Desktop: Delete on right-click
        marker.on('contextmenu', (e) => {
          e.originalEvent.preventDefault(); 
          deleteMarker(id, i);
        });
        
        // Mobile: Delete on long press (300ms)
        marker.on('touchstart', (e) => {
          if (e.originalEvent.touches.length > 1) return;
          holdTimer = setTimeout(() => {
            deleteMarker(id, i);
            holdTimer = null; 
          }, 300); 
        });
        marker.on('touchend touchcancel', () => {
          if (holdTimer) clearTimeout(holdTimer);
        });
        
        return marker;
      },
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' })
    }).addTo(map);
  }
   function addPoint(id, latlng) {
    if (!rotalar[id]) rotalar[id] = { points: [], control: null };
    rotalar[id].points.push(latlng);

    if (rotalar[id].control) {
      map.removeControl(rotalar[id].control);
    }

    rotalar[id].control = createRoute(id, rotalar[id].points);
    updateInfo(id);
    saveRoutes();
  }

  function showRoute(id) {
    for (let key in rotalar) {
      if (rotalar[key].control) {
        map.removeControl(rotalar[key].control);
      }
    }
    const points = rotalar[id].points;
    if (points.length > 0) {
        rotalar[id].control = createRoute(id, points);
    } else {
         rotalar[id].control = null;
    }
  }

  function updateInfo(id) {
    const currentId = id || hatSelect.value;

    if (!currentId || !rotalar[currentId]) {
      hatNameEl.textContent = hatlar.find(h => h.id === currentId)?.name || 'None';
      pointCountEl.textContent = '0';
      totalDistanceEl.textContent = '0 km';
      return;
    }

    const hat = hatlar.find(h => h.id === currentId);
    const points = rotalar[currentId].points;

    hatNameEl.textContent = hat?.name || 'Unknown';
    pointCountEl.textContent = points.length;

    let total = 0;
    for (let i = 1; i < points.length; i++) {
      total += map.distance(points[i - 1], points[i]);
    }

    totalDistanceEl.textContent = (total / 1000).toFixed(2) + ' km';
  }
})();
