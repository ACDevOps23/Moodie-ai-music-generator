import '../styles/App.css'
import Router from './Router';
import { useEffect } from 'react';
import { useAuthStore } from "../store/auth.store"
import { useSpotifyStore } from "../store/spotify.store"
import { UIProvider } from "../context/UIContext"

const App = () => {
 const { restoreSession, isCheckingAuth } = useAuthStore(); // Restore session on app load
 const { checkSpotifyConnection } = useSpotifyStore(); // Check Spotify connection after auth check is done

 useEffect(() => { // Restore user session on app load
    restoreSession();
 }, []); // Empty dependency array - only run once on mount

 useEffect(() => { // After auth check is done, check Spotify connection
    if (!isCheckingAuth) {
      checkSpotifyConnection();
    }
 }, [isCheckingAuth, checkSpotifyConnection]); // Run when isCheckingAuth changes

  if (isCheckingAuth) return null;

  return ( // Wrap the app in the UIProvider to provide UI state to all components
    <UIProvider> 
      <Router /> 
    </UIProvider>
  )
}

export default App;
