"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    bio: string;
    role: string;
    location: string;
    address: {
        country: string;
        city: string;
        postalCode: string;
        employeeId: string;
    };
    photo: string;
}

interface UserContextType {
    user: UserState;
    updateUser: (updates: Partial<UserState>) => void;
    updateAddress: (updates: Partial<UserState["address"]>) => void;
}

const defaultUser: UserState = {
    firstName: "Robert",
    lastName: "Smith",
    email: "admin@college.edu",
    phone: "+1 234 567 8900",
    bio: "System Administrator",
    role: "Administrator",
    location: "Science Building, Dept. of CS",
    address: {
        country: "United States",
        city: "New York, NY",
        postalCode: "10001",
        employeeId: "EMP-2024-001",
    },
    photo: "/images/user/owner.jpg",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserState>(defaultUser);

    // Load from localStorage on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem("userProfile");
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Failed to parse user profile from localStorage", error);
            }
        }
    }, []);

    // Save to localStorage whenever user changes
    React.useEffect(() => {
        localStorage.setItem("userProfile", JSON.stringify(user));
    }, [user]);

    const updateUser = (updates: Partial<UserState>) => {
        setUser((prev) => ({ ...prev, ...updates }));
    };

    const updateAddress = (updates: Partial<UserState["address"]>) => {
        setUser((prev) => ({
            ...prev,
            address: { ...prev.address, ...updates },
        }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser, updateAddress }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
