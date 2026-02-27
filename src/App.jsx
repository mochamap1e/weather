import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from "react-leaflet";

import "./styles.css";

const fetchingStates = [
    "Locating...",
    "Located.",
    "Invalid location.",
    "..."
];

function wrapLongitude(lng) {
    return ((lng + 180) % 360 + 360) % 360 - 180;
}

function getLocalTime(timezone) {
    return new Date().toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function App() {
    const mapRef = useRef(null);

    // map states
    const [fetchingText, setFetchingText] = useState(fetchingStates[3]);
    const [mapCenter, setMapCenter] = useState([37.3229, -122.0323]);
    const [clickCenter, setClickCenter] = useState(null);

    // weather states
    const [isDay, setIsDay] = useState(0);
    const [time, setTime] = useState("?");
    const [temp, setTemp] = useState("?");
    const [humidity, setHumidity] = useState("?");

    async function setLocation(lat, lng) {
        if (fetchingText === fetchingStates[0]) return;

        lng = wrapLongitude(lng);

        setClickCenter([lat, lng]);
        setMapCenter([lat, lng]);
        setFetchingText(fetchingStates[0]);

        try {
            const data = (await axios.get(`
                https://api.open-meteo.com/v1/forecast
                ?latitude=${lat}
                &longitude=${wrapLongitude(lng)}
                &timezone=auto
                &temperature_unit=fahrenheit
                &current=is_day,temperature_2m,relative_humidity_2m
            `.replaceAll(" ", ""))).data;

            console.log(data);

            setIsDay(data.current.is_day);
            setTime(getLocalTime(data.timezone));
            setTemp(data.current.temperature_2m + data.current_units.temperature_2m);
            setHumidity(data.current.relative_humidity_2m + data.current_units.relative_humidity_2m)

            setFetchingText(fetchingStates[1]);
        } catch(error) {
            setFetchingText(fetchingStates[2]);
        }
    }

    function ClickHandler() {
        useMapEvents({
            click: (event) => setLocation(event.latlng.lat, event.latlng.lng)
        });
    }

    // recenter map when center changes
    useEffect(() => {
        const map = mapRef.current; if (!map) return;
        map.setView(mapCenter, map.getZoom());
        console.log(map.getZoom())
    }, [mapCenter]);

    // optionally center to current location
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => setLocation(position.coords.latitude, position.coords.longitude),
            () => null,
            { enableHighAccuracy: true }
        );
    }, []);

    return <>
        <MapContainer
            className="map"
            ref={mapRef}
            center={mapCenter}
            zoom={12}
            minZoom={3}
            attributionControl={false}
        >
            <TileLayer
                className="map-tiles"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {clickCenter && <Marker position={clickCenter}/>}
            <ClickHandler/>
        </MapContainer>

        <div className="info">
            <h1>{fetchingText}</h1>

            <h2>{isDay === 1 ? "Day" : "Night"}</h2>
            <h2>{time}</h2>
            <h2>{temp}</h2>
            <h2>{humidity} humidity</h2>
        </div>
    </>
}