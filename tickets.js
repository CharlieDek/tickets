const DOTS_LAYER         = 'dots';
const DOTS_SRC           = 'summons';

const CLUSTER_SRC        = 'summonsAgg';
const CLUSTER_LAYER      = 'summons-clusters';
const CLUSTER_COUNT      = 'summons-cluster-count';
const CLUSTER_UNCLUSTERED= 'summons-unclustered';

let aggMode = false;         // current state

/* ---------------- map shell ---------------- */
const map = new maplibregl.Map({
  container : 'map',
  style     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  center    : [-73.97, 40.75],
  zoom      : 10
});
map.addControl(new maplibregl.NavigationControl(), 'top-right');

fetch('data/bike_ebike.geojson')
  .then(r => r.json())
  .then(gj => {

    gj.features = gj.features.filter(f=>{
      const [lng,lat] = f.geometry.coordinates;
      return lng!==0 && lat!==0;
    });

    map.addSource(DOTS_SRC, {type:'geojson', data:gj});

    map.addSource(CLUSTER_SRC,{
      type:'geojson',
      data:gj,
      cluster:true,
      clusterRadius:3,
      clusterMaxZoom:17
    });

    map.addLayer({
      id   : DOTS_LAYER,
      type : 'circle',
      source: DOTS_SRC,
      paint : {
        'circle-radius': [
          'interpolate', ['exponential',1.2], ['zoom'],
           8,2, 11,5, 15,7
        ],
        'circle-color': [
          'match', ['get','veh_category'],
          'BIKE','#ff5500',
          'EBIKE','#0077ff',
          /*else*/'#bbbbbb'
        ],
        'circle-opacity':0.3
      }
    });

    map.addLayer({
      id     : CLUSTER_LAYER,
      type   : 'circle',
      source : CLUSTER_SRC,
      filter : ['has','point_count'],
      layout : { visibility:'none' },
      paint  : {
        'circle-radius': [
          'step',['get','point_count'],
           8, 10,10, 50,14, 100,17, 150,20,  1000, 23, 5000, 26, 10000, 29,   20000, 31
        ],
        'circle-color':'#4f4dad',
        'circle-opacity':0.80
      }
    });

    map.addLayer({
      id     : CLUSTER_COUNT,
      type   : 'symbol',
      source : CLUSTER_SRC,
      filter : ['has','point_count'],
      layout : {
        visibility:'none',
        'text-field':'{point_count_abbreviated}',
        'text-size':10
      },
      paint : { 'text-color':'#ffffff' }
    });

    map.addLayer({
      id     : CLUSTER_UNCLUSTERED,
      type   : 'circle',
      source : CLUSTER_SRC,
      filter : ['!',['has','point_count']],
      layout : { visibility:'none' },
      paint  : {
        'circle-radius':5,
        'circle-color':'#4f4dad',
        'circle-opacity':0.60
      }
    });

    const bounds = new maplibregl.LngLatBounds();
    gj.features.forEach(f=>bounds.extend(f.geometry.coordinates));
    map.fitBounds(bounds,{padding:40,maxZoom:14});
  })
  .catch(err=>console.error('GeoJSON load failed',err));


function applyViolationFilter(){
  if(aggMode) return;

  const selected = Array.from(
    document.querySelectorAll('input[name="violation_code"]:checked')
  ).map(cb=>cb.value);

  if(!map.getLayer(DOTS_LAYER)) return;

  if(selected.length===0){
    map.setLayoutProperty(DOTS_LAYER,'visibility','none');
  }else{
    map.setLayoutProperty(DOTS_LAYER,'visibility','visible');
    map.setFilter(
      DOTS_LAYER,
      ['in',['get','violation_code'],['literal',selected]]
    );
  }
}

const vcBoxes = Array.from(
  document.querySelectorAll('input[name="violation_code"]')
);
const toggleAllBtn = document.getElementById('vc-toggle-all');

vcBoxes.forEach(cb=>{
  cb.addEventListener('change',()=>{
    refreshToggleAllText();
    applyViolationFilter();
  });
});
toggleAllBtn.addEventListener('click',()=>{
  const allChecked = vcBoxes.every(cb=>cb.checked);
  vcBoxes.forEach(cb=>cb.checked=!allChecked);
  refreshToggleAllText();
  applyViolationFilter();
});

function refreshToggleAllText(){
  toggleAllBtn.textContent =
    vcBoxes.every(cb=>cb.checked)?'Deselect all':'Select all';
}
refreshToggleAllText();

const aggToggle = document.getElementById('agg-toggle');
aggToggle.addEventListener('click', () =>setAggregation(!aggMode));

function setAggregation(on){
    aggMode = on;

    map.setLayoutProperty(DOTS_LAYER,           'visibility', on?'none':'visible');
    map.setLayoutProperty(CLUSTER_LAYER,        'visibility', on?'visible':'none');
    map.setLayoutProperty(CLUSTER_COUNT,        'visibility', on?'visible':'none');
    map.setLayoutProperty(CLUSTER_UNCLUSTERED,  'visibility', on?'visible':'none');

    [...vcBoxes,toggleAllBtn].forEach(el=>{ el.disabled=on; });
    if(on){
        vcBoxes.forEach(cb=>cb.checked=true);
    } else {
        applyViolationFilter();
    }
}

document.querySelectorAll('input[name="violation_code"]')
.forEach(cb => cb.addEventListener('change', applyViolationFilter));

const vcCheckboxes = Array.from(
  document.querySelectorAll('input[name="violation_code"]')
);

const filterBtn       = document.getElementById('filter-btn');
const closeFilterBtn  = document.getElementById('close-drawer');
filterBtn     .addEventListener('click', () => document.body.classList.toggle('show-filters'));
closeFilterBtn.addEventListener('click', () => document.body.classList.remove('show-filters'));