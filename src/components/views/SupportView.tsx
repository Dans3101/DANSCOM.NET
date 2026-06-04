import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Plus, Mail, CheckCircle, Smartphone, Play, AlertCircle } from 'lucide-react';

export const SupportView = ({ activeTab }: { activeTab: string }) => {
  const [currentSub, setCurrentSub] = useState('Live chat');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketBody, setTicketBody] = useState('');
  
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { sender: 'AI Bot', text: 'Hello! I am DANSCOM Virtual Assistant. How can I assist with your roaming eSIM setup today?', time: 'Just now' }
  ]);

  const [tickets, setTickets] = useState([
    { id: 'TKT-94819', subject: 'eSIM profile download failed on iOS 18', status: 'In Review', date: '2026-06-02' },
    { id: 'TKT-92011', subject: 'Corporate wallet refund verification', status: 'Resolved', date: '2026-05-24' }
  ]);

  const faqs = [
    { q: 'How do I scan the eSIM QR code?', a: 'Go to Settings > Cellular > Add eSIM, then scan the custom QR code provided in your "My eSIMs" dashboard.' },
    { q: 'Can I reuse the same eSIM profile across devices?', a: 'No. An eSIM profile token is securely locked and registered to a single device IMEI. Release the eSIM before switching.' },
    { q: 'What is Lipa na M-Pesa one-click checkout?', a: 'Select M-Pesa at checkout inside "Deposit funds". A prompt pops up on your Safaricom mobile device immediately, allowing you to settle the invoice by typing your SIM PIN.' }
  ];

  useEffect(() => {
    const subTabs = ['Live chat', 'Ticket system', 'FAQs', 'Contact support', 'System status'];
    if (subTabs.includes(activeTab)) {
      setCurrentSub(activeTab);
    }
  }, [activeTab]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;

    const userMessage = { sender: 'You', text: chatMsg, time: 'Just now' };
    setChatHistory(prev => [...prev, userMessage]);
    setChatMsg('');

    // Simulated instant reply
    setTimeout(() => {
      setChatHistory(prev => [
        ...prev,
        { sender: 'AI Bot', text: `Got your query regarding "${chatMsg}". Connecting secure network gateway nodes for real-time validation...`, time: 'Just now' }
      ]);
    }, 1000);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim()) return;

    const newTicket = {
      id: 'TKT-' + Math.floor(10000 + Math.random() * 90000),
      subject: ticketSubject,
      status: 'In Review',
      date: new Date().toISOString().split('T')[0]
    };

    setTickets(prev => [newTicket, ...prev]);
    alert(`Success! Ticket ${newTicket.id} created.`);
    setTicketSubject('');
    setTicketBody('');
    setCurrentSub('Ticket system');
  };

  return (
    <div className="p-8 text-text-p bg-bg-app min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-custom pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Help & Customer Support</h2>
          <p className="text-text-s text-sm mt-1">Submit technical tickets, chat with real-time support bots, or inspect global cellular carrier status rules.</p>
        </div>
        <div className="flex flex-wrap gap-2 bg-bg-card p-1 rounded-lg border border-border-custom">
          {['Live chat', 'Ticket system', 'FAQs', 'System status'].map((tab) => (
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
        
        {/* Main Workspace content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Real-time Bot Chat */}
          {currentSub === 'Live chat' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 h-[500px] flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-4">Real-time Support Helpdesk</h3>
                <div className="space-y-4 h-[350px] overflow-y-auto pr-2 divide-y divide-border-custom/25">
                  {chatHistory.map((chat, idx) => (
                    <div key={idx} className="pt-3">
                      <p className={`text-xs font-bold uppercase tracking-wider ${chat.sender === 'You' ? 'text-accent' : 'text-purple-400'}`}>{chat.sender}</p>
                      <p className="text-sm text-text-p mt-1 leading-relaxed">{chat.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-border-custom pt-4">
                <input
                  type="text"
                  required
                  className="flex-1 bg-neutral-900 border border-border-custom rounded-lg py-2.5 px-3 text-sm focus:outline-none"
                  placeholder="Ask a question about your roaming connection..."
                  value={chatMsg}
                  onChange={(e) => setChatMsg(e.target.value)}
                />
                <button type="submit" className="bg-accent text-white py-2.5 px-4 rounded-lg text-xs font-semibold">Send</button>
              </form>
            </div>
          )}

          {/* Electronic ticket system */}
          {currentSub === 'Ticket system' && (
            <div className="space-y-6">
              <form onSubmit={handleSubmitTicket} className="bg-bg-card border border-border-custom p-8 rounded-2xl space-y-4">
                <h3 className="font-bold text-base">Create Technical Support Issue</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none"
                      placeholder="Summary of cellular error"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-text-s uppercase tracking-wider mb-2">Detailed description</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full bg-neutral-900 border border-border-custom rounded-lg py-3 px-4 text-sm focus:outline-none resize-none"
                      placeholder="Enter cellular profiles details, device configurations, or error logs..."
                      value={ticketBody}
                      onChange={(e) => setTicketBody(e.target.value)}
                    />
                  </div>
                </div>

                <button type="submit" className="bg-accent text-white py-2.5 px-6 rounded-lg text-xs font-bold transition">Submit Issue Ticket</button>
              </form>

              <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg">Your Help Support Tickets</h3>
                <div className="divide-y divide-border-custom overflow-hidden">
                  {tickets.map((t) => (
                    <div key={t.id} className="py-4 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-semibold text-text-p">{t.subject} <span className="text-xs text-text-s">({t.id})</span></p>
                        <p className="text-xs text-text-s mt-0.5">Submitted: {t.date}</p>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${t.status === 'Resolved' ? 'bg-emerald-950/20 text-emerald-400 border border-emerald-500/10' : 'bg-neutral-900 text-text-s border border-border-custom'}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FAQs List */}
          {currentSub === 'FAQs' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-8 space-y-6 animate-fade-in">
              <h3 className="font-bold text-lg">Frequently Asked Questions</h3>
              <div className="space-y-6 pt-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-1 bg-black/40 p-5 rounded-xl border border-border-custom">
                    <p className="text-sm font-bold text-text-p flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-accent" /> {faq.q}
                    </p>
                    <p className="text-xs text-text-s mt-1.5 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carrier Nodes Status tracking */}
          {currentSub === 'System status' && (
            <div className="bg-bg-card border border-border-custom rounded-2xl p-6 space-y-4 animate-fade-in">
              <h3 className="font-bold text-lg">Global Carrier Network Status</h3>
              <p className="text-text-s text-xs">Verify live operational diagnostics on global network integration relays.</p>
              
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-text-p">Orange Europe / T-Mobile USA integration</p>
                    <p className="text-[10px] text-text-s mt-1">SLA ping 32ms</p>
                  </div>
                  <span className="text-emerald-400 font-bold">Operational</span>
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-text-p">Lipa na M-Pesa push API endpoint</p>
                    <p className="text-[10px] text-text-s mt-1">Response time 0.8s</p>
                  </div>
                  <span className="text-emerald-400 font-bold">Operational</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Support sidebar widget */}
        <div className="space-y-6">
          <div className="bg-neutral-900/40 p-6 rounded-2xl border border-border-custom space-y-4 text-xs">
            <h4 className="font-bold text-sm">Escalations Matrix</h4>
            <p className="text-text-s leading-relaxed">Most tickets receive response in less than 3 hours. Live chat is available 24/7.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
