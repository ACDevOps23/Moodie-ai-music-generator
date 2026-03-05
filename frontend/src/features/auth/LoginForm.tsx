import AuthForm from "./AuthForm";
import { FormInput } from "../../components/ui/FormInput";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

// The LoginForm component is a specific implementation of the AuthForm component for user login. 
// It manages its own state for email and password input fields, and it uses the login function from the auth store to handle form submission. 
// It also checks if the user is authenticated and redirects to the dashboard if so.
const LoginForm = () => {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { login, error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();

    // Effect to redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    // Handle form submission by calling the login function from the auth store with the email and password state values.
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        await login(email, password);
    }
     // The component renders an AuthForm with the handleSubmit function and a submit label of "Sign in".
    return (
        <AuthForm onSubmit={handleSubmit} submitLabel="Sign in">
            <FormInput
                type="email"
                value={email}
                placeholder="user@example.com"
                name="email"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} // ChangeEvent is an event type for input change events, and we update the email state with the new value from the input field.
                // <HTMLInputElement> is a TypeScript type assertion that tells the compiler that the event target is an HTML input element, allowing us to access its value property without type errors.
            />
            <FormInput
                type="password"
                value={password}
                placeholder="password"
                name="password"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
        </AuthForm>
    );
};

export default LoginForm;
