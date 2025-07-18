const DOTS_LAYER         = 'dots';
const DOTS_SRC           = 'summons';

const CLUSTER_SRC        = 'summonsAgg';
const CLUSTER_LAYER      = 'summons-clusters';
const CLUSTER_COUNT      = 'summons-cluster-count';
const CLUSTER_UNCLUSTERED= 'summons-unclustered';

const CODE_MAPPING = {"1111D1C": "Bicycle failed to stop at red light", "1111D1E": "E-bike disobeyed red light", "1110AB": "Disobeyed traffic device on bicycle", "403A3IX": "Bike did not yield to pedestrian at red", "12385C": "Operating class three e-bike without a helmet", "12425A": "Unlawful operation or parking of e-bike on sidewalk", "1127AB": "Driving wrong direction on one-way street - bicycle", "403C1B": "Bicycle fail to yld right of way to pedestrian with walk signal", "12426": "E-bike failing to yield right of way to pedestrian", "407C31": "Bike/skate on sidewalk-NYC", "1111A1B": "Bicycle failed to yield right-of-way-green light", "1111A2Z": "Bicycle failed to yield green arrow", "412P1": "Biking off lane", "403C1": "Fail to yld right of way to pedestrian with walk signal", "37524AB": "Oper bicycle with more 1 earphone", "1111D1N": "NYC redlight", "5091": "Unlicensed operator", "1110A": "Disobeyed traffic device - pavement markings", "1232AE": "Improper riding of e-bike", "1238": "No bicycle helmet (some criminal, some not)", "1236B": "No bell or signal device on bicycle", "1234CE": "Failure to stop e-bike before entering roadway", "1111A2X": "Bicycle disobeyed green arrow", "3816": "Unapproved/no protective helmet motorcycle", "1127A": "Driving wrong direction on one-way street", "1236A": "No/inadequate lights-bicycle", "1236DE": "No/reflective tires/reflectors (e-bike)", "1102B": "Bicycle failed to comply with lawful order", "1236BE": "No bell/signal device (e-bike)", "4011A": "Unregistered motor vehicle", "1172A": "Failed to stop at stop sign", "1236AE": "No/inadequate lights (e-bike)", "1234AE": "Failure to keep right (e-bike)", "403A1": "Failed to yield to vehicle/pedestrian- NYC", "1232A": "Improper operation of bicycle", "1237E": "Improper hand and arm signals (e-bike)", "12424": "Unlawful operation of e-bike on any public lands, property or greenway other than highway", "412A1B": "Bicycle failed to comply with order - NYC", "22611": "Unregistered limited use vehicle", "3817": "Unapproved/no face shield/goggles- motorcycle", "1225A": "Driving on sidewalk", "4101": "Unregistered motorcycle", "403A5B": "Bicycle disobeyed stop sign- NYC", "12427": "Failure to operate e-bike in a single file", "4111": "No motorcycle plate", "1236C": "No/inadequate brakes-bicycle", "1236E": "No/improper reflector-bicycle", "124210": "Prohibited use of class 3 e-bike outside of NYC", "124211B": "Operation of e-bike with no/improper manufacturer's label", "412P2": "Drive on bike lane- NYC", "3191U": "Operating without insurance", "1102": "Failed to comply with lawful order", "10231B": "Bicycle careless/negligent operation - tbta", "1236D": "No reflector wheel/bicycle", "12429": "Operation of e-bike at a prohibited speed", "1235": "Carrying articles on bike or skateboard", "403A3II": "Failed to yield to vehicle/pedestrian at red light- NYC", "1232BE": "Too many riders on e-bike", "1236EE": "No/improper reflective devices (e-bike)", "1163D": "Failed to signal lane change", "1232B": "Too many riders - bicycle", "1235E": "Carrying articles on e-bike", "5092": "Operating out of class", "1144AV": "Fail to use due care passing hazard/emergency vehicle", "123810": "No reflector after sunset", "1252B": "Improper passing-motorcycle", "1111D3": "Failed to stop on a steady red arrow", "1225D": "Oper motor vehicle while using portable electronic device", "1163DI": "Improper signal when changing lanes", "403A3I": "Disobeyed steady red light- NYC", "12331E": "Person operating e-bike clinging to vehicle", "1229AB": "Bicycle/pushcart/animal drawn vehicle on expressway", "37524A": "UNKNOWN", "1128C": "Failed to use designated lane", "403A4B": "Bicycle disobeyed colored arrow-NYC", "1225C2A": "Operating motor vehicle while on mobile phone", "1160C": "Improper left turn on one-way roadway", "1144A": "Failed to yield right-of-way to emergency vehicle", "412M": "Improper use of bus lane- NYC", "5092M": "Unlicensed operator motorcycle - lic exp less than 60 days", "409B2": "No lighting equipment- NYC", "1111D1R": "Disobeying a red light on an electric scooter", "407C": "Drive on sidewalk-NYC", "406A1": "Speeding - NYC", 'Bike in park (Summons C)': 'Bike in park (Criminal Summons)', 'Bicycle infraction (Summons C)': 'Bicycle infraction - commercial (Criminal Summons)', 'Bicycle on sidewalk (Summons C)': 'Bicycle on sidewalk (Criminal Summons)', "1234C": "Cyclist failed to stop before entering roadway from curb", "12428": "E-bike improperly above 30mph", "1225C2D": "Using cellphone on highway on e-bike", "3752A1": "No headlamps on e-bike", "4021A": "No or single license plate on e-bike", "5098": "Failed to notify DMV change of address", "22653": "*Unclear - maybe inappropriate parking of e-bike", "4113": "Improper plates motorcycle", "412A3": "Failed to present document- NYC", "1234A": "Failure to keep right (bicycle)", "1111": "Failed to stop at red light (Criminal Summons)", "19-176(B)": "Reckless operation of bicycle (Criminal Summons)", "1-05(I)": "Operating bicycle in reckless manner (Criminal Summons)", "1234(A)": "Bicycle not in a bike lane or in the right hand side of traffic (Criminal Summons)", "1236": "Bicycle - Other (Criminal Summons)", "408E5": "Stop in crosswalk NYC", "412A1": "Failed to comply with order NYC"};

// console.log({'1111': 3727, 'Bicycle infraction (Summons C)': 728, 'Bicycle on sidewalk (Summons C)': 888, '19-176(B)': 169, '1-05(I)': 19, 'Bike in park (Summons C)': 7, '1238': 30, '1234(A)': 10, '1236': 11});

const COLOR_MAPPING = {
  'orange': '#ff5500',
  'blue': '#0077ff',
  'pink': '#ff1493'
};

let aggMode = false;
let geoJsonData = null;

const filterState = {
  violation_code: new Set(),
  month_of_year: new Set(),
  pinkslip: new Set([true, false])
};

const map = new maplibregl.Map({
    container : 'map',
    style     : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    center    : [-73.97, 40.75],
    zoom      : 10
});

map.addControl(new maplibregl.NavigationControl(), 'top-right');  
map.once('load', loadTickets);

function loadTickets() {
    fetch('data/combined_bike_ebike.geojson')
    .then(r => r.json())
    .then(gj => {
        geoJsonData = gj;

        gj.features = gj.features.filter(f=>{
            const [lng,lat] = f.geometry.coordinates;
            return lng!==0 && lat!==0;
        });

        initializeFilters(gj);

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
                    'match', ['get','color_coding'],
                    'orange', COLOR_MAPPING.orange,
                    'blue', COLOR_MAPPING.blue,
                    'pink', COLOR_MAPPING.pink,
                    /*else*/'#bbbbbb'
                ],
                'circle-opacity':0.17
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

function initializeFilters(gj) {
    const violationCodes = new Set();
    const hours = new Set();
    const months = new Set();
    
    gj.features.forEach(f => {
        violationCodes.add(f.properties.violation_code);
        months.add(f.properties.month_of_year);
    });
    
    filterState.violation_code = violationCodes;
    filterState.month_of_year = months;
}

function applyAllFilters() {
    if(aggMode || !map.getLayer(DOTS_LAYER)) return;

    const hasEmptyFilter = 
        filterState.violation_code.size === 0 ||
        filterState.month_of_year.size === 0 ||
        filterState.pinkslip.size === 0;

    if(hasEmptyFilter) {
        map.setLayoutProperty(DOTS_LAYER, 'visibility', 'none');
        return;
    }

    const filters = ['all'];
    
    filters.push(['in', ['get', 'violation_code'], ['literal', Array.from(filterState.violation_code)]]);
    filters.push(['in', ['to-string', ['get', 'month_of_year']], ['literal', Array.from(filterState.month_of_year).map(String)]]);
    
    if(filterState.pinkslip.size === 2) {
    } else if(filterState.pinkslip.size === 1) {
        const showPinkslip = filterState.pinkslip.has(true);
        filters.push(['==', ['get', 'pinkslip'], showPinkslip]);
    }
    
    map.setLayoutProperty(DOTS_LAYER, 'visibility', 'visible');
    map.setFilter(DOTS_LAYER, filters);
}

function updateFilter(filterType, value, checked) {
    if(checked) {
        filterState[filterType].add(value);
    } else {
        filterState[filterType].delete(value);
    }
    applyAllFilters();
}

document.addEventListener('DOMContentLoaded', () => {
    const vcBoxes = Array.from(document.querySelectorAll('input[name="violation_code"]'));
    const toggleAllBtn = document.getElementById('vc-toggle-all');

    vcBoxes.forEach(cb => {
        cb.addEventListener('change', () => {
            updateFilter('violation_code', cb.value, cb.checked);
            refreshViolationCodeToggle();
        });
    });

    toggleAllBtn.addEventListener('click', () => {
        const allChecked = vcBoxes.every(cb => cb.checked);
        vcBoxes.forEach(cb => {
            cb.checked = !allChecked;
            updateFilter('violation_code', cb.value, cb.checked);
        });
        refreshViolationCodeToggle();
    });

    function refreshViolationCodeToggle() {
        toggleAllBtn.textContent = vcBoxes.every(cb => cb.checked) ? 'Deselect all' : 'Select all';
    }
    refreshViolationCodeToggle();

    setupFilterListeners();
});

function setupFilterListeners() {
    document.querySelectorAll('input[name="month_of_year"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateFilter('month_of_year', cb.value, cb.checked);
        });
    });
    
    document.querySelectorAll('input[name="pinkslip"]').forEach(cb => {
        cb.addEventListener('change', () => {
            updateFilter('pinkslip', cb.value === 'true', cb.checked);
        });
    });
    
    document.getElementById('month-toggle-all')?.addEventListener('click', () => {
        console.log("toggle month...");
        const monthBoxes = Array.from(document.querySelectorAll('input[name="month_of_year"]'));
        const allChecked = monthBoxes.every(cb => cb.checked);
        monthBoxes.forEach(cb => {
            cb.checked = !allChecked;
            updateFilter('month_of_year', cb.value, cb.checked);
        });
        document.getElementById('month-toggle-all').textContent = allChecked ? 'Select all' : 'Deselect all';
    });
}

function setAggregation(on) {
    aggMode = on;

    map.setLayoutProperty(DOTS_LAYER,           'visibility', on?'none':'visible');
    map.setLayoutProperty(CLUSTER_LAYER,        'visibility', on?'visible':'none');
    map.setLayoutProperty(CLUSTER_COUNT,        'visibility', on?'visible':'none');
    map.setLayoutProperty(CLUSTER_UNCLUSTERED,  'visibility', on?'visible':'none');

    document.querySelectorAll('input[type="checkbox"], .toggle-all').forEach(el => {
        el.disabled = on;
    });
    
    if(!on) {
        applyAllFilters();
    }
}

const filterBtn       = document.getElementById('filter-btn');
const closeFilterBtn  = document.getElementById('close-drawer');
filterBtn.addEventListener('click', () => document.body.classList.toggle('show-filters'));
closeFilterBtn.addEventListener('click', () => document.body.classList.remove('show-filters'));

addHoverPopups();

function addHoverPopups() {
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
            
            const ticketCount = stack.length;
            const ticketWord = ticketCount === 1 ? 'Ticket' : 'Tickets';
            const title = `<div style="font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 4px;">${ticketCount} ${ticketWord}</div>`;
            
            const ticketList = stack.map(f => `
                <div>
                    <b>${f.properties.violation_date} ${f.properties.violation_time}</b><br>
                    ${CODE_MAPPING[f.properties.violation_code]}<br>
                </div>`).join('');
            
            const html = title + ticketList;
            popup.setLngLat(coordinates).setHTML(html).addTo(map);
        });
      
        map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    });
}