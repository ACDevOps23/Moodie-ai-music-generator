import LoginForm from "../features/auth/LoginForm";
import { Link } from "react-router";
import "../styles/App.css";

// The Login component is the main page for user login. It renders a heading, a subheading, the LoginForm component, and a link to the signup page for users who don't have an account. The LoginForm component handles the actual login form and logic, while the Login 
// component provides the overall structure and styling for the login page.
const Login = () => {
    return ( 
        <div className="auth-container">
            <div className="w-full max-w-md">
                <h1 className="text-gray-200 text-[33px] font-bold mb-3">Enter your info to sign in</h1>
                <p className="text-gray-400 text-lg mb-5">Start your journey with Moodie.</p>
                    <LoginForm  />
                      <p className="mt-4 text-white text-sm">Don't have an account? <Link to={"/signup"} className="text-blue-500">Sign up</Link></p>
            </div>
        </div> 
);
}

export default Login;