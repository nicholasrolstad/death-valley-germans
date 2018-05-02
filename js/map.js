// JS FOR DEATH VALLEY GERMANS PROJECT - NICHOLAS ROLSTAD

//function to initiate map
function initiateMap(){
	
	//load custom basemap
	var base = L.tileLayer('https://api.mapbox.com/styles/v1/midwestcoast/cjeuv6hb90qij2sqonx9f0bnm/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWlkd2VzdGNvYXN0IiwiYSI6ImNpd3F6djN5ZTAxY3Yyb3BmM2Z4dzlrd2UifQ.ad4-hQvgRhK2ETritdMAYw', {id: 'MapID', attribution: '&copy; ' + '<a href="https://www.mapbox.com/">Mapbox</a>' + ' | <a href="">Tom Mahood\'s OtherHand.org</a> |' +' <a href="https://nicholasrolstad.github.io/">Nicholas Rolstad 2018</a>'})
	
	//function to add pop-ups to 
	function onEachFeature(feature, layer) {
		// if feature doesn't have an image link, add text only
		if (feature.properties.image == "none") {
			layer.bindPopup("<span class=\'popup-text\'>" + feature.properties.text + "</span>");
		// if it has an image link, add the image and then text
		} else {
			layer.bindPopup("<img class=\'popup-img\' src=\'img/" + feature.properties.image + ".jpg\'><br><br><span class=\'popup-text\'>" + feature.properties.text + "</span>");
		}
	}
	
	// initialize index (chapter) of story
	var index = 0
	

    //create the map
	var map = L.map('map', {
		center: [36.321, -116.889],
		zoom: 11,
		minZoom: 8,
		inertia: false,
		layers: [base]
	});
	
	// add scale to map
	L.control.scale({maxWidth: 300}).addTo(map);
	
	//set initial text
	$(".story").html(window['title0'] + window['chapter0']);
	map.zoomControl.setPosition('topright');
	
	// prevent map from zooming/panning while interacting with buttons
	$("button").on('mousedown dblclick pointerdown', function(e){
		L.DomEvent.stopPropagation(e);
	});
	
	// when forward control is clicked, update index/route/story
	$( "#forward" ).click(function() {
		indexControl(1);
		updateRoute();
		updateStory();
	});
	
	// when reverse control is clicked, update index/route/story
	$( "#reverse" ).click(function() {
		indexControl(-1);
	  	updateRoute();
		updateStory();
	});
	
	// updates the index value | limits index to values between 0-7
	function indexControl(val) {
		index += val;
		if (index > -1 && index < 8){
			return index
		} else {
			index -= val;
			return index
		}
	};
	
	// updates the text of the story
	function updateStory() {
		// create name of chapter using index
		var chapter = 'chapter' + index
		var title = 'title' + index
		// add text/html to story div from chapter variable in story.js
		$(".story").html(window[title] + window[chapter]);
	}
	
	// updates the style of the route | called in updateRoute()
	function updateStyle(feature) {
		// previous segments are changed to duller color
		if (feature.properties.ID < index){
			var newColor = '#8b726d';
		// current segment is changed to bold color
		} else if (feature.properties.ID == index) {
			var newColor = '#3f1d17';
		// segments not yet reached are invisible on map
		} else if (feature.properties.ID > index) {
			var newColor = 'transparent';
		}
		// return the style
		return {
			opacity: 1,
			color: newColor,
			weight: 3
		};
	}

	
	// function to update the style of the route based on index
	function updateRoute() {
		// if route already exists, remove it
		if (typeof(route) == 'object') {
			map.removeLayer(route);
		}
		
		// add route | style route segment based on current index
		if (index == 7) {
			// this styles all segments the same on the last index
			route = L.geoJson(routejson, {
				style: {opacity: 1, color: '#3f1d17', weight: 3 }
			})
		} else {
			// this styles route segments based on index | calls updateStyle()
			route = L.geoJson(routejson, {
				style: updateStyle
			})
		}

		//style for markers
		var geojsonMarkerOptions = {
			radius: 8,
			fillColor: "#d8d7d4",
			color: "#000",
			weight: 1,
			opacity: 1,
			fillOpacity: 1
		};
		
		//add the route to the map
		map.addLayer(route);
		
		// select POI layer based on current index
		POI = L.geoJSON(storyPoints, {
			onEachFeature: onEachFeature,
			pointToLayer: function (feature, latlng) {
				// if route already exists, remove it
				if (typeof(POI) == 'object') {
					map.removeLayer(POI);
				}
				// if it's the last index (end of story) add all markers
				if (index == 7) {
					return L.circleMarker(latlng, geojsonMarkerOptions);
				// otherwise, only add markers that correspond to the current index
				} else {
					if (feature.properties.Id == index) {
						return L.circleMarker(latlng, geojsonMarkerOptions);
					}
				}
			}
		})
		
		//add POI layer to map
		map.addLayer(POI);
		
		//adjust the map to fit screen
		if (index > 0 && index < 7){
			// fits to bounds of POI for chapters
			map.fitBounds(POI.getBounds().pad(.2))
		} else {
			// fits to bounds of entire map at the end of the story
			map.fitBounds(route.getBounds().pad(.2))
		}
	};
};


$(document).ready(initiateMap);