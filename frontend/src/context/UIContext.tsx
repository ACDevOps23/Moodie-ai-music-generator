import { createContext, useContext, useState } from "react";

// The UIContext provides a way to manage UI-related state across the application, specifically the state of whether the sidebar is collapsed or expanded.
type UIContextType = { // Define the shape of the UI context
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
};
// Create the UI context with an undefined default value
const UIContext = createContext<UIContextType | undefined>(undefined); 
// Create the UIProvider component that will wrap the app and provide the UI context
export const UIProvider = ({ children }: { children: React.ReactNode }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
   // Provide the context value to children components
    return (
        <UIContext.Provider value={{ isSidebarCollapsed, setIsSidebarCollapsed }}>
            {children}
        </UIContext.Provider>
    );
};
// Custom hook to use the UI context in components
export const useUIContext = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error("useUIContext must be used within UIProvider");
    }
    return context;
};
