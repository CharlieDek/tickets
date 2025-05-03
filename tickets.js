const DOTS_LAYER         = 'dots';
const DOTS_SRC           = 'summons';

const CLUSTER_SRC        = 'summonsAgg';
const CLUSTER_LAYER      = 'summons-clusters';
const CLUSTER_COUNT      = 'summons-cluster-count';
const CLUSTER_UNCLUSTERED= 'summons-unclustered';
const CODE_MAPPING = {"1111D1C": "Bicycle failed to stop at red light", "1111D1E": "E-bike disobeyed red light", "1110AB": "Disobeyed traffic device on bicycle", "403A3IX": "Bike did not yield to pedestrian at red", "12385C": "Operating class three e-bike without a helmet", "12425A": "Unlawful operation or parking of e-bike on sidewalk", "1127AB": "Driving wrong direction on one-way street - bicycle", "403C1B": "Bicycle fail to yld right of way to pedestrian with walk signal", "12426": "E-bike failing to yield right of way to pedestrian", "407C31": "Bike/skate on sidewalk-NYC", "1111A1B": "Bicycle failed to yield right-of-way-green light", "1111A2Z": "Bicycle failed to yield green arrow", "412P1": "Biking off lane", "403C1": "Fail to yld right of way to pedestrian with walk signal", "37524AB": "Oper bicycle with more 1 earphone", "1111D1N": "NYC redlight", "5091": "Unlicensed operator", "1110A": "Disobeyed traffic device - pavement markings", "1232AE": "Improper riding of e-bike", "1238": "No child bicycle helmet", "1236B": "No bell or signal device on bicycle", "1234CE": "Failure to stop e-bike before entering roadway", "1111A2X": "Bicycle disobeyed green arrow", "3816": "Unapproved/no protective helmet motorcycle", "1127A": "Driving wrong direction on one-way street", "1236A": "No/inadequate lights-bicycle", "1236DE": "No/reflective tires/reflectors (e-bike)", "1102B": "Bicycle failed to comply with lawful order", "1236BE": "No bell/signal device (e-bike)", "4011A": "Unregistered motor vehicle", "1172A": "Failed to stop at stop sign", "1236AE": "No/inadequate lights (e-bike)", "1234AE": "Failure to keep right (e-bike)", "403A1": "Failed to yield to vehicle/pedestrian- NYC", "1232A": "Improper operation of bicycle", "1237E": "Improper hand and arm signals (e-bike)", "12424": "Unlawful operation of e-bike on any public lands, property or greenway other than highway", "412A1B": "Bicycle failed to comply with order - NYC", "22611": "Unregistered limited use vehicle", "3817": "Unapproved/no face shield/goggles- motorcycle", "1225A": "Driving on sidewalk", "4101": "Unregistered motorcycle", "403A5B": "Bicycle disobeyed stop sign- NYC", "12427": "Failure to operate e-bike in a single file", "4111": "No motorcycle plate", "1236C": "No/inadequate brakes-bicycle", "1236E": "No/improper reflector-bicycle", "124210": "Prohibited use of class 3 e-bike outside of NYC", "124211B": "Operation of e-bike with no/improper manufacturer's label", "412P2": "Drive on bike lane- NYC", "3191U": "Operating without insurance", "1102": "Failed to comply with lawful order", "10231B": "Bicycle careless/negligent operation - tbta", "1236D": "No reflector wheel/bicycle", "12429": "Operation of e-bike at a prohibited speed", "1235": "Carrying articles on bike or skateboard", "403A3II": "Failed to yield to vehicle/pedestrian at red light- NYC", "1232BE": "Too many riders on e-bike", "1236EE": "No/improper reflective devices (e-bike)", "1163D": "Failed to signal lane change", "1232B": "Too many riders - bicycle", "1235E": "Carrying articles on e-bike", "5092": "Operating out of class", "1144AV": "Fail to use due care passing hazard/emergency vehicle", "123810": "No reflector after sunset", "1252B": "Improper passing-motorcycle", "1111D3": "Failed to stop on a steady red arrow", "1225D": "Oper motor vehicle while using portable electronic device", "1163DI": "Improper signal when changing lanes", "403A3I": "Disobeyed steady red light- NYC", "12331E": "Person operating e-bike clinging to vehicle", "1229AB": "Bicycle/pushcart/animal drawn vehicle on expressway", "37524A": "UNKNOWN", "1128C": "Failed to use designated lane", "403A4B": "Bicycle disobeyed colored arrow-NYC", "1225C2A": "Operating motor vehicle while on mobile phone", "1160C": "Improper left turn on one-way roadway", "1144A": "Failed to yield right-of-way to emergency vehicle", "412M": "Improper use of bus lane- NYC", "5092M": "Unlicensed operator motorcycle - lic exp less than 60 days", "409B2": "No lighting equipment- NYC", "1111D1R": "Disobeying a red light on an electric scooter", "407C": "Drive on sidewalk-NYC", "406A1": "Speeding - NYC"};

let aggMode = false;         // current state

const map = new maplibregl.Map({
    container : 'map',
    style     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center    : [-73.97, 40.75],
    zoom      : 10
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');  
map.once('load', loadTickets);

function loadTickets() {
    fetch('data/bike_ebike.geojson')
    .then(r => r.json())
    .then(gj => {

        // clean
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
}

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
    refreshViolationCodeToggle();
    applyViolationFilter();
  });
});
toggleAllBtn.addEventListener('click',()=>{
  const allChecked = vcBoxes.every(cb=>cb.checked);
  vcBoxes.forEach(cb=>cb.checked=!allChecked);
  refreshViolationCodeToggle();
  applyViolationFilter();
});

function refreshViolationCodeToggle(){
  toggleAllBtn.textContent =
    vcBoxes.every(cb=>cb.checked)?'Deselect all':'Select all';
}
refreshViolationCodeToggle();

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


addHoverPopups();

function addHoverPopups () {
    const popup = new maplibregl.Popup({ closeButton:false, closeOnClick:false, offset:10 });
  
    const POINT_LAYERS = [DOTS_LAYER, CLUSTER_UNCLUSTERED];
  
    POINT_LAYERS.forEach(layerId => {
      map.on('mouseenter', layerId, e => {
        map.getCanvas().style.cursor = 'pointer';
  
        const features = map.queryRenderedFeatures(
          [[e.point.x - 1, e.point.y - 1], [e.point.x + 1, e.point.y + 1]],
          { layers:[layerId] }
        );
  
        const { coordinates } = e.features[0].geometry;
        const stack = features.filter(f =>
          f.geometry.coordinates[0] === coordinates[0] &&
          f.geometry.coordinates[1] === coordinates[1]
        );
  
        stack.sort((a,b) =>
          new Date(b.properties.violation_date) -
          new Date(a.properties.violation_date)
        );
  
        const html = stack.map(f => `
         <div>
           <b>${f.properties.violation_date} ${f.properties.violation_time}</b><br>
           ${CODE_MAPPING[f.properties.violation_code]}
         </div>`).join('');
  
        popup.setLngLat(coordinates).setHTML(html).addTo(map);
      });
  
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popup.remove();
      });
    });
  }