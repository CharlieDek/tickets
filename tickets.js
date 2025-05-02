const map = new maplibregl.Map({
    container : 'map',
    style     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center    : [-73.97, 40.75],   // Midtown default
    zoom      : 10
  });
  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  
  fetch('data/bike_ebike.geojson')
    .then(r => r.json())
    .then(gj => {
        gj.features = gj.features.filter(f =>
            f.geometry &&
            f.geometry.coordinates[0] !== 0 &&
            f.geometry.coordinates[1] !== 0 );
  
        map.addSource('summons', { type:'geojson', data: gj });
  
        map.addLayer({
            id    : 'dots',
            type  : 'circle',
            source: 'summons',
            paint : {
              'circle-radius' : 4,
              // orange for BIKE, blue for EBIKE, grey fallback
              'circle-color'  : [
                'match',
                ['get', 'veh_category'],
                'BIKE',  '#ff5500',
                'EBIKE', '#0077ff',
                '#bbbbbb'
              ],
              'circle-opacity': 0.3
            }
          });
  
        const bounds = new maplibregl.LngLatBounds();
        gj.features.forEach(f => bounds.extend(f.geometry.coordinates));
        map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
    })
    .catch(err => console.error('Could not load GeoJSON:', err));


// ----  FILTER UI  ----------------------------------------------------------
// 1. Collect unique violation codes
const codes = [...new Set(gj.features.map(f => f.properties.violation_code))].sort();

// 2. Add a checkbox for each one
const panel = document.getElementById('filter-panel');
codes.forEach(code => {
  const lbl = document.createElement('label');
  lbl.innerHTML = `<input type="checkbox" value="${code}" checked> ${code}`;
  panel.appendChild(lbl);
});

// 3. Function that (re)applies the MapLibre filter
function applyFilter(){
  const chosen = [...panel.querySelectorAll('input:checked')]
                   .map(cb => cb.value);

  if (chosen.length === 0){
    // nothing selected → hide layer completely
    map.setLayoutProperty('dots', 'visibility', 'none');
  } else {
    map.setLayoutProperty('dots', 'visibility', 'visible');
    map.setFilter('dots', [
      'in', ['get', 'violation_code'],
      ['literal', chosen]              // dynamic list → fast!
    ]);
  }
}

// 4. Wire all checkboxes
panel.addEventListener('change', applyFilter);
applyFilter();                         // run once on load

// ----  DRAWER BEHAVIOUR  ---------------------------------------------------
const btn   = document.getElementById('filter-btn');
const close = document.getElementById('close-drawer');

btn  .addEventListener('click', () => document.body.classList.toggle('show-filters'));
close.addEventListener('click', () => document.body.classList.remove('show-filters'));
