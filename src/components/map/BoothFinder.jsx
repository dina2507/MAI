import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Locate, ExternalLink, AlertCircle, Navigation } from "lucide-react";
import "./BoothFinder.css";

const API_KEY = import.meta.env.VITE_MAPS_API_KEY;

/**
 * Modern Google Maps Loader
 */
async function loadMapsLibrary(library) {
  if (!API_KEY) throw new Error("No API key");
  
  if (window.google?.maps?.importLibrary) {
    return window.google.maps.importLibrary(library);
  }

  return new Promise((resolve, reject) => {
    // If script already exists but importLibrary isn't ready, wait for it
    if (document.querySelector("[data-maps-script]")) {
      const check = setInterval(async () => {
        if (window.google?.maps?.importLibrary) {
          clearInterval(check);
          resolve(await window.google.maps.importLibrary(library));
        }
      }, 100);
      setTimeout(() => { clearInterval(check); reject(new Error("Maps script timeout")); }, 10_000);
      return;
    }

    // Official bootstrap snippet logic
    window.__mapsInitCb = async () => {
      delete window.__mapsInitCb;
      resolve(await window.google.maps.importLibrary(library));
    };

    const s = document.createElement("script");
    s.setAttribute("data-maps-script", "true");
    // Added loading=async as required by modern best practices
    s.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&loading=async&callback=__mapsInitCb`;
    s.async = true;
    s.onerror = () => reject(new Error("Maps script failed to load. Please check your API key and internet connection."));
    document.head.appendChild(s);
  });
}

export default function BoothFinder() {
  const mapRef = useRef(null);
  const inputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const autocompleteRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | loading | loaded | error | no-key
  const [results, setResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchCenter, setSearchCenter] = useState(null);
  const [locating, setLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!API_KEY) { setStatus("no-key"); return; }
    
    async function init() {
      setStatus("loading");
      try {
        // Pre-load core libraries
        await loadMapsLibrary("maps");
        await loadMapsLibrary("places");
        await loadMapsLibrary("marker");
        
        initMap();
        setStatus("loaded");
      } catch (err) {
        console.error("Maps Init Error:", err);
        setErrorMsg(err.message);
        setStatus("error");
      }
    }
    
    init();
  }, []);

  async function initMap() {
    const { Map } = await window.google.maps.importLibrary("maps");
    const { Autocomplete } = await window.google.maps.importLibrary("places");

    const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center
    const map = new Map(mapRef.current, {
      center: defaultCenter,
      zoom: 5,
      styles: DARK_MAP_STYLES,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });
    mapInstanceRef.current = map;

    // Autocomplete on the search input
    const autocomplete = new Autocomplete(inputRef.current, {
      componentRestrictions: { country: "in" },
      fields: ["geometry", "name", "formatted_address"],
      types: ["geocode"],
    });
    autocompleteRef.current = autocomplete;

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const center = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        searchNearby(center, map);
      }
    });
  }

  async function searchNearby(center, map) {
    setSearchCenter(center);
    clearMarkers();
    setResults([]);
    setSelectedPlace(null);

    map.setCenter(center);
    map.setZoom(13);

    // Add a center pin (User location)
    const { Marker } = await window.google.maps.importLibrary("marker");
    new Marker({
      position: center,
      map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#F97316",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      title: "Your location",
      zIndex: 10,
    });

    try {
      const { Place } = await window.google.maps.importLibrary("places");
      
      // Use the new searchByText for better results with keywords
      const request = {
        textQuery: "polling booth OR election office OR voter registration office",
        fields: ["id", "displayName", "location", "formattedAddress", "rating"],
        locationBias: { center, radius: 5000 },
        maxResultCount: 12,
        language: "en-IN",
        region: "in",
      };

      const { places } = await Place.searchByText(request);
      
      if (places && places.length > 0) {
        renderResults(places, map);
      } else {
        // Fallback: wider search
        const wideRequest = {
          textQuery: "government election office",
          fields: ["id", "displayName", "location", "formattedAddress", "rating"],
          locationBias: { center, radius: 15000 },
          maxResultCount: 8,
        };
        const { places: fallbackPlaces } = await Place.searchByText(wideRequest);
        renderResults(fallbackPlaces || [], map);
      }
    } catch (err) {
      console.error("Search failed:", err);
      if (err.message.includes("not enabled")) {
        setErrorMsg("Places API (New) is not enabled in your Google Cloud Console.");
      } else {
        setErrorMsg("Search failed. Please try again.");
      }
    }
  }

  async function renderResults(places, map) {
    setResults(places);
    const { LatLngBounds } = await window.google.maps.importLibrary("core");
    const { Marker } = await window.google.maps.importLibrary("marker");
    const bounds = new LatLngBounds();

    places.forEach((place, i) => {
      const location = place.location || place.geometry?.location;
      if (!location) return;

      const marker = new Marker({
        position: location,
        map,
        title: place.displayName || place.name,
        label: {
          text: String(i + 1),
          color: "#fff",
          fontSize: "12px",
          fontWeight: "bold",
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: "#8B5CF6",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => setSelectedPlace(place));
      markersRef.current.push(marker);
      bounds.extend(location);
    });

    if (places.length > 0) map.fitBounds(bounds, 80);
  }

  function clearMarkers() {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }

  function handleLocate() {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocating(false);
        if (mapInstanceRef.current) {
          searchNearby(center, mapInstanceRef.current);
        }
      },
      () => {
        setLocating(false);
        setErrorMsg("Could not get your location. Please search by area or PIN code.");
      }
    );
  }

  async function handleSearchSubmit(e) {
    e.preventDefault();
    const val = inputRef.current?.value?.trim();
    if (!val || !mapInstanceRef.current) return;

    try {
      const { Geocoder } = await window.google.maps.importLibrary("geocoding");
      const geocoder = new Geocoder();
      geocoder.geocode({ address: val + ", India" }, (results, status) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          searchNearby({ lat: loc.lat(), lng: loc.lng() }, mapInstanceRef.current);
        }
      });
    } catch (err) {
      setErrorMsg("Geocoding failed.");
    }
  }

  const getMapsUrl = () => {
    if (!selectedPlace) return null;
    const name = selectedPlace.displayName || selectedPlace.name;
    const id = selectedPlace.id || selectedPlace.place_id;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(name)}&destination_place_id=${id}`;
  };

  // ── No API key ───────────────────────────────────
  if (status === "no-key") {
    return (
      <div className="booth-page">
        <div className="booth-no-key">
          <MapPin size={40} className="booth-no-key-icon" />
          <h2 className="booth-no-key-title">Maps API key required</h2>
          <p className="booth-no-key-body">
            Add <code>VITE_MAPS_API_KEY=your_key</code> to your <code>.env.local</code> file,
            then restart the dev server.
          </p>
          <a
            href="https://console.cloud.google.com/google/maps-apis/credentials"
            target="_blank"
            rel="noopener"
            className="booth-ext-link"
          >
            Get a Maps API key
            <ExternalLink size={14} />
          </a>
          <div className="booth-fallback">
            <p className="booth-fallback-label">In the meantime, use the official ECI portal:</p>
            <a
              href="https://electoralsearch.eci.gov.in/"
              target="_blank"
              rel="noopener"
              className="booth-ext-link"
            >
              ECI — Know Your Polling Booth
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booth-page">
      {/* Top panel */}
      <div className="booth-top">
        <div className="booth-header">
          <div className="booth-header-text">
            <h1 className="booth-title">Find Your Polling Booth</h1>
            <p className="booth-subtitle">
              Search by area or PIN code to see nearby polling stations and electoral offices.
            </p>
          </div>
          <a
            href="https://electoralsearch.eci.gov.in/"
            target="_blank"
            rel="noopener"
            className="booth-eci-btn"
          >
            <span>Official ECI Booth Search</span>
            <ExternalLink size={14} />
          </a>
        </div>

        <form className="booth-search" onSubmit={handleSearchSubmit}>
          <div className="booth-search-inner">
            <Search size={16} className="booth-search-icon" />
            <input
              ref={inputRef}
              type="text"
              className="booth-search-input"
              placeholder="Enter area name, PIN code, or city…"
              disabled={status === "loading"}
            />
          </div>
          <button type="submit" className="booth-search-btn" disabled={status === "loading"}>
            Search
          </button>
          <button
            type="button"
            className="booth-locate-btn"
            onClick={handleLocate}
            disabled={locating || status === "loading"}
            title="Use my location"
          >
            <Locate size={16} className={locating ? "booth-locate-spin" : ""} />
            {locating ? "Locating…" : "Use my location"}
          </button>
        </form>

        {errorMsg && (
          <div className="booth-error">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main area: map + results list */}
      <div className="booth-main">
        {/* Map */}
        <div className="booth-map-wrap">
          <div
            ref={mapRef}
            className="booth-map"
            style={{ opacity: status === "loading" ? 0 : 1 }}
          />
          {status === "loading" && (
            <div className="booth-map-loading">
              <div className="booth-spinner" />
              <span>Loading map…</span>
            </div>
          )}
          {status === "error" && (
            <div className="booth-map-loading">
              <AlertCircle size={24} />
              <span>{errorMsg || "Failed to load map"}</span>
            </div>
          )}
        </div>

        {/* Results sidebar */}
        {results.length > 0 && (
          <motion.div
            className="booth-results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="booth-results-count text-caption">
              {results.length} location{results.length !== 1 ? "s" : ""} found
            </p>
            <ul className="booth-results-list">
              {results.map((place, i) => (
                <li key={place.id || place.place_id}>
                  <button
                    className={`booth-result-item ${(selectedPlace?.id || selectedPlace?.place_id) === (place.id || place.place_id) ? "booth-result-item--active" : ""}`}
                    onClick={() => {
                      setSelectedPlace(place);
                      const loc = place.location || place.geometry?.location;
                      if (loc) {
                        mapInstanceRef.current?.panTo(loc);
                        mapInstanceRef.current?.setZoom(16);
                      }
                    }}
                  >
                    <span className="booth-result-num">{i + 1}</span>
                    <div className="booth-result-info">
                      <span className="booth-result-name">{place.displayName || place.name}</span>
                      {(place.shortAddress || place.vicinity) && (
                        <span className="booth-result-addr">{place.shortAddress || place.vicinity}</span>
                      )}
                      {place.rating && (
                        <span className="booth-result-rating">★ {place.rating.toFixed(1)}</span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Selected place detail */}
      {selectedPlace && (
        <motion.div
          className="booth-detail"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="booth-detail-info">
            <MapPin size={16} className="booth-detail-icon" />
            <div>
              <p className="booth-detail-name">{selectedPlace.displayName || selectedPlace.name}</p>
              {(selectedPlace.shortAddress || selectedPlace.vicinity) && (
                <p className="booth-detail-addr">{selectedPlace.shortAddress || selectedPlace.vicinity}</p>
              )}
            </div>
          </div>
          <div className="booth-detail-actions">
            <a href={getMapsUrl()} target="_blank" rel="noopener" className="booth-dir-btn">
              <Navigation size={14} />
              Directions
            </a>
          </div>
        </motion.div>
      )}

      {/* Helpful note */}
      <div className="booth-note">
        <AlertCircle size={13} />
        <span>
          Results show nearby government offices and polling stations found on Google Maps.
          For authoritative booth information, use the{" "}
          <a href="https://electoralsearch.eci.gov.in/" target="_blank" rel="noopener">
            official ECI portal
          </a>.
        </span>
      </div>
    </div>
  );
}

const DARK_MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#14141B" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0A0F" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9999A8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1E1E29" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0A0A0F" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#2A2A38" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0A0A0F" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1E1E29" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#6B6B7B" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1E1E29" }] },
];
