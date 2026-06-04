import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { OperationType, handleFirestoreError } from '../../lib/firebaseError';
import { CreditCard, DollarSign, ArrowUpRight, ArrowDownLeft, Receipt, CheckCircle, RefreshCw, AlertCircle, Ban, ArrowLeft, Download, Eye, Plus, Trash2 } from 'lucide-react';

interface SavedMethod {
  id: string;
  type: string; // 'Visa' | 'Mastercard' | 'M-Pesa' | 'PayPal' | 'Stripe' | 'Apple Pay' | 'Google Pay' | 'Bank transfer'
  last4?: string;
  identifier: string; // e.g. "email", "+254...", "6789"
  isDefault: boolean;
}

interface Subscription {
  id: string;
  name: string;
  data: string;
  price: number;
  autoRenew: boolean;
  expiry: string;
}

interface BillingInvoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Refunded' | 'Pending';
  paymentMethod: string;
}

export const PaymentsView = ({ activeTab }: { activeTab: string }) => {
  const [balance, setBalance] = useState<number>(45.00);
  const [oneClick, setOneClick] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // Modals / Inputs
  const [depositAmount, setDepositAmount] = useState<string>('20.00');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('25.00');
  const [selectedGateway, setSelectedGateway] = useState<string>('Stripe');
  const [oneClickProcessing, setOneClickProcessing] = useState(false);
  
  // Custom interactive details for deposit
  const [cardNo, setCardNo] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [phoneNo, setPhoneNo] = useState(''); // for M-Pesa
  const [paypalEmail, setPaypalEmail] = useState('');
  
  // Invoice state
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  
  // Sub-tabs
  const [currentSubTab, setCurrentSubTab] = useState<string>('Wallet balance');

  // Sync sub-tabs with Sidebar selection
  useEffect(() => {
    const paymentTabs = [
      'Wallet balance', 'Deposit funds', 'Withdraw funds', 
      'Payment history', 'Invoices', 'Subscription payments', 'Saved methods'
    ];
    if (paymentTabs.includes(activeTab)) {
      setCurrentSubTab(activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;

    const loadBillingData = async () => {
      try {
        setLoading(true);
        const configRef = doc(db, 'users', uid, 'billing', 'config');
        const configSnap = await getDoc(configRef);

        let currentBalance = 45.00;
        let isOneClick = true;

        if (configSnap.exists()) {
          const config = configSnap.data();
          currentBalance = config.balance !== undefined ? config.balance : 45.00;
          isOneClick = config.oneClickEnabled !== undefined ? config.oneClickEnabled : true;
          setBalance(currentBalance);
          setOneClick(isOneClick);
        } else {
          // Initialize Config In Firestore
          await setDoc(configRef, { balance: 45.00, oneClickEnabled: true });
        }

        // Transactions
        const txSnap = await getDocs(collection(db, 'users', uid, 'transactions'));
        if (txSnap.empty) {
          const defaultTx = [
            { title: 'Global 10GB Plan Renewal', amount: -25.00, type: 'Subscription', method: 'Saved Visa (4321)', date: '2026-06-01', status: 'Completed', invoiceId: 'INV-02492' },
            { title: 'Funds Added', amount: 50.00, type: 'Deposit', method: 'M-Pesa (+2547***)', date: '2026-05-24', status: 'Completed', invoiceId: 'INV-02381' },
            { title: 'Refund issued: USA 5GB Plan', amount: 15.00, type: 'Refund', method: 'Refund to Wallet', date: '2026-05-18', status: 'Completed', invoiceId: 'INV-01923' },
          ];
          for (const tx of defaultTx) {
            await addDoc(collection(db, 'users', uid, 'transactions'), tx);
          }
          setTransactions(defaultTx);
        } else {
          setTransactions(txSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }

        // Subscriptions
        const subSnap = await getDocs(collection(db, 'users', uid, 'subscriptions'));
        if (subSnap.empty) {
          const defaultSubs = [
            { id: 'sub-1', name: 'Global Unlimited Monthly', data: 'Unlimited', price: 45.00, autoRenew: true, expiry: '2026-07-04' },
            { id: 'sub-2', name: 'USA Traveler Pass', data: '10 GB', price: 18.00, autoRenew: false, expiry: '2026-06-25' },
          ];
          for (const sub of defaultSubs) {
            await setDoc(doc(db, 'users', uid, 'subscriptions', sub.id), sub);
          }
          setSubscriptions(defaultSubs);
        } else {
          setSubscriptions(subSnap.docs.map(d => ({ id: d.id, ...d.data() } as Subscription)));
        }

        // Saved Methods
        const methodSnap = await getDocs(collection(db, 'users', uid, 'savedMethods'));
        if (methodSnap.empty) {
          const defaultMethods = [
            { id: 'm-1', type: 'Visa', last4: '4321', identifier: 'Daniel Musembi', isDefault: true },
            { id: 'm-2', type: 'M-Pesa', identifier: '+254712***789', isDefault: false },
          ];
          for (const m of defaultMethods) {
            await setDoc(doc(db, 'users', uid, 'savedMethods', m.id), m);
          }
          setSavedMethods(defaultMethods);
        } else {
          setSavedMethods(methodSnap.docs.map(d => ({ id: d.id, ...d.data() } as SavedMethod)));
        }

        // Invoices
        const invSnap = await getDocs(collection(db, 'users', uid, 'invoices'));
        if (invSnap.empty) {
          const defaultInvoices: BillingInvoice[] = [
            { id: 'INV-02492', date: '2026-06-01', description: 'Global 10GB Monthly Cycle Renewal', amount: 25.00, status: 'Paid', paymentMethod: 'Saved Visa (4321)' },
            { id: 'INV-02381', date: '2026-05-24', description: 'Wallet credit top-up', amount: 50.00, status: 'Paid', paymentMethod: 'M-Pesa Mobile Money' },
            { id: 'INV-01923', date: '2026-05-18', description: 'North America Traveler Pass Pack', amount: 15.00, status: 'Refunded', paymentMethod: 'Wallet Balance' },
          ];
          for (const inv of defaultInvoices) {
            await setDoc(doc(db, 'users', uid, 'invoices', inv.id), inv);
          }
          setInvoices(defaultInvoices);
        } else {
          setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() } as BillingInvoice)));
        }

      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `/users/${uid}/billing`);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const amountVal = parseFloat(depositAmount);
    if (!amountVal || amountVal <= 0) return alert('Enter a valid deposit amount.');

    setOneClickProcessing(true);
    try {
      const newBalance = balance + amountVal;
      
      // Update config
      await updateDoc(doc(db, 'users', uid, 'billing', 'config'), { balance: newBalance });
      setBalance(newBalance);

      // Add to transactions
      const methodDesc = selectedGateway === 'M-Pesa' ? `M-Pesa (${phoneNo || '+2547...'})` : 
                         selectedGateway === 'PayPal' ? `PayPal (${paypalEmail || 'PayPal account'})` :
                         selectedGateway === 'Bank transfer' ? 'Bank Transfer' :
                         `${selectedGateway} (****${cardNo.slice(-4) || '7103'})`;

      const randInv = 'INV-' + Math.floor(10000 + Math.random() * 90000);
      const newTx = {
        title: 'Wallet Credit Top-Up',
        amount: amountVal,
        type: 'Deposit',
        method: methodDesc,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        invoiceId: randInv
      };

      await addDoc(collection(db, 'users', uid, 'transactions'), newTx);
      setTransactions(prev => [newTx, ...prev]);

      // Add corresponding Invoice
      const newInv: BillingInvoice = {
        id: randInv,
        date: new Date().toISOString().split('T')[0],
        description: 'Wallet top-up transaction credit',
        amount: amountVal,
        status: 'Paid',
        paymentMethod: methodDesc
      };
      await setDoc(doc(db, 'users', uid, 'invoices', randInv), newInv);
      setInvoices(prev => [newInv, ...prev]);

      // Add payment method if not exists
      const idStr = 'm-' + Date.now();
      const newMethod: SavedMethod = {
        id: idStr,
        type: selectedGateway,
        last4: cardNo ? cardNo.slice(-4) : undefined,
        identifier: selectedGateway === 'M-Pesa' ? phoneNo : selectedGateway === 'PayPal' ? paypalEmail : 'Registered Customer',
        isDefault: savedMethods.length === 0,
      };
      
      if (!savedMethods.some(m => m.type === selectedGateway && m.identifier === newMethod.identifier)) {
        await setDoc(doc(db, 'users', uid, 'savedMethods', idStr), newMethod);
        setSavedMethods(prev => [...prev, newMethod]);
      }

      alert(`Successfully credited $${amountVal.toFixed(2)} to your wallet balance.`);
      
      // Reset input fields
      setCardNo('');
      setPhoneNo('');
      setPaypalEmail('');
      setCurrentSubTab('Wallet balance');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `/users/${uid}/billing`);
    } finally {
      setOneClickProcessing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const amountVal = parseFloat(withdrawAmount);
    if (!amountVal || amountVal <= 0) return alert('Enter a valid withdrawal amount.');
    if (amountVal > balance) return alert('Insufficient funds in wallet.');

    setOneClickProcessing(true);
    try {
      const newBalance = balance - amountVal;
      await updateDoc(doc(db, 'users', uid, 'billing', 'config'), { balance: newBalance });
      setBalance(newBalance);

      const randInv = 'INV-' + Math.floor(10000 + Math.random() * 90000);
      const newTx = {
        title: 'Wallet Withdrawal',
        amount: -amountVal,
        type: 'Withdraw',
        method: `${selectedGateway} payout`,
        date: new Date().toISOString().split('T')[0],
        status: 'Completed',
        invoiceId: randInv
      };
      await addDoc(collection(db, 'users', uid, 'transactions'), newTx);
      setTransactions(prev => [newTx, ...prev]);

      alert(`Successfully requested withdrawal of $${amountVal.toFixed(2)}.`);
      setCurrentSubTab('Wallet balance');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `/users/${uid}/billing`);
    } finally {
      setOneClickProcessing(false);
    }
  };

  const toggleAutoRenew = async (subId: string, currentStatus: boolean) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'subscriptions', subId), { autoRenew: !currentStatus });
      setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, autoRenew: !currentStatus } : s));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `/users/${uid}/subscriptions/${subId}`);
    }
  };

  const toggleOneClickSetting = async () => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'billing', 'config'), { oneClickEnabled: !oneClick });
      setOneClick(!oneClick);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `/users/${uid}/billing/config`);
    }
  };

  const handleRequestRefund = async (invoice: BillingInvoice) => {
    const reason = prompt("Describe the reason for your refund request:");
    if (reason === null) return;
    if (!reason.trim()) return alert("Refund reason is mandatory.");

    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    
    try {
      // Create transaction record for Refund pending
      const randInv = 'INV-' + Math.floor(10000 + Math.random() * 90000);
      const refundDoc = {
        title: `Refund Request: ${invoice.id}`,
        amount: invoice.amount,
        type: 'Refund',
        method: 'Wallet Credit (Processing)',
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        invoiceId: invoice.id
      };
      
      await addDoc(collection(db, 'users', uid, 'transactions'), refundDoc);
      // Update local transaction array
      setTransactions(prev => [refundDoc, ...prev]);

      // Mark original invoice status
      await updateDoc(doc(db, 'users', uid, 'invoices', invoice.id), { status: 'Refunded' });
      setInvoices(prev => prev.map(i => i.id === invoice.id ? { ...i, status: 'Refunded' } : i));

      // Credit wallet immediately for friendly user feedback
      const newBal = balance + invoice.amount;
      await updateDoc(doc(db, 'users', uid, 'billing', 'config'), { balance: newBal });
      setBalance(newBal);

      alert(`Your refund for invoice ${invoice.id} was processed. $${invoice.amount.toFixed(2)} has been credited back to your wallet.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `/users/${uid}/transactions`);
    }
  };

  const deleteSavedMethod = async (id: string) => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    try {
      // In firestore, delete method
      await setDoc(doc(db, 'users', uid, 'savedMethods', id), {}, { merge: false });
      setSavedMethods(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `/users/${uid}/savedMethods/${id}`);
    }
  };

  if (loading) {
    return <div className="text-text-p p-8 text-center bg-bg-app min-h-screen">Loading billing records...</div>;
  }

  // Payment Gateways available worldwide
  const gateways = [
    { name: 'Stripe', label: 'Stripe Credit Card', extra: 'Visa, MasterCard, Amex etc.' },
    { name: 'M-Pesa', label: 'Lipa na M-Pesa', extra: 'East African Mobile Money' },
    { name: 'PayPal', label: 'PayPal Worldwide', extra: 'Instant checkout login' },
    { name: 'Apple Pay', label: 'Apple Pay Mobile', extra: 'iOS & macOS secure top-up' },
    { name: 'Google Pay', label: 'Google Pay Mobile', extra: 'Android secure checkout' },
    { name: 'Bank transfer', label: 'International Bank Wire', extra: 'Requires 1-3 business days' }
  ];

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments & Billing</h2>
          <p className="text-text-s text-sm mt-1">Manage wallet funds, invoices, refund requests, and recurring eSIM plans.</p>
        </div>
        <div className="flex gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Wallet balance', 'Deposit funds', 'Withdraw funds', 'Invoices', 'Subscription payments', 'Saved methods'].map((tab) => (
            <button
              key={tab}
              onClick={() => setCurrentSubTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${currentSubTab === tab ? 'bg-accent text-white' : 'text-text-s hover:text-text-p'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {selectedInvoice ? (
        <div className="bg-bg-card border border-border-custom rounded-2xl p-8 max-w-2xl mx-auto my-6 animate-fade-in">
          <button className="flex items-center gap-2 text-xs text-text-s hover:text-text-p mb-6 font-medium" onClick={() => setSelectedInvoice(null)}>
            <ArrowLeft size={14} /> Back to Invoices
          </button>
          
          <div className="flex justify-between items-start border-b border-border-custom pb-6 mb-6">
            <div>
              <h3 className="text-2xl font-bold tracking-wide text-accent">DANSCOM.NET</h3>
              <p className="text-xs text-text-s mt-1">Unified Connectivity Solutions Worldwide</p>
            </div>
            <div className="text-right">
              <h4 className="font-semibold text-lg">{selectedInvoice.id}</h4>
              <p className="text-xs text-text-s mt-1">Date: {selectedInvoice.date}</p>
              <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full ${selectedInvoice.status === 'Paid' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-red-950/40 text-red-400 border border-red-500/20'}`}>
                {selectedInvoice.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 text-sm mb-6 pb-6 border-b border-border-custom">
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-text-s mb-2">Billed To</h5>
              <p className="font-medium">{auth.currentUser?.displayName || 'Valued User'}</p>
              <p className="text-text-s text-xs mt-1">{auth.currentUser?.email}</p>
            </div>
            <div>
              <h5 className="font-bold text-xs uppercase tracking-wider text-text-s mb-2">Payment Info</h5>
              <p className="text-xs font-medium">{selectedInvoice.paymentMethod}</p>
              <p className="text-xs text-text-s mt-1">Transaction type: Settlement</p>
            </div>
          </div>

          <div className="mb-6 mb-6">
            <h5 className="font-bold text-xs uppercase tracking-wider text-text-s mb-3">Line items</h5>
            <div className="flex justify-between items-center text-sm mb-2 font-medium">
              <span>{selectedInvoice.description}</span>
              <span>${selectedInvoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-border-custom pt-3 mt-3 font-semibold text-lg">
              <span>Total Paid</span>
              <span className="text-accent">${selectedInvoice.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button 
              className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-border-custom px-4 py-2 rounded-lg text-xs font-semibold"
              onClick={() => window.print()}
            >
              <Download size={14} /> Print / Save PDF
            </button>
            {selectedInvoice.status === 'Paid' && (
              <button 
                className="bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 px-4 py-2 rounded-lg text-xs font-semibold"
                onClick={() => handleRequestRefund(selectedInvoice)}
              >
                Request Refund
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Workspace */}
          <div className="lg:col-span-2">
            
            {/* Wallet balance view */}
            {currentSubTab === 'Wallet balance' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-neutral-900 to-black border border-border-custom p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="space-y-2 z-10">
                    <span className="text-xs text-text-s font-semibold uppercase tracking-wider">Available Wallet Balance</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-text-s font-semibold mb-2">$</span>
                      <span className="text-5xl font-extrabold tracking-tight">{balance.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-text-s flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" /> Fully synchronized across regions
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4 md:mt-0 z-10">
                    <button 
                      onClick={() => setCurrentSubTab('Deposit funds')}
                      className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-white font-semibold px-4 py-2.5 rounded-lg text-xs transition"
                    >
                      <Plus size={14} /> Add Funds
                    </button>
                    <button 
                      onClick={() => setCurrentSubTab('Withdraw funds')}
                      className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 border border-border-custom text-text-p font-semibold px-4 py-2.5 rounded-lg text-xs transition"
                    >
                      <ArrowUpRight size={14} /> Withdraw
                    </button>
                  </div>
                </div>

                {/* Sub-section: Fast One-Click Security Settings */}
                <div className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">One-Click Payments Security</h4>
                      <p className="text-text-s text-xs mt-1">Skip security verification and buy eSIMs directly with your wallet balance instantly.</p>
                    </div>
                    <button 
                      onClick={toggleOneClickSetting} 
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${oneClick ? 'bg-accent' : 'bg-neutral-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${oneClick ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Transaction history */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center gap-1.5">
                     Recent Billing Activity
                  </h4>
                  <div className="bg-bg-card border border-border-custom rounded-xl divide-y divide-border-custom overflow-hidden">
                    {transactions.length === 0 ? (
                      <p className="text-text-s p-6 text-sm">No transaction records found.</p>
                    ) : (
                      transactions.map((tx, idx) => (
                        <div key={idx} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-emerald-950/40 text-emerald-400' : 'bg-neutral-900 text-text-s'}`}>
                              {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-text-p">{tx.title}</p>
                              <p className="text-xs text-text-s mt-0.5">{tx.date} • {tx.method}</p>
                            </div>
                          </div>
                          <div className="text-right flex sm:flex-col justify-between sm:justify-start items-center sm:items-end w-full sm:w-auto">
                            <span className={`font-semibold text-sm ${tx.amount > 0 ? 'text-emerald-400' : 'text-text-p'}`}>
                              {tx.amount > 0 ? '+' : ''}${tx.amount.toFixed(2)}
                            </span>
                            <span className="text-xs text-accent mt-1 hover:underline cursor-pointer flex items-center gap-1" onClick={() => {
                              const found = invoices.find(i => i.id === tx.invoiceId);
                              if (found) setSelectedInvoice(found);
                              else setSelectedInvoice({
                                id: tx.invoiceId || 'INV-TEMP',
                                date: tx.date,
                                description: tx.title,
                                amount: Math.abs(tx.amount),
                                status: tx.status === 'Completed' ? 'Paid' : 'Refunded',
                                paymentMethod: tx.method
                              });
                            }}>
                              <Eye size={12} /> Invoice
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Deposit funds view */}
            {currentSubTab === 'Deposit funds' && (
              <form onSubmit={handleDeposit} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold">Secure Global Fund Deposit</h3>
                <p className="text-text-s text-xs mt-1">Add money instantly to your DANSCOM account wallet from anywhere in the world.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gateways.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setSelectedGateway(g.name)}
                      className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-24 ${selectedGateway === g.name ? 'border-accent bg-accent/5' : 'border-border-custom bg-black/45'}`}
                    >
                      <span className="font-bold text-sm text-text-p">{g.name}</span>
                      <span className="text-[10px] text-text-s mt-1 block leading-tight">{g.extra}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-border-custom">
                  <div>
                    <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Deposit Amount (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-text-s sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="5.00"
                        className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 pl-8 pr-4 text-sm focus:outline-none text-text-p"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Stripe Credit Card inputs */}
                  {(selectedGateway === 'Stripe' || selectedGateway === 'Visa' || selectedGateway === 'Mastercard') && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                          placeholder="4111 2222 3333 4444"
                          value={cardNo}
                          onChange={(e) => setCardNo(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Expiry Date</label>
                        <input
                          type="text"
                          maxLength={5}
                          className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                          placeholder="MM/YY"
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">CVV Security Code</label>
                        <input
                          type="password"
                          maxLength={4}
                          className="w-full bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                          placeholder="***"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Lipa na M-Pesa inputs */}
                  {selectedGateway === 'M-Pesa' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">M-Pesa Registered Safaricom Number</label>
                      <input
                        type="text"
                        className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                        placeholder="+254712345678"
                        value={phoneNo}
                        onChange={(e) => setPhoneNo(e.target.value)}
                        required
                      />
                      <p className="text-[10px] text-text-s mt-2">A secure push notification will prompt you to enter your M-Pesa SIM PIN to finalize transaction.</p>
                    </div>
                  )}

                  {/* PayPal inputs */}
                  {selectedGateway === 'PayPal' && (
                    <div className="animate-fade-in">
                      <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">PayPal Account email address</label>
                      <input
                        type="email"
                        className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                        placeholder="customer@example.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {/* Apple / Google Pay Mobile Checkout Simulation */}
                  {(selectedGateway === 'Apple Pay' || selectedGateway === 'Google Pay') && (
                    <div className="p-4 bg-neutral-900 rounded-xl flex items-center gap-3 border border-border-custom animate-fade-in">
                      <CheckCircle size={18} className="text-accent" />
                      <div>
                        <p className="text-xs font-semibold text-text-p">{selectedGateway} Integrated Secure Wallet</p>
                        <p className="text-[10px] text-text-s mt-0.5">Will authorize transaction from your default device authentication keychain.</p>
                      </div>
                    </div>
                  )}

                  {/* Wire info */}
                  {selectedGateway === 'Bank transfer' && (
                    <div className="p-4 bg-neutral-900 rounded-xl space-y-2 border border-border-custom text-xs animate-fade-in">
                      <p className="font-bold">DANSCOM.NET Corporate Bank Wire instructions:</p>
                      <p className="text-text-s">Bank: Citibank, N.A., New York Branch</p>
                      <p className="text-text-s">Account Name: DANSCOM INTERNATIONAL LLC</p>
                      <p className="text-text-s">Swift/BIC: CITIUS33XXX</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={oneClickProcessing}
                  className="w-full bg-accent hover:bg-accent/85 text-white font-bold py-3.5 rounded-lg text-sm transition mt-6 disabled:opacity-50"
                >
                  {oneClickProcessing ? 'Processing Secure Settlement...' : `Proceed payment of $${parseFloat(depositAmount || '0').toFixed(2)}`}
                </button>
              </form>
            )}

            {/* Withdraw funds view */}
            {currentSubTab === 'Withdraw funds' && (
              <form onSubmit={handleWithdraw} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-6">
                <h3 className="text-xl font-bold">Withdraw Funds</h3>
                <p className="text-text-s text-xs mt-1">Convert account balance back into bank, PayPal, or Mobile Money.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Withdrawal Destination Channel</label>
                    <select 
                      onChange={(e) => setSelectedGateway(e.target.value)}
                      className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm text-text-p focus:outline-none"
                    >
                      <option value="Bank transfer">Direct Wire Transfer (US/EU Bank)</option>
                      <option value="PayPal">PayPal Balance Payout</option>
                      <option value="M-Pesa">Lipa na M-Pesa Mobile Payout</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Amount to Withdraw (USD)</label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-text-s sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        max={balance}
                        className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 pl-8 pr-4 text-sm focus:outline-none text-text-p"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={oneClickProcessing}
                  className="w-full bg-accent hover:bg-accent/85 text-white font-bold py-3.5 rounded-lg text-sm transition mt-6 disabled:opacity-50"
                >
                  {oneClickProcessing ? 'Initiating Broker Withdrawal...' : `Confirm Withdrawal of $${parseFloat(withdrawAmount || '0').toFixed(2)}`}
                </button>
              </form>
            )}

            {/* Refund and Invoices */}
            {currentSubTab === 'Invoices' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Invoices & Settlement Statements</h4>
                <div className="bg-bg-card border border-border-custom rounded-xl divide-y divide-border-custom overflow-hidden">
                  {invoices.length === 0 ? (
                    <p className="text-text-s p-6 text-sm">No settled invoices in the system.</p>
                  ) : (
                    invoices.map((inv) => (
                      <div key={inv.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-3">
                          <Receipt className="text-text-s" size={18} />
                          <div>
                            <p className="font-medium text-sm text-text-p">{inv.id} ({inv.date})</p>
                            <p className="text-xs text-text-s mt-0.5">{inv.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
                          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded">
                            {inv.status}
                          </span>
                          <span className="font-semibold text-sm">${inv.amount.toFixed(2)}</span>
                          <button 
                            onClick={() => setSelectedInvoice(inv)} 
                            className="text-xs bg-neutral-800 border border-border-custom px-3 py-1.5 rounded text-text-p hover:bg-neutral-700"
                          >
                            View & Refund
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Recurring Subscriptions view */}
            {currentSubTab === 'Subscription payments' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Auto-Renewed eSIM Subscriptions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="bg-bg-card border border-border-custom p-6 rounded-xl space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-base">{sub.name}</h5>
                          <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">{sub.data}</span>
                        </div>
                        <span className="text-lg font-bold">${sub.price.toFixed(2)}<span className="text-xs font-normal text-text-s">/mo</span></span>
                      </div>
                      
                      <div className="border-t border-border-custom pt-4 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-text-s uppercase">Next billing date</p>
                          <p className="text-xs font-medium">{sub.expiry}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-s">Auto-renew</span>
                          <button 
                            onClick={() => toggleAutoRenew(sub.id, sub.autoRenew)} 
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${sub.autoRenew ? 'bg-accent' : 'bg-neutral-800'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${sub.autoRenew ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Payment Methods view */}
            {currentSubTab === 'Saved methods' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg">Saved Payment Instruments</h4>
                  <button 
                    onClick={() => setCurrentSubTab('Deposit funds')}
                    className="flex items-center gap-1.5 text-xs text-accent hover:underline font-bold"
                  >
                    <Plus size={14} /> Link New Instrument
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedMethods.map((m) => (
                    <div key={m.id} className="bg-bg-card border border-border-custom p-6 rounded-xl flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-neutral-900 border border-border-custom rounded-lg">
                          <CreditCard className="text-accent" size={20} />
                        </div>
                        <div>
                          <h5 className="font-bold text-sm">{m.type} {m.last4 ? `(**** ${m.last4})` : ''}</h5>
                          <p className="text-xs text-text-s mt-0.5">{m.identifier}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => deleteSavedMethod(m.id)}
                        className="text-text-s hover:text-red-400 p-2 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fallback for sub tabs mapped from Sidebar */}
            {!['Wallet balance', 'Deposit funds', 'Withdraw funds', 'Invoices', 'Subscription payments', 'Saved methods'].includes(currentSubTab) && (
              <div className="bg-bg-card border border-border-custom p-8 rounded-2xl">
                <h4 className="font-bold text-xl mb-2">{currentSubTab}</h4>
                <p className="text-text-s text-sm">Synchronizing live gateway ledger. Please choose a sub-item from the payments control dashboard above.</p>
              </div>
            )}

          </div>

          {/* Right Sidebar Widget */}
          <div className="space-y-6">
            <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4">
              <h4 className="font-semibold text-base">Secured Settlement Summary</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-s">Current balance:</span>
                  <span className="font-medium text-text-p">${balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-s">Active subscriptions:</span>
                  <span className="font-medium text-text-p">{subscriptions.filter(s => s.autoRenew).length}</span>
                </div>
                <div className="flex justify-between border-t border-border-custom pt-2 mt-2 font-bold">
                  <span className="text-text-p">Total worth:</span>
                  <span className="text-accent">${(balance + subscriptions.reduce((acc, sub) => acc + (sub.autoRenew ? sub.price : 0), 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-3">
              <h4 className="font-semibold text-xs uppercase tracking-wider text-text-s">24/7 Global Compliance</h4>
              <p className="text-[11px] text-text-s leading-relaxed">DANSCOM utilizes Tier 1 PCI-DSS standard tokenization. All wire payments and Lipa na M-Pesa push prompts are authenticated by end-to-end token validation keys.</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
