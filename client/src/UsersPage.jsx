import React, { useEffect, useState } from "react";
import { User, Shield, Ghost, LogOut, Loader2, MoreVertical, Search, Filter } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const logoutUser = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, isLoggedIn: false } : user
      )
    );
  };

  useEffect(() => {
    async function fetchUsers() {
      try {
        const BASE_URL = "http://localhost:8000";
        const response = await fetch(`${BASE_URL}/users`, { 
          credentials: "include"
         });
        
        if (response.ok) {
          const data = await response.json();
          setUsers(data.map(u => ({
            ...u,
            role: u.role || (u.email.includes('admin') ? 'Admin' : 'User')
          })));
        }
        if(response.status == 403){
          setError("You are not authorised to view users details.Please contact your manager")
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const getRoleStyle = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin': return { icon: <Shield size={18} />, bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'guest': return { icon: <Ghost size={18} />, bg: 'bg-slate-50 text-slate-400 border-slate-100' };
      default: return { icon: <User size={18} />, bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header Section */}
        <div className="bg-white rounded-[1.5rem] border border-slate-200 p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <User size={24} />
             </div>
             <div>
                <h1 className="text-2xl font-bold tracking-tight">User Directory</h1>
                <p className="text-sm text-slate-500 font-medium">Manage and monitor system access</p>
             </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <button className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>
       
        {/* Main Content Area / Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Identity</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Classification</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                  <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="p-20 text-center">
                      <Loader2 className="animate-spin mx-auto mb-2 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Accessing Registry...</span>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const style = getRoleStyle(user.role);
                    return (
                      <tr key={user.id} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                              {user.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{user.name}</span>
                              <span className="text-xs text-slate-400">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-xl ${style.bg}`}>
                            {style.icon}
                            <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${user.isLoggedIn ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                             <span className={`text-[11px] font-bold uppercase tracking-tight ${user.isLoggedIn ? 'text-emerald-600' : 'text-slate-400'}`}>
                               {user.isLoggedIn ? "Active Now" : "Inactive"}
                             </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => logoutUser(user.id)}
                              disabled={!user.isLoggedIn}
                              className={`p-2.5 rounded-xl transition-all ${
                                user.isLoggedIn 
                                ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                                : 'text-slate-200 cursor-not-allowed'
                              }`}
                              title="Terminate Session"
                            >
                              <LogOut size={18} />
                            </button>
                            <button className="p-2.5 text-slate-400 hover:text-slate-900 transition-colors">
                               <MoreVertical size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

            </table>
          </div>
           <div className="text-red-600  font-sans font-semibold  h-10 mb-10 rounded-xl w-auto flex justify-center items-center p-10 ">
          <p>{error}</p>
        </div>

        </div>
        
      </div>
    </div>
  );
}