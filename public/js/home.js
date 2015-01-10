$(function() {
  localLatLng(function(latLng) {
    return setUpMap({
      latLng: new google.maps.LatLng(latLng.latitude, latLng.longitude)
    })
  })
})

function localLatLng(cb) {
  return navigator.geolocation.getCurrentPosition(function(search) {
    return cb(search.coords)
  })
}

function toRad(num) {
  return num * Math.PI / 180
}

function haversine(start, end, options) {
  var R, a, c, dLat, dLon, km, lat1, lat2, mile
  km = 6371
  mile = 3960
  if (options == null) {
    options = {}
  }
  R = options.unit === 'mile' ? mile : km
  dLat = toRad(end.latitude - start.latitude)
  dLon = toRad(end.longitude - start.longitude)
  lat1 = toRad(start.latitude)
  lat2 = toRad(end.latitude)
  a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  if (options.threshold) {
    return options.threshold > (R * c)
  } else {
    return R * c
  }
}

function setUpMap(options) {
  var geocoder = new google.maps.Geocoder()
  return geocoder.geocode(options, function(results, status) {
    var pin = {
      url: "/images/search/pin.png",
      size: new google.maps.Size(50, 74),
      scaledSize: new google.maps.Size(25, 37),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    }

    var pin_hover = {
      url: "/images/search/pin_hover.png",
      size: new google.maps.Size(50, 74),
      scaledSize: new google.maps.Size(25, 37),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    }

    var map = new google.maps.Map($('.map').get(0), {
      zoom: 15,
      center: results[0].geometry.location,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL
      }
    })

    $(".worker").each(function() {
      var lat = parseFloat($(this).data("lat"))
      var ln = parseFloat($(this).data("lng"))
      var latLng = new google.maps.LatLng(lat, ln)

      localLatLng((function(_this) {
        return function(myLatLng) {
          var distance = haversine({
            latitude: lat,
            longitude: ln
          }, myLatLng, {
            unit: 'mile'
          })

          return $(_this).find(".distance").text("" + (distance.toFixed(2)) + " miles away...")
        }
      })(this))

      marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: pin
      })

      $(this).mouseover(function() {
        return marker.setIcon(pin_hover)
      })

      $(this).mouseout(function() {
        return marker.setIcon(pin)
      })

      google.maps.event.addListener(marker, 'click', (function(_this) {
        return function() {
          return window.location.href = $(_this).attr("href")
        }
      })(this))

      google.maps.event.addListener(marker, 'mouseover', (function(_this) {
        return function() {
          $(_this).addClass("hover")
          return marker.setIcon(pin_hover)
        }
      })(this))

      google.maps.event.addListener(marker, 'mouseout', (function(_this) {
        return function() {
          $(_this).removeClass("hover")
          return marker.setIcon(pin)
        }
      })(this))
    })
  })
}