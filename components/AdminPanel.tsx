
import React from 'react';

const AdminPanel: React.FC = () => {
  const reports = [
    { title: 'Total Revenue', value: '₹1,24,000', trend: '+12%', color: 'text-green-600' },
    { title: 'Active Sellers', value: '842', trend: '+4%', color: 'text-blue-600' },
    { title: 'Images Optimized', value: '1.2M', trend: '+18%', color: 'text-pink-600' },
    { title: 'Meesho API Success', value: '99.4%', trend: '-0.1%', color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Command Center</h2>
        <p className="text-slate-500">Platform-wide performance and revenue monitoring.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {reports.map((r, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{r.title}</p>
            <h3 className={`text-2xl font-black ${r.color}`}>{r.value}</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              <span className={r.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}>{r.trend}</span> vs last month
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold">Recent System Logs</h3>
          <button className="text-xs text-pink-600 font-bold uppercase">Export Logs</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {[
                { time: '2 mins ago', user: 'aman_retail', action: 'Bulk Generation (500)', status: 'Success' },
                { time: '14 mins ago', user: 'fashion_hub', action: 'Premium Purchase', status: 'Completed' },
                { time: '28 mins ago', user: 'meesho_official', action: 'API Pingback', status: 'Healthy' },
                { time: '1 hr ago', user: 'gift_corner', action: 'Connect Account', status: 'Failed' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-400">{log.time}</td>
                  <td className="px-6 py-4 font-bold">{log.user}</td>
                  <td className="px-6 py-4 text-slate-600">{log.action}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${
                      log.status === 'Success' || log.status === 'Healthy' || log.status === 'Completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
