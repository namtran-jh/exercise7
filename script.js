const coordinates = { x: 0, y: 0 };

mapboxgl.accessToken = 'pk.eyJ1IjoidGhuYW1tIiwiYSI6ImNrZDhrdXJrcDJrc3Uyc3E5eXpvbnlrMHoifQ.BVSR7lFvAEGFihZ0p1i11w';
const map = new mapboxgl.Map({
    container: 'map', // element id 
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [106.681281, 10.764536], //starting position [lng, lat]
    zoom: 14 // starting zoom
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// Add geocoder
// map.addControl(
//     new MapboxGeocoder({
//         accessToken: mapboxgl.accessToken,
//         mapboxgl: mapboxgl
//     })
// );

// Add marker and popup at maker
function addMakerAndPopup(x, y, text) {
    const marker = new mapboxgl.Marker()
        .setLngLat([x, y])
        .addTo(map);
    const popup = new mapboxgl.Popup({
            closeOnClick: false
        })
        .setLngLat([x, y])
        .setHTML(`<h3>${text}</h3>`)
        .addTo(map);
}

addMakerAndPopup(106.681281, 10.764536, "Journey Horizon");
updateCoordinate(106.681281, 10.764536);

// Draw dot
const size = 100;

const pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render: function() {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};

// Add popup when hover on a place
map.on('load', function() {
    map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });

    map.addSource('places', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Children"s Hospital 1</strong><p>341 Su Van Hanh street, ward 10, district 10, Ho Chi Minh city, Vietnam</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.670159, 10.768718]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Sai Gon Supermarket</strong><p>If you want to buy something, come closer to me babe</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.667723, 10.768771]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Varikosette Drugstore</strong><p>I will help you with your sickness and disease by drugzzz</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.670157, 10.762311]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Hoa Binh Park</strong><p>I love playing sports in peace</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.673480, 10.760754]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>ABC Bakery</strong><p>Eating cookies help me become more sweeter</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.677085, 10.756939]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Tenth Sister Flan</strong><p>Yeah, it"s time for you to visit us</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.682267, 10.753155]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'description': '<strong>Southern Guest Home</strong><p>Want to rest? Want to play? I will serve you</p>'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [106.686001, 10.762894]
                    }
                }
            ]
        }
    });

    // Add a layer showing the places.
    map.addLayer({
        'id': 'places',
        'type': 'symbol',
        'source': 'places',
        'layout': {
            'icon-image': 'pulsing-dot',
            'icon-allow-overlap': true
        }
    });

    // Create a popup, but don't add it to the map yet.
    const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    map.on('mouseenter', 'places', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });

    map.on('mouseleave', 'places', function() {
        map.getCanvas().style.cursor = '';
        popup.remove();
    });
});

// Add Geocoding API for location autocomplete suggestion form
// Create a request variable and assign a new XMLHttpRequest object to it.
var request = new XMLHttpRequest()

function searchLocation() {
    let textSearch = document.getElementById("mySearch").value;
    let searchResult = "";

    if (textSearch !== "") {
        // Open a new connection, using the GET request on the URL endpoint
        request.open('GET', `https://api.mapbox.com/geocoding/v5/mapbox.places/${textSearch}.json?access_token=pk.eyJ1IjoidGhuYW1tIiwiYSI6ImNrZDhrdXJrcDJrc3Uyc3E5eXpvbnlrMHoifQ.BVSR7lFvAEGFihZ0p1i11w`, true)

        request.onload = function() {
            // Begin accessing JSON data here
            var data = JSON.parse(this.response);
            // console.log(data);

            data.features.forEach(val => {
                searchResult += `
                <div class="searchResult" onclick="movePlace(${val.geometry.coordinates[0]}, ${val.geometry.coordinates[1]}, '${val.text}')">
                    <h2>${val.text}</h2>
                    <p>${val.properties.address || ""}</p>
                </div>
                `;
            });

            document.getElementById("locationSuggestion").style.display = "flex";
            document.getElementById("locationSuggestion").innerHTML = searchResult;
        }

        // Send request
        request.send();
    }
}

function focusOut() {
    document.getElementById("locationSuggestion").style.display = "none";
}

function movePlace(x, y, text) {
    // console.log(x, y);
    map.flyTo({
        center: [x, y],
        essential: true // this animation is considered essential with respect to prefers-reduced-motion
    });

    addMakerAndPopup(x, y, text);
    updateCoordinate(x, y);
    focusOut();
}

function updateCoordinate(x, y) {
    coordinates.x = x;
    coordinates.y = y;
}