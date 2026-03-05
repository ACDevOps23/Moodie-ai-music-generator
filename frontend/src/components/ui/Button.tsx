// This is a simple Button component that accepts all standard button props and renders a button element.
const Button = ({...props}) => {
    
    return (
        <div>
            <button {...props} />
        </div>

    );
};

export default Button