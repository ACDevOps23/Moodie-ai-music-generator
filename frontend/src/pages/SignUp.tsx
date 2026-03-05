import RegisterForm from "../features/auth/RegisterForm";
import { Link } from "react-router";
import "../styles/App.css";

// The SignUp component is the main page for user registration. It renders a heading, a subheading, the RegisterForm component, and a link to the login page for users who already have an account. The RegisterForm component handles the actual registration form and
//  logic, while the SignUp component provides the overall structure and styling for the signup page.
const SignUp = () => {
    return ( 
        <div className="auth-container">
            <div className="w-full max-w-md">
                <h1 className="text-gray-200 text-[33px] font-bold mb-3">Enter your info to sign up</h1>
                <p className="text-gray-400 text-lg mb-5">Get started with an account.</p>
                    <RegisterForm  />
                <p className="mt-4 text-white text-sm">Already have an account? <Link to={"/login"} className="text-blue-500">Sign in</Link></p>
            </div>
            
        </div> 
);
}

export default SignUp;