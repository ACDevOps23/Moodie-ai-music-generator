import Button from "../../components/ui/Button"
import "../../styles/App.css"

// The AuthForm component is a reusable form component for authentication-related forms (like login and registration).
type AuthFormProps = {
    submitLabel: string; // The submitLabel prop is a string that will be displayed on the submit button of the form, allowing you to customize it for different forms (e.g., "Login", "Register").
    onSubmit: (e: React.SubmitEvent) => void; // The onSubmit prop is a function that will be called when the form is submitted, allowing you to handle the form submission logic in the parent component.
    children: React.ReactNode; // The children prop allows you to pass in form fields (like input elements) when using the AuthForm component, making it flexible for different authentication forms.
};
// The component renders a form element that wraps its children (the form fields) and includes a submit button with the provided label. When the form is submitted, it calls the onSubmit function passed in as a prop.
const AuthForm = ({ submitLabel, onSubmit, children }: AuthFormProps) => { 
    return (
        <form onSubmit={onSubmit}>
            {children}
            <Button type="submit" className="btn-primary">{submitLabel}</Button> 
        </form>
      
    );
} 

export default AuthForm;