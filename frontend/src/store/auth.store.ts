import { create } from "zustand";
import * as authService from "../services/auth.service";

type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
}

let loginInProgress = false;
let restoreInProgress = false;

type AuthState = {
    user: null | User;
    isAuthenticated: boolean;
    error: string | null;
    isCheckingAuth: boolean;
    message: string | null;

    signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    restoreSession: () => Promise<void>;
    updateProfile: (firstName?: string, lastName?: string, email?: string) => Promise<void>;
    updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isCheckingAuth: true,
    message: null,

    clearError: () => set({ error: null }),

    signUp: async (firstName, lastName, email, password) => {
        set({ error: null });

        try {
            const response = await authService.signUp(firstName, lastName, email, password);
            if (!response.user?.id || !response.user?.email) {
                throw new Error("Invalid user data from server");
            }

            const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName
            };

            set({ user, isAuthenticated: true, isCheckingAuth: false, message: "Welcome to Moodie!" });

        } catch (error: any) {
            set({ error: error.message || "An error occurred during sign up", isCheckingAuth: false })
        }
    },

    login: async (email, password) => {
        if (loginInProgress) return;

        set({ error: null });
        loginInProgress = true;

        try {
            const response = await authService.login(email, password);

            if (!response.user?.id || !response.user?.email) {
                throw new Error("Invalid user data from server");
            }

            const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName
            };

            set({ user, isAuthenticated: true, isCheckingAuth: false, message: "Welcome back!", error: null });

        } catch (error: any) {
            set({ error: error.message || "An error occurred during login", isCheckingAuth: false });
        } finally {
            loginInProgress = false;
        }
    },

    logout: async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            set({ user: null, error: null, message: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },

    restoreSession: async () => {
        if (restoreInProgress) return;
        restoreInProgress = true;

        try {
            const response = await authService.userInfo();

            if (!response.user?.id || !response.user?.email) {
                throw new Error("Invalid user data");
            }

            const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName
            };
            set({ user, isAuthenticated: true, isCheckingAuth: false });
        } catch (error: any) {
            // 401 means no session - this is normal on first load, don't log it
            if (error.response?.status !== 401 && error.message !== "Network error. Please check your connection.") {
                console.error("Restore session error:", error.message);
            }
            set({ user: null, isAuthenticated: false, isCheckingAuth: false })
        } finally {
            restoreInProgress = false;
        }
    },

    updateProfile: async (firstName, lastName, email) => {
        set({ error: null });

        try {
            const response = await authService.updateUserProfile(firstName, lastName, email);

            if (!response.user?.id || !response.user?.email) {
                throw new Error("Invalid user data from server");
            }

            const user: User = {
                id: response.user.id,
                email: response.user.email,
                firstName: response.user.firstName,
                lastName: response.user.lastName
            };

            set({ user, message: "Profile updated successfully!" });
        } catch (error: any) {
            set({ error: error.message || "Failed to update profile" });
            throw error;
        }
    },

    updatePassword: async (currentPassword, newPassword) => {
        set({ error: null });

        try {
            await authService.updatePassword(currentPassword, newPassword);
            set({ message: "Password updated successfully!" });
        } catch (error: any) {
            set({ error: error.message || "Failed to update password" });
            throw error;
        }
    }

}));
