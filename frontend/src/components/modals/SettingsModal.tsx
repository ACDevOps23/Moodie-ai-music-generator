import { useEffect, useState } from "react";
import { useSpotifyStore } from "../../store/spotify.store";
import { useAuthStore } from "../../store/auth.store";

// SettingsModal component for managing Spotify connection and user account settings
interface SettingsModalProps {
    onClose: () => void; // Function to close the modal, passed as a prop from the parent component
}
 
// This component provides a modal interface for users to manage their Spotify connection and account settings, 
// including profile updates and password changes.
export const SettingsModal = ({ onClose }: SettingsModalProps) => {
    const {
        isSpotifyConnected,
        spotifyUsername,
        checkSpotifyConnection,
        initiateSpotifyLogin,
        error: spotifyError,
        clearError: clearSpotifyError
    } = useSpotifyStore(); // Access Spotify connection status and related functions from the Spotify store
    
    const { 
        user, 
        logout, 
        error: authError,
        message,
        updateProfile,
        updatePassword,
        clearError: clearAuthError
    } = useAuthStore(); // Access user data and authentication functions from the auth store

    const [isCheckingSpotify, setIsCheckingSpotify] = useState(false);
    const [activeTab, setActiveTab] = useState<"spotify" | "account">("spotify");
    
    // Account form state
    const [firstName, setFirstName] = useState(user?.firstName || ""); // State for the first name input, initialized with the user's current first name or an empty string if not available
    const [lastName, setLastName] = useState(user?.lastName || ""); // State for the last name input, initialized with the user's current last name or an empty string if not available
    const [email, setEmail] = useState(user?.email || ""); // State for the email input, initialized with the user's current email or an empty string if not available
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false); // State to indicate whether the profile update is in progress
    const [showPasswordForm, setShowPasswordForm] = useState(false); // State to control the visibility of the password change form
    const [currentPassword, setCurrentPassword] = useState(""); // State for the current password input in the password change form
    const [newPassword, setNewPassword] = useState(""); // State for the new password input in the password change form
    const [confirmPassword, setConfirmPassword] = useState(""); // State for the confirm password input in the password change form
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false); // State to indicate whether the password update is in progress

    useEffect(() => { // On component mount, check the Spotify connection status
        setIsCheckingSpotify(true); // Set loading state to true while checking Spotify connection
        checkSpotifyConnection().finally(() => setIsCheckingSpotify(false)); // Check Spotify connection and update the loading state accordingly
    }, []);

    const handleSpotifyLogin = () => { // Function to handle Spotify login, initiates the Spotify login process
        initiateSpotifyLogin(); // Start the Spotify login process, which will redirect the user to Spotify's authentication page
    };

    const handleLogout = async () => { // Function to handle user logout, calls the logout function from the auth store and then closes the modal
        await logout();
        onClose();
    };

    const handleUpdateProfile = async (e: React.SubmitEvent) => { // Function to handle profile updates, calls the updateProfile function from the auth store with the new profile information
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            await updateProfile(firstName, lastName, email);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.SubmitEvent) => { // Function to handle password updates, validates the new password and calls the updatePassword function from the auth store
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        
        setIsUpdatingPassword(true);
        try {
            await updatePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setShowPasswordForm(false);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    const error = activeTab === "spotify" ? spotifyError : authError; // Determine which error message to display based on the active tab (Spotify or Account)
    const clearError = activeTab === "spotify" ? clearSpotifyError : clearAuthError; // Determine which error clearing function to use based on the active tab
    // The component renders a modal with two tabs: one for managing the Spotify connection and another for managing account settings.
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-purple-950 via-red-950 to-black border border-white/20 rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-2xl font-bold text-white">Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("spotify")}
                        className={`flex-1 px-4 py-3 font-medium transition ${
                            activeTab === "spotify"
                                ? "bg-gradient-to-r from-purple-600 to-red-600 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                    >
                        🎵 Spotify
                    </button>
                    <button
                        onClick={() => setActiveTab("account")}
                        className={`flex-1 px-4 py-3 font-medium transition ${
                            activeTab === "account"
                                ? "bg-gradient-to-r from-purple-600 to-red-600 text-white"
                                : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                    >
                        👤 Account
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 flex items-start gap-2">
                            <span className="text-red-400 text-sm flex-1">{error}</span>
                            <button
                                onClick={clearError}
                                className="text-red-400 hover:text-red-300 text-lg flex-shrink-0"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mb-4">
                            <p className="text-green-400 text-sm">{message}</p>
                        </div>
                    )}

                    {/* Spotify Tab */}
                    {activeTab === "spotify" && (
                        <div className="space-y-4">
                            {isCheckingSpotify ? (
                                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                                        <span className="text-white/70 text-sm">Checking connection...</span>
                                    </div>
                                </div>
                            ) : isSpotifyConnected ? (
                                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span className="text-green-400 font-medium">Connected</span>
                                    </div>
                                    {spotifyUsername && (
                                        <p className="text-white/70 text-sm">Logged in as <span className="text-white font-medium">{spotifyUsername}</span></p>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4">
                                    <p className="text-yellow-400 text-sm mb-3">Not connected to Spotify</p>
                                    <button
                                        onClick={handleSpotifyLogin}
                                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 rounded-lg transition"
                                    >
                                        Connect Spotify
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === "account" && (
                        <div className="space-y-4">
                            {/* Profile Info */}
                            {!showPasswordForm && (
                                <form onSubmit={handleUpdateProfile} className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">First Name</label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">Last Name</label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isUpdatingProfile}
                                        className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-2 rounded-lg transition disabled:cursor-not-allowed mt-4"
                                    >
                                        {isUpdatingProfile ? "Updating..." : "Update Profile"}
                                    </button>
                                </form>
                            )}

                            {/* Password Form */}
                            {showPasswordForm && (
                                <form onSubmit={handleUpdatePassword} className="space-y-3">
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            required
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-white/70 mb-1">Confirm Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordForm(false)}
                                            className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-2 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isUpdatingPassword}
                                            className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-2 rounded-lg transition disabled:cursor-not-allowed"
                                        >
                                            {isUpdatingPassword ? "Updating..." : "Update"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Action Buttons */}
                            {!showPasswordForm && (
                                <div className="flex gap-2 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => setShowPasswordForm(true)}
                                        className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 font-medium py-2 rounded-lg transition text-sm"
                                    >
                                        🔐 Change Password
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-medium py-2 rounded-lg transition text-sm"
                                    >
                                        🚪 Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
