import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return { user, loading };
}

export function useFirebase() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Firebase is initialized when the module is imported
        setIsInitialized(true);
    }, []);

    return { isInitialized };
}
