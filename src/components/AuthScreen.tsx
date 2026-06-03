import { useAuth } from '../contexts/AuthContext';

export const AuthScreen = () => {
  const { signInWithGoogle } = useAuth();
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-app">
      <div className="bg-bg-card p-8 rounded-xl border border-border-custom text-center">
        <h2 className="text-2xl font-bold text-text-p mb-6">Welcome to DANSCOM.NET</h2>
        <button 
          onClick={signInWithGoogle}
          className="bg-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign in with Google
        </button>
        <p className="mt-4 text-text-s text-sm">Other authentication methods need to be enabled in Firebase Console.</p>
      </div>
    </div>
  );
};
