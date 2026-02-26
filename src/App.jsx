import axios from "axios";
import { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polygon } from "react-leaflet";

import "./styles.css";

export default function App() {
    const mapRef = useRef(null);

    const [fetching, setFetching] = useState(false);

    const [mapCenter, setMapCenter] = useState([37.3229, -122.0323]);
    const [clickCenter, setClickCenter] = useState([0, 0]);
    const [polygon, setPolygon] = useState([]);

    function ClickHandler() {
        useMapEvents({
            click: async (event) => {
                if (fetching) return;

                const coords = event.latlng;

                setClickCenter([coords.lat, coords.lng]);
                setPolygon([]);
                setFetching(true);

                const mainResponse = (await axios.get(`/points/${coords.lat},${coords.lng}`)).data.properties;

                const forecastResponse = (await axios.get(mainResponse.forecast)).data;

                setPolygon(forecastResponse.geometry.coordinates[0].map(coord => [coord[1], coord[0]]));
                setFetching(false);
            }
        });
    }

    // recenter map when center changes
    useEffect(() => {
        const map = mapRef.current; if (!map) return;
        map.setView(mapCenter, map.getZoom());
    }, [mapCenter]);

    // optionally center to current location
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (position) => setMapCenter([position.coords.latitude, position.coords.longitude]),
            () => null,
            { enableHighAccuracy: true }
        );
    }, []);

    return <>
        <MapContainer id="map" ref={mapRef} center={mapCenter} zoom={12} attributionControl={false}>
            <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"/>

            <Marker position={clickCenter}/>
            <Polygon positions={polygon}/>

            <ClickHandler/>
        </MapContainer>

        <div id="info">
            <h1>{fetching ? "Fetching..." : "Fetched"}</h1>
        </div>
    </>
}