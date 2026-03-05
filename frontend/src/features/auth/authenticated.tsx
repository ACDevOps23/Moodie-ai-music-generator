import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "../../store/auth.store";

// The Authenticated component is a route guard that checks if the user is authenticated before allowing access to certain routes. 
const Authenticated = () => { // Component to protect routes that require authentication
   const { isAuthenticated, isCheckingAuth } = useAuthStore(); // Get authentication status and loading state from auth store

   if (isCheckingAuth) return null; // 

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet /> // Render child routes if authenticated - rest of the app will be rendered here if the user is authenticated

}

const RedirectAuthenticatedUser = () => { // Component to redirect authenticated users away from login/signup pages
    const { isAuthenticated, isCheckingAuth } = useAuthStore();

    if (isCheckingAuth) return null;

     if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />
     }
    return <Outlet /> // Render child routes if not authenticated - login/signup pages will be rendered here if the user is not authenticated
}

export { Authenticated, RedirectAuthenticatedUser };