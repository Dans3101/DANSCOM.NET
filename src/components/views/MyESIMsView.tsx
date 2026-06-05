import React, { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebaseError';
import { QrCode, Clipboard, Edit2, Trash2, Smartphone, ExternalLink, RefreshCw, Layers } from 'lucide-react';

interface eSIMRecord {
  id: string;
  country: string;
  dataRemaining: string;
  totalData: number;
  consumedData: number;
  validity: string;
  status: 'Active' | 'Expired';
  expiry: string;
  iccid: string;
  name?: string;
}

export const MyESIMsView = ({ activeTab }: { activeTab?: string }) => {
  const [esims, setEsims] = useState<eSIMRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSub, setCurrentSub] = useState<'Active eSIMs' | 'Expired eSIMs'>('Active eSIMs');
  
  // Modals / Details Target
  const [selectedQrEsim, setSelectedQrEsim] = useState<eSIMRecord | null>(null);
  const [installationTab, setInstallationTab] = useState<'qr' | 'ios' | 'android'>('qr');
  const [editEsim, setEditEsim] = useState<eSIMRecord | null>(null);
  const [tempName, setTempName] = useState('');

  // Reset tab when modal opens
  useEffect(() => {
    if (selectedQrEsim) setInstallationTab('qr');
  }, [selectedQrEsim]);

  useEffect(() => {
    if (activeTab === 'Expired eSIMs') {
      setCurrentSub('Expired eSIMs');
    } else {
      setCurrentSub('Active eSIMs');
    }
  }, [activeTab]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const fetchESIMs = async () => {
      try {
        setLoading(true);
        const colSnap = await getDocs(collection(db, 'users', uid, 'esims'));
        
        if (colSnap.empty) {
          // Add default initial eSIMs with appropriate schemas
          const defaultEsims: eSIMRecord[] = [
            { id: 'es-1', country: 'France', dataRemaining: '7.82 GB', totalData: 10, consumedData: 2.18, validity: '30 Days', status: 'Active', expiry: '2026-07-04', iccid: '8904903200000123456F', name: 'Work Holiday Sim' },
            { id: 'es-2', country: 'United States', dataRemaining: '1.20 GB', totalData: 5, consumedData: 3.80, validity: '15 Days', status: 'Active', expiry: '2026-06-18', iccid: '8901260400000456789A', name: 'USA Roadtrip' },
            { id: 'es-3', country: 'Germany', dataRemaining: '0.00 GB', totalData: 3, consumedData: 3.00, validity: '7 Days', status: 'Expired', expiry: '2026-05-12', iccid: '8949020400000246810B', name: 'Berlin Conference' }
          ];
          for (const item of defaultEsims) {
            await setDoc(doc(db, 'users', uid, 'esims', item.id), item);
          }
          setEsims(defaultEsims);
        } else {
          setEsims(colSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as eSIMRecord)));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `/users/${uid}/esims`);
      } finally {
        setLoading(false);
      }
    };

    fetchESIMs();
  }, []);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEsim || !auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'esims', editEsim.id), { name: tempName });
      setEsims(prev => prev.map(item => item.id === editEsim.id ? { ...item, name: tempName } : item));
      setEditEsim(null);
      alert('eSIM label renamed successfully.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `/users/${uid}/esims/${editEsim.id}`);
    }
  };

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete/release this eSIM profile? This cannot be undone.");
    if (!isConfirmed || !auth.currentUser) return;
    const uid = auth.currentUser.uid;

    try {
      await deleteDoc(doc(db, 'users', uid, 'esims', id));
      setEsims(prev => prev.filter(item => item.id !== id));
      alert('eSIM profile safely released and deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `/users/${uid}/esims/${id}`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('ICCID copied to clipboard!');
  };

  if (loading) {
    return <div className="text-text-p p-8 text-center bg-bg-app min-h-screen">Loading eSIM inventory...</div>;
  }

  const filteredEsims = esims.filter(e => currentSub === 'Active eSIMs' ? e.status === 'Active' : e.status === 'Expired');

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My eSIM Inventory</h2>
          <p className="text-text-s text-sm mt-1">Acquire and manage physical SIM-free roaming profiles.</p>
        </div>
        <div className="flex gap-2 bg-text-s/5 p-1 rounded-lg border border-border-custom bg-bg-card">
          <button
            onClick={() => setCurrentSub('Active eSIMs')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${currentSub === 'Active eSIMs' ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
          >
            Active Cellular Profiles
          </button>
          <button
            onClick={() => setCurrentSub('Expired eSIMs')}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition ${currentSub === 'Expired eSIMs' ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
          >
            Terminated / Expired
          </button>
        </div>
      </div>

      {filteredEsims.length === 0 ? (
        <div className="bg-bg-card p-12 text-center rounded-2xl border border-border-custom max-w-lg mx-auto my-12">
          <Layers className="mx-auto mb-4 text-text-s" size={36} />
          <h3 className="text-lg font-bold mb-1">No eSIMs found</h3>
          <p className="text-text-s text-xs">You do not have any {currentSub === 'Active eSIMs' ? 'active' : 'expired'} cellular profiles registered.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEsims.map(e => {
            const consumedPct = Math.min((e.consumedData / e.totalData) * 100, 100);
            return (
              <div key={e.id} className="bg-bg-card border border-border-custom p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-text-p">{e.name || e.country}</h3>
                    <p className="text-xs text-text-s mt-0.5">{e.country} Pass • {e.validity}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase border ${e.status === 'Active' ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/10' : 'bg-red-950/40 text-red-500 border-red-500/10'}`}>
                    {e.status}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between items-center text-xs text-text-s mb-1">
                    <span>Data Used</span>
                    <span className="font-semibold text-text-p">{e.consumedData} GB / {e.totalData} GB ({consumedPct.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-900/60 h-2.5 rounded-full overflow-hidden border border-border-custom/50">
                    <div className="bg-accent h-full transition-all duration-300" style={{ width: `${consumedPct}%` }} />
                  </div>
                </div>

                <div className="text-xs space-y-2 border-t border-border-custom/40 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-s">ICCID:</span>
                    <div className="flex items-center gap-1.5 font-mono text-text-p">
                      <span>{e.iccid}</span>
                      <button onClick={() => copyToClipboard(e.iccid)} className="hover:text-accent font-sans text-[10px] transition"><Clipboard size={12} /></button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-s">Expiry Date:</span>
                    <span className="font-medium text-text-p">{e.expiry}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border-custom/40">
                  <button 
                    onClick={() => setSelectedQrEsim(e)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-900 hover:bg-neutral-800 border border-border-custom py-2 px-3 rounded-lg text-xs font-semibold"
                  >
                    <QrCode size={13} /> Installation QR
                  </button>
                  <button 
                    onClick={() => { setEditEsim(e); setTempName(e.name || ''); }}
                    className="flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 border border-border-custom p-2 rounded-lg text-xs font-semibold"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button 
                    onClick={() => handleDelete(e.id)}
                    className="flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 border border-border-custom p-2 text-text-s hover:text-red-400 rounded-lg text-xs font-semibold"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal Overlay */}
      {selectedQrEsim && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-bg-card border border-border-custom rounded-2xl p-8 max-w-sm w-full space-y-6 text-center">
            <div>
              <h3 className="font-bold text-xl">{selectedQrEsim.country} Setup</h3>
              <div className="flex justify-center gap-2 mt-4 bg-neutral-900 p-1 rounded-lg">
                <button onClick={() => setInstallationTab('qr')} className={`px-3 py-1 rounded text-xs font-bold ${installationTab === 'qr' ? 'bg-accent text-white' : 'text-text-s'}`}>QR</button>
                <button onClick={() => setInstallationTab('ios')} className={`px-3 py-1 rounded text-xs font-bold ${installationTab === 'ios' ? 'bg-accent text-white' : 'text-text-s'}`}>iOS</button>
                <button onClick={() => setInstallationTab('android')} className={`px-3 py-1 rounded text-xs font-bold ${installationTab === 'android' ? 'bg-accent text-white' : 'text-text-s'}`}>Android</button>
              </div>
            </div>
            
            {installationTab === 'qr' && (
              <div className="space-y-4">
                <div className="aspect-square bg-white p-4 rounded-xl max-w-44 mx-auto border border-border-custom">
                  <div className="w-full h-full bg-gradient-radial from-neutral-900 to-black rounded-lg flex items-center justify-center text-white text-[10px] font-mono select-none">
                    [ SEC-QR-TOKEN ]
                  </div>
                </div>
                <div className="text-xs text-text-s border-t border-border-custom pt-4 text-left space-y-2">
                  <p>Manual details:</p>
                  <div className="p-2 bg-neutral-900 rounded font-mono text-[9px] truncate selection:bg-accent border border-border-custom">
                    SM-DP+ Server: rsp.danscom.net
                  </div>
                </div>
              </div>
            )}

            {installationTab === 'ios' && (
              <div className="text-left text-xs text-text-p space-y-2 max-h-64 overflow-y-auto">
                <p>1. Go to <strong>Settings</strong> &gt; <strong>Cellular</strong>.</p>
                <p>2. Tap <strong>Add eSIM</strong>.</p>
                <p>3. Choose <strong>Use QR Code</strong>.</p>
                <p>4. Scan the QR code shown here or enter details manually.</p>
              </div>
            )}

            {installationTab === 'android' && (
              <div className="text-left text-xs text-text-p space-y-2 max-h-64 overflow-y-auto">
                <p>1. Go to <strong>Settings</strong> &gt; <strong>Network & Internet</strong>.</p>
                <p>2. Tap <strong>SIMs</strong> &gt; <strong>Add SIM</strong>.</p>
                <p>3. Select <strong>Download a SIM instead?</strong>.</p>
                <p>4. Point camera to scan QR or enter details manually.</p>
              </div>
            )}

            <button 
              onClick={() => setSelectedQrEsim(null)}
              className="w-full bg-accent text-white py-2 px-4 rounded-lg text-xs font-semibold"
            >
              Dismiss Setup Code
            </button>
          </div>
        </div>
      )}

      {/* Rename Modal Overlay */}
      {editEsim && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleRename} className="bg-bg-card border border-border-custom rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="font-bold text-lg">Rename cellular profile label</h3>
            <input
              type="text"
              required
              className="w-full bg-neutral-900 border border-border-custom rounded-lg p-3 text-sm focus:outline-none"
              placeholder="e.g. Europe Roaming"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setEditEsim(null)}
                className="flex-1 bg-neutral-900 border border-border-custom py-2 px-3 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-accent text-white py-2 px-3 rounded-lg text-xs font-semibold"
              >
                Save Rename
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
