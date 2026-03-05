import AuthForm from "./AuthForm";
import { FormInput } from "../../components/ui/FormInput";
import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

// The RegisterForm component is a specific implementation of the AuthForm component for user registration. 
// It manages its own state for first name, last name, email, and password input fields, and it uses the signUp function from the auth store to handle form submission. 
// It also checks if the user is authenticated and redirects to the dashboard if so.
const RegisterForm = () => {

    const { signUp, error, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async(e: React.SubmitEvent) => {
        e.preventDefault();
        await signUp(firstName, lastName, email, password);
    }

    return (
        <AuthForm onSubmit={handleSubmit} submitLabel="Create">
              <FormInput
                type="text"
                value={firstName}
                placeholder="e.g. Alex"
                name="firstName"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
            />

              <FormInput
                type="text"
                value={lastName}
                placeholder="e.g. Smith"
                name="lastName"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
            />
            <FormInput
                type="email"
                value={email}
                placeholder="user@example.com"
                name="email"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
            <FormInput
                type="password"
                value={password}
                placeholder="password"
                name="password"
                className="input-primary"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </AuthForm>
    );
};

export default RegisterForm;