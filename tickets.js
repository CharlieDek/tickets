let map, summonsLayerId = 'dots';

map = new maplibregl.Map({
  container : 'map',
  style     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center    : [-73.97, 40.75],
  zoom      : 10
});
map.addControl(new maplibregl.NavigationControl(), 'top-right');

// -----------------------------------------------------------
// Fetch GeoJSON and build
// -----------------------------------------------------------
fetch('data/bike_ebike.geojson')
  .then(r => r.json())
  .then(gj => {
    // drop bad points
    gj.features = gj.features.filter(f => {
      const [lng, lat] = f.geometry.coordinates;
      return lng !== 0 && lat !== 0;
    });

    map.addSource('summons', { type:'geojson', data: gj });

    map.addLayer({
      id    : summonsLayerId,
      type  : 'circle',
      source: 'summons',
      paint : {
        'circle-radius' : 4,
        'circle-color'  : [
          'match',
          ['get', 'veh_category'],
          'BIKE',  '#ff5500',
          'EBIKE', '#0077ff',
          /* else */ '#bbbbbb'
        ],
        'circle-opacity': 0.3
      }
    });

    // fit to points
    const bounds = new maplibregl.LngLatBounds();
    gj.features.forEach(f => bounds.extend(f.geometry.coordinates));
    map.fitBounds(bounds, { padding: 40, maxZoom: 14 });

    // build the filters UI
  })
  .catch(err => console.error('Could not load GeoJSON:', err));


/*  Put your own human‑readable labels here  */
const VIOLATION_CODE_DESCRIPTIONS = {
    '403A3IX': 'Riding on sidewalk',
    '402B1'  : 'No bell / horn',
    // …etc
  };


function applyViolationFilter() {
    // grab all currently‑checked codes
    const selected = Array.from(
        document.querySelectorAll('input[name="violation_code"]:checked')
    ).map(cb => cb.value);

    if (!map.getLayer(summonsLayerId)) return;          // safety guard

    if (selected.length === 0) {
        // no codes selected → hide the layer entirely
        map.setLayoutProperty(summonsLayerId, 'visibility', 'none');
    } else {
        map.setLayoutProperty(summonsLayerId, 'visibility', 'visible');
        map.setFilter(
        summonsLayerId,
        ['in', ['get', 'violation_code'], ['literal', selected]]
        );
    }
}

document.querySelectorAll('input[name="violation_code"]')
.forEach(cb => cb.addEventListener('change', applyViolationFilter));

const toggleAllBtn = document.getElementById('vc-toggle-all');
const vcCheckboxes = Array.from(
  document.querySelectorAll('input[name="violation_code"]')
);

function updateToggleAllText() {
  const allChecked = vcCheckboxes.every(cb => cb.checked);
  toggleAllBtn.textContent = allChecked ? 'Deselect all' : 'Select all';
}

toggleAllBtn.addEventListener('click', () => {
  const allChecked = vcCheckboxes.every(cb => cb.checked);
  vcCheckboxes.forEach(cb => { cb.checked = !allChecked; });
  updateToggleAllText();        // keep label in sync
  applyViolationFilter();       // refresh the map
});

vcCheckboxes.forEach(cb =>
  cb.addEventListener('change', updateToggleAllText)
);

/* run once at start */
updateToggleAllText();

const filterBtn       = document.getElementById('filter-btn');
const closeFilterBtn  = document.getElementById('close-drawer');
filterBtn     .addEventListener('click', () => document.body.classList.toggle('show-filters'));
closeFilterBtn.addEventListener('click', () => document.body.classList.remove('show-filters'));
