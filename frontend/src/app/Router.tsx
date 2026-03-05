import { Route, Routes } from "react-router";
import { Home } from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import { Chat } from "../pages/Chat";
import { Library } from "../pages/Library";
import { SpotifyConnect } from "../pages/SpotifyConnect";
import { Authenticated, RedirectAuthenticatedUser } from "../features/auth/authenticated";

const Router = () => {
    return ( // Define application routes with authentication guards
        <Routes>
            <Route element={<RedirectAuthenticatedUser />}> 
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
            </Route>

            <Route element={<Authenticated />}>
                <Route path="/dashboard" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/playlists" element={<Library />} />
                <Route path="/spotify-connect" element={<SpotifyConnect />} />
            </Route>

        </Routes>
    );

};

export default Router;