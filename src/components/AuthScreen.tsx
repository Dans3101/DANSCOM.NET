import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export const AuthScreen = () => {
    const { signInWithGoogle, signInWithFacebook } = useAuth();
    const [view, setView] = useState<'welcome' | 'login' | 'signup'>('welcome');

    if (view === 'welcome') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <div className="text-center">
                    <h1 className="text-4xl text-white font-bold mb-12">DANSCOM.NET</h1>
                    <button onClick={() => setView('signup')} className="block w-64 bg-green-500 text-black font-semibold py-3 rounded-full mb-4">Get started</button>
                    <button onClick={() => setView('login')} className="block w-64 border border-gray-600 text-white font-semibold py-3 rounded-full">Log in</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="bg-bg-card p-8 rounded-xl border border-border-custom w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{view === 'signup' ? 'Create Account' : 'Log In'}</h2>
                <div className="flex flex-col gap-3">
                    <button onClick={signInWithGoogle} className="border p-3 rounded-lg">Continue with Google</button>
                    <button onClick={signInWithFacebook} className="border p-3 rounded-lg">Continue with Facebook</button>
                    <button className="border p-3 rounded-lg">Continue with Phone Number</button>
                    <button className="border p-3 rounded-lg">Continue with Email</button>
                </div>
                <button onClick={() => setView('welcome')} className="mt-6 text-sm text-gray-400">Back</button>
            </div>
        </div>
    );
};
