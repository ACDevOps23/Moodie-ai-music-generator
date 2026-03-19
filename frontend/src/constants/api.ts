// The AUTH_API constant is defined to hold the base URL for the authentication API. It checks if the VITE_WEB_AUTH_API environment variable is set, and if not, it defaults to "http://
const AUTH_API = import.meta.env.VITE_WEB_AUTH_API;

if (!import.meta.env.VITE_WEB_AUTH_API) {
    console.warn("VITE_WEB_AUTH_API not set);
}

export default AUTH_API;
