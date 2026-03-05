// This is a simple FormInput component that accepts all standard input props and renders an input element wrapped in a styled div for consistent spacing and layout.
export const FormInput = ({ ...props }) => {
    return (
        <div className="relative mb-6">
            <input {...props} />
        </div>
    );
}