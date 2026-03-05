import { useAuthStore } from "../../store/auth.store";
import { useNavigate } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useUIContext } from "../../context/UIContext";
import { SettingsModal } from "../modals/SettingsModal";
import { useSpotifyStore } from "../../store/spotify.store";

export const Sidebar = () => {
    const { user, logout } = useAuthStore(); // Access user and logout function from auth store
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useUIContext(); // Access sidebar state from UI context
    const { isSpotifyConnected } = useSpotifyStore(); // Access Spotify connection status from Spotify store
    const navigate = useNavigate(); // Hook for navigation
    const [showDropdown, setShowDropdown] = useState(false); // State to control dropdown visibility 
    const [showSettings, setShowSettings] = useState(false); // State to control settings modal visibility
    const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown menu

    useEffect(() => { // Effect to handle clicks outside the dropdown to close it
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside); // Add event listener for clicks outside the dropdown
        return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup event listener on component unmount
    }, []);

    const handleLogout = async () => { // Function to handle user logout
        await logout();
        navigate("/login"); // Redirect to login page after logout
    };

    const userInitial = user?.firstName?.[0].toUpperCase() || "U"; // Get the first initial of the user's first name or default to "U" if not available

    const navItems = [ // Navigation items for the sidebar
        { label: "Home", icon: "🏠" },
        { label: "Playlists", icon: "🎵" },
        { label: "New Chat", icon: "💬" },
    ];

    // If no user is logged in, show a simplified sidebar without navigation or user options
    if (!user) {
        return (
            <aside className={`bg-gradient-to-b from-purple-950 via-red-950 to-black h-screen flex flex-col justify-between p-4 fixed left-0 top-0 transition-all duration-300 border-r border-gradient ${isSidebarCollapsed ? "w-20" : "w-64"}`} style={{borderImage: "linear-gradient(to bottom, rgb(147, 51, 234), rgb(153, 27, 27), rgb(0, 0, 0)) 1"}}>
                <div className="flex items-center justify-between">
                    {!isSidebarCollapsed && <div className="text-white text-2xl font-bold">🎵 Moodie</div>}
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className="text-white hover:bg-purple-700 p-2 rounded transition cursor-pointer"
                        title={isSidebarCollapsed ? "Expand" : "Collapse"}
                    >
                        {isSidebarCollapsed ? "→" : "←"}
                    </button>
                </div>
            </aside>
        );
    }

    return (
        <>
        <aside className={`bg-gradient-to-b from-purple-950 via-red-950 to-black h-screen flex flex-col p-4 fixed left-0 top-0 transition-all duration-300 border-r border-gradient ${isSidebarCollapsed ? "w-20" : "w-64"}`} style={{borderImage: "linear-gradient(to bottom, rgb(147, 51, 234), rgb(153, 27, 27), rgb(0, 0, 0)) 1"}}>
            {/* Header with collapse button */}
            <div className="flex items-center justify-between mb-8">
                {!isSidebarCollapsed && <div className="text-white text-2xl font-bold">🎵 Moodie</div>}
                <button
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="text-white hover:bg-purple-700 p-2 rounded transition cursor-pointer"
                    title={isSidebarCollapsed ? "Expand" : "Collapse"}
                >
                    {isSidebarCollapsed ? "→" : "←"}
                </button>
            </div>

            {/* Navigation - positioned at top */}
            <nav className="space-y-4 flex-1">
                {navItems.map((item, idx) => {
                    let path = "/dashboard";
                    if (item.label === "Playlists") path = "/playlists";
                    if (item.label === "New Chat") path = "/chat";

                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(path)}
                            className={`w-full flex items-center gap-3 px-4 py-2 text-gray-300 hover:bg-purple-700 hover:text-white rounded transition cursor-pointer ${isSidebarCollapsed ? "justify-center" : ""}`}
                            title={isSidebarCollapsed ? item.label : ""}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            {/* User avatar at bottom */}
            <div className="flex items-center justify-center mt-auto">
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className={`rounded-full bg-gradient-to-r from-purple-600 to-red-600 text-white font-bold flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition cursor-pointer relative ${
                            isSidebarCollapsed ? "w-10 h-10 text-sm" : "w-14 h-14 text-base"
                        }`}
                        title={user?.email}
                    >
                        {userInitial}
                        {isSpotifyConnected && (
                            <div className={`absolute top-0 ${isSidebarCollapsed ? "left-7 w-3 h-3" : "left-10 w-4 h-4"} bg-green-400 rounded-full border border-black border-2`}></div>
                        )}
                    </button>

                    {showDropdown && (
                        <div className={`absolute bg-gray-900 border border-purple-700 rounded-lg shadow-lg py-3 ${
                            isSidebarCollapsed ? "left-20 w-56" : "left-0 w-64"
                        } bottom-20`}>
                            <div className="px-4 py-3 text-gray-300 text-sm border-b border-purple-700 mb-2">
                                <p className="font-semibold text-white text-base">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDropdown(false);
                                    setShowSettings(true);
                                }}
                                className="w-full text-left px-4 py-2 text-gray-300 hover:bg-purple-700 hover:text-white transition text-sm cursor-pointer"
                            >
                                ⚙️ Settings
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-700 hover:text-white transition text-sm cursor-pointer border-t border-purple-700"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </aside> 
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
        </>
    );
};
