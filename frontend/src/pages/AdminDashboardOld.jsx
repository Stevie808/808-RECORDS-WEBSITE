import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, FileText, Settings, Save, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [activeTab, setActiveTab] = useState('content');
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const response = await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentAdmin(response.data.email);
      if (activeTab === 'admins') {
        loadAdmins();
      }
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdmins = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const response = await axios.get(`${API}/admin/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admins',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
    toast({
      title: 'Logged Out',
      description: 'You have been logged out successfully'
    });
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    
    try {
      await axios.post(`${API}/admin/create`, newAdmin, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Admin Created',
        description: `New admin ${newAdmin.email} created successfully`
      });
      
      setNewAdmin({ email: '', password: '' });
      loadAdmins();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create admin',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteAdmin = async (email) => {
    if (!window.confirm(`Are you sure you want to delete ${email}?`)) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    
    try {
      await axios.delete(`${API}/admin/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({
        title: 'Admin Deleted',
        description: `Admin ${email} has been removed`
      });
      
      loadAdmins();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to delete admin',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (activeTab === 'admins' && !isLoading) {
      loadAdmins();
    }
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">808Records Admin</h1>
              <p className="text-sm text-white/40 mt-1">Logged in as {currentAdmin}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-white/5">
        <div className="container mx-auto px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all ${
                activeTab === 'content'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Content Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all ${
                activeTab === 'admins'
                  ? 'border-white text-white'
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Admin Management</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-12">
        {activeTab === 'content' && (
          <div className="max-w-4xl">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Content Management</h2>
              <p className="text-white/60 mb-8">
                Content management system coming soon. This will allow you to edit all text, images, and site content.
              </p>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/40 text-sm">Features in development:</p>
                <ul className="mt-4 space-y-2 text-white/60 text-sm">
                  <li>• Edit hero section text</li>
                  <li>• Manage artist roster</li>
                  <li>• Update releases</li>
                  <li>• Modify about section</li>
                  <li>• Configure contact details</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="max-w-4xl space-y-8">
            {/* Create New Admin */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Admin</h2>
              <form onSubmit={handleCreateAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-field-modern">
                    <label className="form-label-modern">Email</label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                      required
                      className="input-modern"
                      placeholder="newadmin@808records.com"
                    />
                    <div className="form-border-modern" />
                  </div>
                  <div className="form-field-modern">
                    <label className="form-label-modern">Password</label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                      required
                      className="input-modern"
                      placeholder="••••••••"
                    />
                    <div className="form-border-modern" />
                  </div>
                </div>
                <button type="submit" className="btn-sleek flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>Create Admin</span>
                </button>
              </form>
            </div>

            {/* Admin List */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Admin Accounts</h2>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div
                    key={admin.email}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-white font-medium">{admin.email}</p>
                      <p className="text-white/40 text-sm mt-1">
                        Created {new Date(admin.created_at).toLocaleDateString()} by {admin.created_by || 'system'}
                      </p>
                    </div>
                    {admin.email !== currentAdmin && (
                      <button
                        onClick={() => handleDeleteAdmin(admin.email)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-400 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
