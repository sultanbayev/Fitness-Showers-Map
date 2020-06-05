let fitnessRadiuses = [];
let gymRadiuses = [];
let gymAndFitnessRadiuses = [];
let businessRadiuses = [];

let businessCentersAroundGyms = [];


function initMap() {
    const mapDiv = document.getElementById('map');
    const almaty = {
        lat: 43.24704406575034,
        lng: 76.92955542657376
    };
    const mapOptions = {
        zoom: 13,
        center: almaty,
        mapTypeControl: false,
        streetViewControl: false,
        scaleControl: true,
        mapTypeControl: true
    }
    map = new google.maps.Map(mapDiv, mapOptions);
    map.setMapTypeId(google.maps.MapTypeId.TERRAIN);

    const fitnessLatLng = processResult(dataFitness);
    const gymLatLng = processResult(dataGyms);
    const businessLatLng = processResult(dataBusinessCenters);

    fitnessLatLng.forEach(element => {
        var circle = new google.maps.Circle({
            center: element,
            radius: 30,
            map: map,
            strokeWeight: 0,
            fillColor: '#ff0000',
            fillOpacity: 0.7
        });

        var infoWindow = new google.maps.InfoWindow({
            content: `<div><p><strong>Lat:</strong> ${element.lat}</p>
                    <p><strong>Lng:</strong> ${element.lng}</p>
                    <p><strong>Name:</strong> ${element.name}</p></div>`
        });

        google.maps.event.addListener(circle, 'click', () => {
            closeInfoWindows();
            infoWindow.setPosition(circle.getCenter());
            infoWindow.open(map);
        });

        fitnessRadiuses.push({
            circle: circle,
            infoWindow: infoWindow
        });
    });

    gymLatLng.forEach(element => {
        var circle = new google.maps.Circle({
            center: element,
            radius: 30,
            map: map,
            strokeWeight: 0,
            fillColor: '#ff0000',
            fillOpacity: 0.7
        });

        var infoWindow = new google.maps.InfoWindow({
            content: `<div><p><strong>Lat:</strong> ${element.lat}</p>
                    <p><strong>Lng:</strong> ${element.lng}</p>
                    <p><strong>Name:</strong> ${element.name}</p></div>`
        });
        
        google.maps.event.addListener(circle, 'click', () => {
            closeInfoWindows();
            infoWindow.setPosition(circle.getCenter());
            infoWindow.open(map);
        });

        gymRadiuses.push({
            circle: circle,
            infoWindow: infoWindow
        });
    });

    businessLatLng.forEach(element => {
        var circle = new google.maps.Circle({
            center: {'lat': element.lat + 0.00005, 'lng': element.lng + 0.00005},
            radius: 300,
            map: map,
            strokeWeight: 1,
            strokeOpacity: 0.5,
            fillColor: '#D5F700',
            fillOpacity: 0.2
        });

        var infoWindow = new google.maps.InfoWindow({
            content: `<div><p><strong>Lat:</strong> ${element.lat}</p>
                    <p><strong>Lng:</strong> ${element.lng}</p>
                    <p><strong>Name:</strong> ${element.name}</p></div>`
        });
        
        google.maps.event.addListener(circle, 'click', () => {
            closeInfoWindows();
            infoWindow.setPosition(circle.getCenter());
            infoWindow.open(map);
        });

        businessRadiuses.push({
            circle: circle,
            infoWindow: infoWindow
        });
    });

    gymAndFitnessRadiuses = gymAndFitnessRadiuses.concat(fitnessRadiuses);

    fitnessRadiuses.forEach(elementOne => {
        gymRadiuses.forEach(elementTwo => {
            var boundsOne = elementOne.circle.getBounds();
            var boundsTwo = elementTwo.circle.getBounds();
            var isIntersecting = boundsOne.intersects(boundsTwo);
            if (isIntersecting) {
                google.maps.event.clearListeners(elementTwo.circle, 'click');
                elementTwo.circle.setMap(null);
                const index = gymRadiuses.findIndex(element => {
                    element === elementTwo
                });
                gymRadiuses.splice(index, 1);
            }
        });
    });

    gymAndFitnessRadiuses = gymAndFitnessRadiuses.concat(gymRadiuses);

    businessRadiuses.forEach(elementOne => {
        gymAndFitnessRadiuses.forEach(elementTwo => {
            var boundsOne = elementOne.circle.getBounds();
            var centerTwo = elementTwo.circle.getCenter();
            var isContaining = boundsOne.contains(centerTwo);
            if(isContaining) {
                var index = businessCentersAroundGyms.findIndex(element => element.businessCenter === elementOne);
                if (index != -1) {
                    businessCentersAroundGyms[index].gymOrFit.push(elementTwo);
                } else {
                    businessCentersAroundGyms.push({
                        businessCenter: elementOne,
                        gymOrFit: [elementTwo]
                    });
                    elementOne.circle.set('fillColor', '#FF5733');
                    elementOne.circle.set('fillOpacity', 0.9);
                }
            }
        });
    });

    let singles = 0;
    businessCentersAroundGyms.forEach(element => {
        if (element.gymOrFit.length == 1) {
            singles++;
        }
    })
    console.log('Business centers with only one fitness or gym around: ' + singles);
    console.log('Business centers with gyms and fitness around: ' + businessCentersAroundGyms.length);
}

function closeInfoWindows() {
    fitnessRadiuses.forEach(element => {
        element.infoWindow.close();
    });
    gymRadiuses.forEach(element => {
        element.infoWindow.close();
    });
    businessRadiuses.forEach(element => {
        element.infoWindow.close();
    });
}


function processResult(result) {
    const points = [];
    result.result.items.forEach(element => {
        points.push({'lat': element.lat, 'lng': element.lon, 'name': element.name_ex.primary});
    });
    return points;
}

function toggleMarkers(markers) {
    if (markers[0].getVisible()) {
        markers.forEach(element => {
            element.setVisible(false);
        })
    } else {
        markers.forEach(element => {
            element.setVisible(true);
        })
    }
}
