import { useEffect, useState } from 'react';
import "./styles.css";
import axios from 'axios';
import { AuthenticationClient } from 'react';
import { render } from 'react-dom';
import navLogo from "./images/spotify-64.png"
import favicon from "./images/favicon.ico"

function NavBar() {
    return (
        <>
        <nav class="bg-spotify-component border-gray-200 h-20 mb-4"> 
            <img class="py-2 px-10 float-left" src={navLogo} alt="logo"/>
            <div class="text-2xl text-white font-sans px-3 py-6">
                Spotify Playlist Analyzer
            </div>
        </nav>
        </>
    )
}


export default function App() {
    const CLIENT_ID = "";
    const REDIRECT_URI = "http://localhost:3000";
    const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
    const RESPONSE_TYPE = "token";

    const [token, setToken] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [tracks, setTracks] = useState([]);
    const [playlist_size, setSize] = useState(0);
    const [acousticness, setAcousticness] = useState(0);
    const [danceability, setDanceability] = useState(0);
    const [energy, setEnergy] = useState(0);
    const [instrumentalness, setInstrumentalness] = useState(0);


    const logout = () => {
        window.localStorage.clear();
        setToken("");
    }

    const renderAnalysis = () => {
        if (tracks.length) {
            return (
                <>
                <div class="text-white ml-5">
                    <p>Acousticness: {acousticness}</p>
                    <p>Danceability: {danceability}</p>
                    <p>Energy: {energy}</p>
                    <p>Instrumentalness {instrumentalness}</p>
                </div>
                </>
            )   
        }
    }

    const getPlaylistTracks = async (e) => {
        const auth = "Bearer " + token;
        console.log(auth);
        e.preventDefault();
        const url = "https://api.spotify.com/v1/playlists/" + searchKey;
        const {data} = await axios.get(url, {
            headers: {
                Authorization: auth
            }
        })
        let playlist_size = data.tracks.total;
        if (playlist_size > 100) {playlist_size = 100;}
        setTracks(data.tracks.items);
        setSize(playlist_size);
        analyzeTrack();
    }

    const searchArtists = async (e) => {
        const auth = "Bearer " + token;
        console.log(auth);
        e.preventDefault();
        const {data} = await axios.get("https://api.spotify.com/v1/search", {
            headers: {
                Authorization: auth
            },
            params: {
                q: searchKey,
                type: "artist"
            }
        })
        setArtists(data.artists.items);
    }

    const analyzeTrack = async () => { 
        const auth = "Bearer " + token;
        let acoustic = 0;
        let dance = 0;
        let en = 0;
        let instrument = 0;
        await Promise.all(
            tracks.map(async (item) => {
                let track_id = item.track.id;
                const url = "https://api.spotify.com/v1/audio-features/" + track_id;
                const {data} = await axios.get(url, {
                    headers: {
                        Authorization: auth
                    }
                })
                acoustic += data.acousticness;
                dance += data.danceability;
                en += data.energy;
                instrument += data.instrumentalness;
            })
        )
        setAcousticness(acoustic / playlist_size);
        setDanceability(dance / playlist_size);
        setEnergy(en / playlist_size);
        setInstrumentalness(instrument / playlist_size);
    }
    useEffect(() => {
        const hash = window.location.hash;
        let token = window.localStorage.getItem("token");
        setToken(token);

        if (!token && hash) {
            token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1];
            window.location.hash = "";
            window.localStorage.setItem("token", token);
        }
    }, [token]);

    const renderLoginLogout = () => {
        if (!token) {
            return (
                <>
                <p>
                <a class="text-white"href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login to Spotify</a>
                </p>
                </>
            )
        }
        else {
            return (
                <>
                <button class="rounded-full text-white"onClick={logout}>Logout</button>
                </>
            )
        }
    }

    return (
        <>
        <NavBar/>
        <div class="w-full max-w-xs ml-5">
            <form class="bg-spotify-component shadow-md rounded px-8 pt-6 pb-8 mb-4 shadow" onSubmit={searchArtists}>
                <div>
                    <label class="block text-white font-sans mb-2" for="searchArtists">
                        Enter artist name here:
                    </label>
                </div>
                <input class="bg-spotify-search rounded w-full mb-4 py-2 px-3" type="text" onChange={e => setSearchKey(e.target.value)}/>
                <button class="bg-spotify-search text-white font-sans py-2 px-4 rounded" type={"submit"}>Search</button>
            </form>

            <form class="bg-spotify-component shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={getPlaylistTracks}>
                <div>
                    <label class="block text-white font-sans mb-2" for="searchArtists">
                        Enter playlist id here:
                    </label>
                </div>
                <input class="bg-spotify-search rounded w-full mb-4 py-2 px-3" type="text" onChange={e => setSearchKey(e.target.value)}/>
                <button class="bg-spotify-search text-white font-sans py-2 px-4 rounded" type={"submit"}>Search</button>
            </form>
        </div>
        {renderLoginLogout()}
        {renderAnalysis()}
        </>
    );
}
