import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
    isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    useEffect(() => {
        if (window.location.pathname === '/admin') {
            setIsAdmin(true)
        } else {
            setIsAdmin(false)
        }
    }, [window.location.pathname])

    return (
        <AuthContext.Provider
            value={{
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}