//replace the url for the spreadsheet being mapped here
window.onload=function(){
	getSpreadsheet('https://docs.google.com/spreadsheets/d/1e6s_nO97EdWfXkecbURdgOeh8Qkfm7MVtkt9dl_R16M/pubhtml');
}

//all of this is happening asynchronously; the callback is telling Tabletop to build the map using the spreadsheet
function getSpreadsheet(key){
  Tabletop.init( {
    key: key,
    callback: buildMap,
    simpleSheet: true
  });
}

function buildMap(data, tabletop) {

L.mapbox.accessToken = 'pk.eyJ1IjoiY29yZS1naXMiLCJhIjoiaUxqQS1zQSJ9.mDT5nb8l_dWIHzbnOTebcQ';

  // build map
  var map = L.mapbox.map('map', 'mapbox.light').setView([0,0],1);
  map.zoomControl.setPosition('topright');
  map.options.minZoom = 6;
  map.options.maxZoom = 14;
  map.setMaxBounds([
	[43.189158, -130.198975], //southwest map coordinates
    [50.513427, -109.973145] //northeast map coordinates
	])

  var points = L.featureGroup();
  var farm = L.featureGroup();
  var forest = L.featureGroup();

  for(var i=0;i<data.length;i++) {
		console.log(i, data, data[i]);
		var marker = L.marker([parseFloat(data[i].lat), parseFloat(data[i].lng)]);
		var popupInfo = metadata(data[i]);

		//type in your desired dimensions for the markers; the marker will always be square
		var iconDim = 42;
		category = data[i].category.toLowerCase();
		marker.setIcon( L.icon({
			iconUrl: "markers/" + data[i].markerfile,
			iconSize: [iconDim, iconDim],
			iconAnchor: [iconDim/2, iconDim*0.9],
			popupAnchor: [0, 0]
			/*shadowUrl: 'my-icon-shadow.png',
			shadowSize: [68, 95],
			shadowAnchor: [22, 94]*/
		}));
		marker.bindPopup(popupInfo,{'maxWidth':'350','maxHeight':'350','minWidth':'200'});
		points.addLayer(marker);
		console.log(marker, points);
		if (category === "farm") {
			farm.addLayer(marker);
		}
		else if (category === "forest") {
			forest.addLayer(marker);
		}
	}

/* IMPORTANT!
The subheadings in the legend are not controlled by anything in this file.
Instead, they are controlled by CSS rules, using only the order of items to specify where they go.
So any change in the order or number of layers in the legend will need to have a corresponding change made to the CSS file.
To do this, go to:
	css/alternative-voting-style.css
And search for the selectors that include:
	div.leaflet-control-layers-overlays label:nth-child
For each of those, the number in () specifies which legend item they are putting a subheading before.
*/
  var overlayMaps = {
    "<img src='markers/farm.svg' height=24>Farms": farm,
	"<img src='markers/forest.svg' height=24>Forests": forest
  };


  //This is intended to make the legend collapse by default on mobile devices
  //from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
  var windowWidth = 0;

  if( typeof( window.innerWidth ) === 'number' ) {
  windowWidth = window.innerWidth;
} else if( document.documentElement && document.documentElement.clientWidth ) {
  windowWidth = document.documentElement.clientWidth;
} else if( document.body && document.body.clientWidth ) {
  windowWidth = document.body.clientWidth;
}

if (windowWidth < 400) {
  var collapseLegend = true;
} else {
  var collapseLegend = false;
}


// This line adds layers to the _legend_
  L.control.layers(false, overlayMaps, {position: 'bottomleft', collapsed:collapseLegend}).addTo(map);

// This set of lines loads layers to the map
  map.addLayer(farm);
  map.addLayer(forest);


  var bounds = points.getBounds();
  map.fitBounds(bounds, {padding:[30,30]});

  map.setView(map.getCenter());

  map.on('click', function(e) {
    var coords = document.getElementById('coords');
    coords.innerHTML="<p>lat: <strong>" + e.latlng.lat + "</strong>, lng: <strong>" + e.latlng.lng+"</strong>";
  });
}

//add fields here that you do not want displayed in the popupInfo. Must be all lowercase

function metadata(properties) {
  //This is equivalent to the first row of the spreadsheet, these are the field names; field names are called keys
  var obj = Object.keys(properties);
  //This is all of the HTML that goes into the popup
  var info = "";
  for(var p=0; p<obj.length; p++) {
    var prop = obj[p];
    if (prop != 'lng' &&
        prop != 'lat' &&
		prop != 'location_link' &&
		prop != 'category' &&
        prop != 'markerfile' &&
		properties[prop].length > 0) {
      //prop is the field name from the spreadsheet; properties is the geoJSON generated from one row of the spreadsheet
	  //INSTEAD OF PROP, NEED TO WRITE A NEW FUNCTION THAT DOES TEXT SUBSTITUTIONS
	  //get rid of <strong>"+prop+"</strong>: to not show the field names in the popup
	  info += "<p class='"+prop+"'>"+properties[prop]+"</p>";
    }
  }
//console.log(info);
  return info;
}

function showErrors(err) {
  console.log(err);
}
