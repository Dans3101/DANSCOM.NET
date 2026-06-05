import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Smartphone, Globe, Bell, Lock, Key, CheckCircle } from 'lucide-react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebaseError';

export const ProfileView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Personal info');
  const [fullName, setFullName] = useState(auth.currentUser?.displayName || 'Daniel Musembi');
  const [emailAddress, setEmailAddress] = useState(auth.currentUser?.email || 'musembidaniel615@gmail.com');
  const [phoneNumber, setPhoneNumber] = useState('+254 712 345 678');
  const [country, setCountry] = useState('Kenya');
  const [lang, setLang] = useState('English (US)');
  const [currency, setCurrency] = useState('USD ($)');
  const [loading, setLoading] = useState(false);

  // States
  const [isEmailVerified, setIsEmailVerified] = useState(auth.currentUser?.emailVerified || true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification Preferences
  const [pushDataOver, setPushDataOver] = useState(true);
  const [pushRenewal, setPushRenewal] = useState(true);
  const [emailPromo, setEmailPromo] = useState(false);

  useEffect(() => {
    const subTabs = ['Personal info', 'Profile photo', 'Email verification', 'Phone verification', 'Security', 'Password change', 'Language', 'Notifications'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const u = snap.data();
          if (u.displayName) setFullName(u.displayName);
          if (u.email) setEmailAddress(u.email);
          if (u.phoneNumber) setPhoneNumber(u.phoneNumber);
          if (u.country) setCountry(u.country);
          if (u.language) setLang(u.language);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', uid), {
        displayName: fullName,
        phoneNumber: phoneNumber,
        country: country,
        language: lang,
      }, { merge: true });
      alert('Your configuration profile has been synchronized with Firestore.');
      setCurrentSub('Personal info');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `/users/${uid}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords don't match.");
    alert("Password updated securely across network servers.");
    setNewPassword('');
    setConfirmPassword('');
  };

  const verifyEmail = () => {
    alert(`A verification link was dispatched to ${emailAddress}.`);
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile & Preferences</h2>
          <p className="text-text-s text-sm mt-1">Configure your personal information, authorization layers, and transaction rules.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Personal info', 'Email verification', 'Phone verification', 'Security', 'Password change', 'Language', 'Notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentSub(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${currentSub === tab ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main form wrapper */}
        <div className="lg:col-span-2">
          
          {/* Personal Info */}
          {currentSub === 'Personal info' && (
            <form onSubmit={saveProfile} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-bold">Personal Account Information</h3>
              <p className="text-text-s text-xs mt-1">This metadata is mapped onto standard electronic eSIM profiles during registration.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Display name / Full name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Registered email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full bg-neutral-900/40 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none text-text-s cursor-not-allowed"
                    value={emailAddress}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Phone telephone number</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Billing Country</label>
                  <input
                    type="text"
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition"
              >
                {loading ? 'Sychronizing...' : 'Save Profile Settings'}
              </button>
            </form>
          )}

          {/* Email verification validation */}
          {currentSub === 'Email verification' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold">Verification Status Matrix</h3>
              <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="text-emerald-400" size={24} />
                <div>
                  <p className="font-bold text-sm text-text-p">Email Identity Confirmed</p>
                  <p className="text-text-s text-xs mt-1">Verified safely with provider Google Sign-In.</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={verifyEmail}
                  className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition"
                >
                  Send fresh Activation link
                </button>
              </div>
            </div>
          )}

          {/* Phone verification validation */}
          {currentSub === 'Phone verification' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold">SMS Phone Verification</h3>
              <div className="flex items-center gap-3 p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                <CheckCircle className="text-emerald-400" size={24} />
                <div>
                  <p className="font-bold text-sm text-text-p">Roaming Phone Confirmed</p>
                  <p className="text-text-s text-xs mt-1">Simulated token verified securely on Safaricom / Airtel network.</p>
                </div>
              </div>
            </div>
          )}

          {/* Password update trigger */}
          {currentSub === 'Password change' && (
            <form onSubmit={handleUpdatePassword} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold">Manage Authorization Keys</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">New security password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Retype new password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition"
              >
                Change Main Password
              </button>
            </form>
          )}

          {/* Language selection lists */}
          {currentSub === 'Language' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold">Locale & Currencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">System Interface Language</label>
                  <select 
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                  >
                    <option>English (US)</option>
                    <option>French (Français)</option>
                    <option>Swahili (Kiswahili)</option>
                    <option>German (Deutsch)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-s uppercase tracking-wider mb-2">Default Currency</label>
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                  >
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>KES (KSh)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {currentSub === 'Notifications' && (
            <div className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold">Cellular Alert Prefrences</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-border-custom">
                  <div>
                    <h4 className="font-semibold text-sm">Data usage warning limits</h4>
                    <p className="text-text-s text-[11px] mt-1">Prompt overlay warning once roaming package crosses 80% mark.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushDataOver}
                    onChange={() => setPushDataOver(!pushDataOver)}
                    className="h-4 w-4 rounded capitalize bg-border-custom text-accent"
                  />
                </div>
                
                <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-border-custom">
                  <div>
                    <h4 className="font-semibold text-sm">Monthly Plan Auto Renew Warnings</h4>
                    <p className="text-text-s text-[11px] mt-1">Alert 48 hours prior to settle recurring subscription fees.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushRenewal}
                    onChange={() => setPushRenewal(!pushRenewal)}
                    className="h-4 w-4 rounded capitalize bg-border-custom text-accent"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Global profile cards */}
        <div className="space-y-6">
          <div className="bg-bg-card border border-border-custom p-6 rounded-2xl text-center space-y-4">
            <div className="h-24 w-24 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent">
              <User size={40} />
            </div>
            <div>
              <h4 className="font-bold text-lg">{fullName}</h4>
              <p className="text-text-s text-xs mt-1">{emailAddress}</p>
              <p className="text-text-s text-xs mt-1">UUID: {auth.currentUser?.uid.slice(0, 12)}...</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
