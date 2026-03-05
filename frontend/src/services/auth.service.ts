import AUTH_API from "../constants/api";
import axios from "axios";

axios.defaults.withCredentials = true;

// Track if refresh is in progress to avoid multiple refresh calls
let isRefreshing = false;
let refreshSubscribers: Array<() => void> = [];

const onRefreshed = (callback: () => void) => {
    refreshSubscribers.push(callback);
};

const notifyRefreshed = () => {
    refreshSubscribers.forEach((callback) => callback());
    refreshSubscribers = [];
};

// Refresh JWT token
const refreshToken = async () => {
    try {
        if (!AUTH_API) throw new Error("Server configuration error");
        const response = await axios.post(`${AUTH_API}/auth/refresh`);
        return response.status === 200;
    } catch (error) {
        console.error("Token refresh failed:", error);
        return false;
    }
};

// Add response interceptor to handle 401 and refresh token
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Check if this is a refresh endpoint call - don't retry refresh calls
            if (originalRequest.url?.includes("/auth/refresh")) {
                return Promise.reject(error);
            }

            // If already refreshing, wait for refresh to complete
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    onRefreshed(() => {
                        resolve(axios(originalRequest));
                    });
                    // If refresh queue gets too large, reject to avoid memory leak
                    setTimeout(() => reject(error), 5000);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                const refreshed = await refreshToken();

                if (refreshed) {
                    isRefreshing = false;
                    notifyRefreshed();
                    // Retry original request with new token
                    return axios(originalRequest);
                } else {
                    // Refresh failed, don't retry original request
                    isRefreshing = false;
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                isRefreshing = false;
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper function to map API errors to user-friendly messages
const getErrorMessage = (error: any): string => {
    if (error.response?.data?.message) {
        const msg = error.response.data.message.toLowerCase();
        if (msg.includes("already exists")) return "This email is already registered. Please sign in instead.";
        if (msg.includes("no username")) return "Email not found. Please check and try again.";
        if (msg.includes("invalid password")) return "Password is incorrect. Please try again.";
        if (msg.includes("no user data")) return "Invalid response from server.";
    }
    if (error.message === "Network Error") return "Network error. Please check your connection.";
    return error.response?.data?.message || "An error occurred. Please try again.";
};

const login = async (email: string, password: string) => {
    // Validation
    if (!email) throw new Error("Please enter your email");
    if (!password) throw new Error("Please enter your password");
    if (!AUTH_API) throw new Error("Server configuration error");

    try {
        const response = await axios.post(`${AUTH_API}/auth/login`, { email, password });

        const data = response.data;
        const user = data.user;
        
        if (!user || (!user._id && !user.id) || !user.email) {
            throw new Error("Invalid response from server");
        }
        
        return { 
            user: {
                id: user._id || user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    } catch (error: any) {
        throw new Error(getErrorMessage(error));
    }
};

const signUp = async (
    firstName: string, 
    lastName: string, 
    email: string, 
    password: string) => {

    // Validation
    if (!firstName) throw new Error("Please enter your first name");
    if (!lastName) throw new Error("Please enter your last name");
    if (!email) throw new Error("Please enter your email");
    if (!password) throw new Error("Please enter a password");
    if (!AUTH_API) throw new Error("Server configuration error");

    try {
        const response = await axios.post(`${AUTH_API}/auth/sign-up`, {
            firstName,
            lastName,
            email,
            password,
        });
        
        const data = response.data;
        const user = data.user;
        
        if (!user || (!user._id && !user.id) || !user.email) {
            throw new Error("Invalid response from server");
        }
        
        return { 
            user: {
                id: user._id || user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    } catch (error: any) {
        throw new Error(getErrorMessage(error));
    }
};

const logout = async () => {
    try {
        if (!AUTH_API) throw new Error("Server configuration error");
        await axios.post(`${AUTH_API}/auth/logout`);
    } catch (error) {
        console.error("Logout error:", error);
        // Still clear local state even if logout request fails
    }
};

const userInfo = async() => {
    try {
        if (!AUTH_API) throw new Error("Server configuration error");
        const response = await axios.get<any>(`${AUTH_API}/user/me`);
        const data = response.data;
        
        // The /user/me endpoint returns { success: true, data: user }
        const user = data.data || data.user;
        
        if (!user || (!user._id && !user.id) || !user.email) {
            throw new Error("Invalid user data in response");
        }
        
        // Normalize to match the expected structure
        return {
            user: {
                id: user._id || user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    } catch (error: any) {
        throw new Error(error.message || "Failed to fetch user info");
    }
}

const updateUserProfile = async (
    firstName?: string,
    lastName?: string,
    email?: string
) => {
    try {
        if (!AUTH_API) throw new Error("Server configuration error");
        
        const response = await axios.put<any>(`${AUTH_API}/user/update-profile`, {
            firstName,
            lastName,
            email
        });
        
        const data = response.data;
        const user = data.data || data.user;
        
        if (!user || (!user._id && !user.id) || !user.email) {
            throw new Error("Invalid user data in response");
        }
        
        return {
            user: {
                id: user._id || user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
            }
        };
    } catch (error: any) {
        throw new Error(getErrorMessage(error));
    }
}

const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
        if (!AUTH_API) throw new Error("Server configuration error");
        
        const response = await axios.post<any>(`${AUTH_API}/user/update-password`, {
            currentPassword,
            newPassword
        });
        
        return { success: true, message: response.data?.message || "Password updated successfully" };
    } catch (error: any) {
        throw new Error(getErrorMessage(error));
    }
}

export { login, signUp, logout, userInfo, updateUserProfile, updatePassword };