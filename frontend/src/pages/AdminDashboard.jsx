import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, Music, Image as ImageIcon, FileText, Save, Plus, Trash2, Edit2, X, Crown } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';
import ConfirmDialog from '../components/ConfirmDialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAdmin, setCurrentAdmin] = useState('');
  const [currentAdminData, setCurrentAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState('artists');
  const [isLoading, setIsLoading] = useState(true);
  
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    variant: 'primary',
    onConfirm: () => {}
  });
  
  // Admins state
  const [admins, setAdmins] = useState([]);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingAdminNewPassword, setEditingAdminNewPassword] = useState('');
  const [editingAdminNewEmail, setEditingAdminNewEmail] = useState('');
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    role: 'admin',
    permissions: {
      manage_artists: true,
      manage_releases: true,
      manage_content: true,
      manage_submissions: true,
      manage_admins: false
    }
  });
  
  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [submissionStats, setSubmissionStats] = useState({ total: 0, new: 0, reviewed: 0, archived: 0 });
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const defaultContent = {
    hero: {
      badge: 'Now Signing',
      title1: '808',
      title2: 'RECORDS',
      subtitle: 'A new era of music, driven by 808',
      button1: 'Explore Artists',
      button2: 'View Releases'
    },
    about: {
      badge: 'Our Story',
      title: 'About Us',
      description: '808 Records is more than a label - it\'s a movement dedicated to fresh, emerging talent.',
      stats: {
        founded: '2025',
        artists: '5+',
        releases: '10+'
      }
    },
    leaderboard: {
      badge: 'Our Artists',
      title: '808 Artist Roster',
      subtitle: '...from our 808 roster'
    },
    releases: {
      badge: 'New Music',
      title: 'Latest Releases',
      subtitle: 'Fresh tracks, EPs, and albums from our talented roster.'
    },
    contact: {
      email: 'submissions@808records.com',
      location: 'Long Branch, NJ'
    }
  };
  
  // Artists state
  const [artists, setArtists] = useState([]);
  const [editingArtist, setEditingArtist] = useState(null);
  const [newArtist, setNewArtist] = useState({
    name: '',
    genre: 'RAP / HIPHOP / Underground',
    popularityScore: 70,
    image: '',
    featured: false,
    instagram: '',
    spotify: '',
    latestRelease: ''
  });
  
  // Releases state
  const [releases, setReleases] = useState([]);
  const [editingRelease, setEditingRelease] = useState(null);
  const [newRelease, setNewRelease] = useState({
    title: '',
    artist: '',
    coverArt: '',
    releaseDate: new Date().toISOString().split('T')[0],
    type: 'Single',
    tracks: 1,
    duration: '0:00',
    featured: false,
    spotifyUrl: ''
  });
  
  // Site content state
  const [siteContent, setSiteContent] = useState({
    hero: {
      badge: 'Now Signing',
      title1: '808',
      title2: 'RECORDS',
      subtitle: 'A new era of music, driven by 808',
      button1: 'Explore Artists',
      button2: 'View Releases'
    },
    about: {
      badge: 'Our Story',
      title: 'About Us',
      description: '808 Records is more than a label - it\'s a movement dedicated to fresh, emerging talent.',
      stats: {
        founded: '2025',
        artists: '5+',
        releases: '10+'
      }
    },
    leaderboard: {
      badge: 'Our Artists',
      title: '808 Artist Roster',
      subtitle: '...from our 808 roster'
    },
    releases: {
      badge: 'New Music',
      title: 'Latest Releases',
      subtitle: 'Fresh tracks, EPs, and albums from our talented roster.'
    },
    contact: {
      email: 'submissions@808records.com',
      location: 'Long Branch, NJ'
    }
  });

  useEffect(() => {
    // Add admin-page class to body
    document.body.classList.add('admin-page');
    document.title = '808 Records - Admin Dashboard';
    verifyAuth();
    
    return () => {
      document.body.classList.remove('admin-page');
      document.title = '808 Records';
    };
  }, []);

  useEffect(() => {
    if (currentAdminData) {
      const perms = currentAdminData.permissions;
      if (perms.manage_artists) setActiveTab('artists');
      else if (perms.manage_releases) setActiveTab('releases');
      else if (perms.manage_content) setActiveTab('site');
      else if (perms.manage_submissions) setActiveTab('submissions');
      else if (perms.manage_admins) setActiveTab('admins');
    }
  }, [currentAdminData]);

  useEffect(() => {
    if (!isLoading) {
      if (activeTab === 'artists') loadArtists();
      if (activeTab === 'releases') loadReleases();
      if (activeTab === 'site') loadSiteContent();
      if (activeTab === 'admins') loadAdmins();
      if (activeTab === 'submissions') loadSubmissions();
    }
  }, [activeTab, isLoading]);
  
  // ========== ADMIN MANAGEMENT ==========
  
  const loadAdmins = async () => {
    try {
      const response = await axios.get(`${API}/admin/list`, {
        headers: getAuthHeaders()
      });
      setAdmins(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to load admins',
        variant: 'destructive'
      });
    }
  };
  
  const handleCreateNewAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/create`, newAdminForm, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Admin created successfully' });
      setNewAdminForm({
        email: '',
        password: '',
        role: 'admin',
        permissions: {
          manage_artists: true,
          manage_releases: true,
          manage_content: true,
          manage_submissions: true,
          manage_admins: false
        }
      });
      loadAdmins();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create admin',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdatePermissions = async (adminId, permissions) => {
    try {
      await axios.put(`${API}/admin/${adminId}/permissions`, permissions, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Permissions updated' });
      loadAdmins();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update permissions',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateAdminPermissions = async (adminId, updates, hasCredentialChange = false, newPassword = '', newEmail = '') => {
    const isSelf = editingAdmin?.email === currentAdmin;
    let message = '';
    
    if (hasCredentialChange && isSelf) {
      message = newEmail 
        ? `You are changing your own email to "${newEmail}". You will need to log in with the new email after saving. Continue?`
        : `You are changing your own password. You will need to log in with the new password after saving. Continue?`;
    } else if (hasCredentialChange) {
      message = `This will update the admin's credentials. They should be informed to log out and use the new ${newEmail ? 'email and/or password' : 'password'}. Continue?`;
    } else {
      message = `This will update the admin's permissions/role. Continue?`;
    }
    
    setConfirmDialog({
      isOpen: true,
      title: 'Update Admin Settings',
      message: message,
      confirmText: 'Update',
      variant: 'primary',
      onConfirm: async () => {
        try {
          // Update role/permissions if provided
          if (updates.role || updates.permissions) {
            await axios.put(`${API}/admin/${adminId}`, updates, {
              headers: getAuthHeaders()
            });
          }
          
          // Change credentials if provided
          if (hasCredentialChange && (newPassword || newEmail)) {
            const credentialData = {};
            if (newPassword) credentialData.new_password = newPassword;
            if (newEmail) credentialData.new_email = newEmail;
            
            await axios.put(`${API}/admin/${adminId}/credentials`, 
              credentialData, 
              { headers: getAuthHeaders() }
            );
          }
          
          let successMsg = '';
          if (hasCredentialChange && isSelf) {
            successMsg = 'Your credentials have been updated. Please log in again with your new credentials.';
            toast({ title: 'Success', description: successMsg });
            setEditingAdmin(null);
            setEditingAdminNewPassword('');
            setEditingAdminNewEmail('');
            // Log out the current admin
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_email');
            navigate('/admin/login');
          } else {
            successMsg = hasCredentialChange 
              ? 'Admin updated successfully. Please inform the admin to log out and use their new credentials.'
              : 'Admin updated successfully.';
            toast({ title: 'Success', description: successMsg });
            setEditingAdmin(null);
            setEditingAdminNewPassword('');
            setEditingAdminNewEmail('');
            loadAdmins();
          }
        } catch (error) {
          toast({
            title: 'Error',
            description: error.response?.data?.detail || 'Failed to update admin',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const handleDeleteAdmin = async (email, adminName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Admin',
      message: `Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/admin/${email}`, {
            headers: getAuthHeaders()
          });
          
          toast({ title: 'Success', description: 'Admin deleted successfully' });
          loadAdmins();
        } catch (error) {
          toast({
            title: 'Error',
            description: error.response?.data?.detail || 'Failed to delete admin',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const handleResetToDefault = (section) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset to Default',
      message: `Are you sure you want to reset the ${section} section to default settings? This will overwrite all current content.`,
      onConfirm: async () => {
        try {
          await axios.put(
            `${API}/content/site/${section.toLowerCase()}`,
            defaultContent[section.toLowerCase()],
            { headers: getAuthHeaders() }
          );
          
          setSiteContent({
            ...siteContent,
            [section.toLowerCase()]: defaultContent[section.toLowerCase()]
          });
          
          toast({ title: 'Success', description: `${section} section reset to defaults` });
        } catch (error) {
          toast({
            title: 'Error',
            description: `Failed to reset ${section} section`,
            variant: 'destructive'
          });
        }
      }
    });
  };
  
  // ========== SUBMISSIONS MANAGEMENT ==========
  
  const loadSubmissions = async () => {
    try {
      const [submissionsResponse, statsResponse] = await Promise.all([
        axios.get(`${API}/submissions/`, { headers: getAuthHeaders() }),
        axios.get(`${API}/submissions/stats/summary`, { headers: getAuthHeaders() })
      ]);
      
      setSubmissions(submissionsResponse.data);
      setSubmissionStats(statsResponse.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load submissions',
        variant: 'destructive'
      });
    }
  };
  
  const handleUpdateSubmissionStatus = async (submissionId, status, notes) => {
    try {
      await axios.put(`${API}/submissions/${submissionId}`, 
        { status, notes }, 
        { headers: getAuthHeaders() }
      );
      
      toast({ title: 'Success', description: 'Submission updated' });
      loadSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update submission',
        variant: 'destructive'
      });
    }
  };
  
  const handleDeleteSubmission = async (submissionId, submitterName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Submission',
      message: `Are you sure you want to delete the submission from "${submitterName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/submissions/${submissionId}`, {
            headers: getAuthHeaders()
          });
          
          toast({ title: 'Success', description: 'Submission deleted' });
          loadSubmissions();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete submission',
            variant: 'destructive'
          });
        }
      }
    });
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return { Authorization: `Bearer ${token}` };
  };

  const verifyAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const res = await axios.get(`${API}/admin/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentAdmin(res.data.email);
      
      const dataRes = await axios.get(`${API}/admin/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentAdminData(dataRes.data);
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== ARTISTS MANAGEMENT ==========
  
  const loadArtists = async () => {
    try {
      const response = await axios.get(`${API}/content/artists`);
      setArtists(response.data.sort((a, b) => b.popularityScore - a.popularityScore));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load artists',
        variant: 'destructive'
      });
    }
  };

  const handleCreateArtist = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/content/artists`, newArtist, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Artist created successfully' });
      setNewArtist({
        name: '',
        genre: 'RAP / HIPHOP / Underground',
        popularityScore: 70,
        image: '',
        featured: false,
        instagram: '',
        spotify: '',
        latestRelease: ''
      });
      loadArtists();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create artist',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateArtist = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/content/artists/${editingArtist.id}`, editingArtist, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Artist updated successfully' });
      setEditingArtist(null);
      loadArtists();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update artist',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteArtist = async (id, artistName) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Artist',
      message: `Are you sure you want to delete "${artistName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/content/artists/${id}`, {
            headers: getAuthHeaders()
          });
          
          toast({ title: 'Success', description: 'Artist deleted successfully' });
          loadArtists();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete artist',
            variant: 'destructive'
          });
        }
      }
    });
  };

  // ========== RELEASES MANAGEMENT ==========
  
  const loadReleases = async () => {
    try {
      const response = await axios.get(`${API}/content/releases`);
      setReleases(response.data.sort((a, b) => 
        new Date(b.releaseDate) - new Date(a.releaseDate)
      ));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load releases',
        variant: 'destructive'
      });
    }
  };

  const handleCreateRelease = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/content/releases`, newRelease, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Release created successfully' });
      setNewRelease({
        title: '',
        artist: '',
        coverArt: '',
        releaseDate: new Date().toISOString().split('T')[0],
        type: 'Single',
        tracks: 1,
        duration: '0:00',
        featured: false,
        spotifyUrl: ''
      });
      loadReleases();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create release',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRelease = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/content/releases/${editingRelease.id}`, editingRelease, {
        headers: getAuthHeaders()
      });
      
      toast({ title: 'Success', description: 'Release updated successfully' });
      setEditingRelease(null);
      loadReleases();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update release',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRelease = async (id, releaseTitle) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Release',
      message: `Are you sure you want to delete "${releaseTitle}"? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axios.delete(`${API}/content/releases/${id}`, {
            headers: getAuthHeaders()
          });
          
          toast({ title: 'Success', description: 'Release deleted successfully' });
          loadReleases();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete release',
            variant: 'destructive'
          });
        }
      }
    });
  };

  // ========== SITE CONTENT MANAGEMENT ==========
  
  const loadSiteContent = async () => {
    try {
      const [heroRes, aboutRes, contactRes, leaderboardRes, releasesRes] = await Promise.all([
        axios.get(`${API}/content/site/hero`),
        axios.get(`${API}/content/site/about`),
        axios.get(`${API}/content/site/contact`),
        axios.get(`${API}/content/site/leaderboard`),
        axios.get(`${API}/content/site/releases`)
      ]);
      
      setSiteContent({
        hero: heroRes.data.content || siteContent.hero,
        about: aboutRes.data.content || siteContent.about,
        contact: contactRes.data.content || siteContent.contact,
        leaderboard: leaderboardRes.data.content || siteContent.leaderboard,
        releases: releasesRes.data.content || siteContent.releases
      });
    } catch (error) {
      console.error('Error loading site content:', error);
    }
  };

  const handleUpdateSiteContent = async (section) => {
    try {
      await axios.put(
        `${API}/content/site/${section}`,
        siteContent[section],
        { headers: getAuthHeaders() }
      );
      
      toast({ title: 'Success', description: `${section} section updated successfully` });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update ${section} section`,
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/admin/login');
    toast({ title: 'Logged Out', description: 'You have been logged out successfully' });
  };

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
              <h1 className="text-2xl font-black text-white">808 Records Admin</h1>
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
          <div className="flex gap-6 overflow-x-auto">
            {currentAdminData?.permissions?.manage_artists && (
              <button
                onClick={() => setActiveTab('artists')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'artists'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Artists</span>
              </button>
            )}
            {currentAdminData?.permissions?.manage_releases && (
              <button
                onClick={() => setActiveTab('releases')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'releases'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <Music className="w-4 h-4" />
                <span className="text-sm font-medium">Releases</span>
              </button>
            )}
            {currentAdminData?.permissions?.manage_content && (
              <button
                onClick={() => setActiveTab('site')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'site'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Site Content</span>
              </button>
            )}
            {currentAdminData?.permissions?.manage_submissions && (
              <button
                onClick={() => setActiveTab('submissions')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'submissions'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">Submissions</span>
              </button>
            )}
            {currentAdminData?.permissions?.manage_admins && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'admins'
                    ? 'border-white text-white'
                    : 'border-transparent text-white/40 hover:text-white/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Admins</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-8 py-12">
        {/* ARTISTS TAB */}
        {activeTab === 'artists' && (
          <div className="space-y-8">
            {/* Create New Artist */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Artist</h2>
              <form onSubmit={handleCreateArtist} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Artist Name</label>
                    <input
                      type="text"
                      value={newArtist.name}
                      onChange={(e) => setNewArtist({ ...newArtist, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="Artist Name"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Genre</label>
                    <input
                      type="text"
                      value={newArtist.genre}
                      onChange={(e) => setNewArtist({ ...newArtist, genre: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Popularity Score</label>
                    <input
                      type="number"
                      value={newArtist.popularityScore}
                      onChange={(e) => setNewArtist({ ...newArtist, popularityScore: parseInt(e.target.value) })}
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Image URL</label>
                    <input
                      type="url"
                      value={newArtist.image}
                      onChange={(e) => setNewArtist({ ...newArtist, image: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Instagram URL</label>
                    <input
                      type="url"
                      value={newArtist.instagram}
                      onChange={(e) => setNewArtist({ ...newArtist, instagram: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Spotify URL</label>
                    <input
                      type="url"
                      value={newArtist.spotify}
                      onChange={(e) => setNewArtist({ ...newArtist, spotify: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-white/60 text-sm mb-2 block">Latest Release URL</label>
                    <input
                      type="url"
                      value={newArtist.latestRelease}
                      onChange={(e) => setNewArtist({ ...newArtist, latestRelease: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={newArtist.featured}
                        onChange={(e) => setNewArtist({ ...newArtist, featured: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <label className="text-white/60 text-sm">Featured Artist</label>
                    </div>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Artist</span>
                </button>
              </form>
            </div>

            {/* Artists List */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Existing Artists ({artists.length})</h2>
              <div className="space-y-4">
                {artists.map((artist) => (
                  <div key={artist.id}>
                    {editingArtist?.id === artist.id ? (
                      <form onSubmit={handleUpdateArtist} className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={editingArtist.name}
                            onChange={(e) => setEditingArtist({ ...editingArtist, name: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={editingArtist.genre}
                            onChange={(e) => setEditingArtist({ ...editingArtist, genre: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Genre"
                          />
                          <input
                            type="number"
                            value={editingArtist.popularityScore}
                            onChange={(e) => setEditingArtist({ ...editingArtist, popularityScore: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Popularity"
                          />
                          <input
                            type="url"
                            value={editingArtist.image}
                            onChange={(e) => setEditingArtist({ ...editingArtist, image: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Image URL"
                          />
                          <input
                            type="url"
                            value={editingArtist.instagram || ''}
                            onChange={(e) => setEditingArtist({ ...editingArtist, instagram: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Instagram"
                          />
                          <input
                            type="url"
                            value={editingArtist.spotify || ''}
                            onChange={(e) => setEditingArtist({ ...editingArtist, spotify: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Spotify"
                          />
                          <input
                            type="url"
                            value={editingArtist.latestRelease || ''}
                            onChange={(e) => setEditingArtist({ ...editingArtist, latestRelease: e.target.value })}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                            placeholder="Latest Release URL"
                          />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={editingArtist.featured || false}
                            onChange={(e) => setEditingArtist({ ...editingArtist, featured: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label className="text-white/60 text-sm">Featured Artist</label>
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingArtist(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
                        <img src={artist.image} alt={artist.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg">{artist.name}</h3>
                          <p className="text-white/60 text-sm">{artist.genre} • Score: {artist.popularityScore}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingArtist(artist)}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteArtist(artist.id, artist.name)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RELEASES TAB */}
        {activeTab === 'releases' && (
          <div className="space-y-8">
            {/* Create New Release */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Release</h2>
              <form onSubmit={handleCreateRelease} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Title</label>
                    <input
                      type="text"
                      value={newRelease.title}
                      onChange={(e) => setNewRelease({ ...newRelease, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="Release Title"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Artist</label>
                    <input
                      type="text"
                      value={newRelease.artist}
                      onChange={(e) => setNewRelease({ ...newRelease, artist: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="Artist Name"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Cover Art URL</label>
                    <input
                      type="url"
                      value={newRelease.coverArt}
                      onChange={(e) => setNewRelease({ ...newRelease, coverArt: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Release Date</label>
                    <input
                      type="date"
                      value={newRelease.releaseDate}
                      onChange={(e) => setNewRelease({ ...newRelease, releaseDate: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Type</label>
                    <select
                      value={newRelease.type}
                      onChange={(e) => setNewRelease({ ...newRelease, type: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="Single">Single</option>
                      <option value="EP">EP</option>
                      <option value="Album">Album</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Track Count</label>
                    <input
                      type="number"
                      value={newRelease.tracks}
                      onChange={(e) => setNewRelease({ ...newRelease, tracks: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Duration</label>
                    <input
                      type="text"
                      value={newRelease.duration}
                      onChange={(e) => setNewRelease({ ...newRelease, duration: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="3:45"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Spotify URL</label>
                    <input
                      type="url"
                      value={newRelease.spotifyUrl}
                      onChange={(e) => setNewRelease({ ...newRelease, spotifyUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="https://open.spotify.com/..."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newRelease.featured}
                      onChange={(e) => setNewRelease({ ...newRelease, featured: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <label className="text-white/60 text-sm">Featured Release</label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Release</span>
                </button>
              </form>
            </div>

            {/* Releases List */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Existing Releases ({releases.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {releases.map((release) => (
                  <div key={release.id}>
                    {editingRelease?.id === release.id ? (
                      <form onSubmit={handleUpdateRelease} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Title</label>
                          <input
                            type="text"
                            value={editingRelease.title}
                            onChange={(e) => setEditingRelease({ ...editingRelease, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            placeholder="Title"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Artist</label>
                          <input
                            type="text"
                            value={editingRelease.artist}
                            onChange={(e) => setEditingRelease({ ...editingRelease, artist: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            placeholder="Artist"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Cover Art URL</label>
                          <input
                            type="url"
                            value={editingRelease.coverArt}
                            onChange={(e) => setEditingRelease({ ...editingRelease, coverArt: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            placeholder="Cover Art URL"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Release Date</label>
                          <input
                            type="date"
                            value={editingRelease.releaseDate}
                            onChange={(e) => setEditingRelease({ ...editingRelease, releaseDate: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Type</label>
                          <select
                            value={editingRelease.type}
                            onChange={(e) => setEditingRelease({ ...editingRelease, type: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                          >
                            <option value="Single">Single</option>
                            <option value="EP">EP</option>
                            <option value="Album">Album</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Tracks</label>
                          <input
                            type="number"
                            value={editingRelease.tracks}
                            onChange={(e) => setEditingRelease({ ...editingRelease, tracks: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Duration</label>
                          <input
                            type="text"
                            value={editingRelease.duration}
                            onChange={(e) => setEditingRelease({ ...editingRelease, duration: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            placeholder="3:45"
                          />
                        </div>
                        <div>
                          <label className="text-white/60 text-xs mb-1 block">Spotify URL</label>
                          <input
                            type="url"
                            value={editingRelease.spotifyUrl || ''}
                            onChange={(e) => setEditingRelease({ ...editingRelease, spotifyUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            placeholder="https://open.spotify.com/..."
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editingRelease.featured}
                            onChange={(e) => setEditingRelease({ ...editingRelease, featured: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label className="text-white/60 text-xs">Featured</label>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white text-black rounded text-sm font-medium hover:bg-white/90">
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                          <button type="button" onClick={() => setEditingRelease(null)} className="flex-1 px-3 py-2 bg-white/5 text-white rounded text-sm hover:bg-white/10">
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <img src={release.coverArt} alt={release.title} className="w-full aspect-square rounded-lg object-cover mb-4" />
                        <h3 className="text-white font-bold">{release.title}</h3>
                        <p className="text-white/60 text-sm">{release.artist}</p>
                        <p className="text-white/40 text-xs mt-1">{release.type} • {release.tracks} tracks</p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setEditingRelease(release)}
                            className="flex-1 px-3 py-2 bg-white/5 border border-white/10 text-white rounded text-sm hover:bg-white/10"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRelease(release.id, release.title)}
                            className="px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-sm hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SITE CONTENT TAB */}
        {activeTab === 'site' && (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Hero Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Badge Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.badge}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, badge: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Title Line 1</label>
                  <input
                    type="text"
                    value={siteContent.hero.title1}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, title1: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Title Line 2</label>
                  <input
                    type="text"
                    value={siteContent.hero.title2}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, title2: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Subtitle</label>
                  <input
                    type="text"
                    value={siteContent.hero.subtitle}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Button 1 Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.button1}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, button1: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Button 2 Text</label>
                  <input
                    type="text"
                    value={siteContent.hero.button2}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      hero: { ...siteContent.hero, button2: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleUpdateSiteContent('hero')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save Hero
                </button>
                <button
                  onClick={() => handleResetToDefault('hero')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* About Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">About Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Badge</label>
                  <input
                    type="text"
                    value={siteContent.about.badge}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, badge: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Title</label>
                  <input
                    type="text"
                    value={siteContent.about.title}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/60 text-sm mb-2 block">Description</label>
                  <textarea
                    value={siteContent.about.description}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, description: e.target.value }
                    })}
                    rows="3"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Founded Year</label>
                  <input
                    type="text"
                    value={siteContent.about?.stats?.founded || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, stats: { ...(siteContent.about?.stats || {}), founded: e.target.value } }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Artists Count</label>
                  <input
                    type="text"
                    value={siteContent.about?.stats?.artists || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, stats: { ...(siteContent.about?.stats || {}), artists: e.target.value } }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Releases Count</label>
                  <input
                    type="text"
                    value={siteContent.about?.stats?.releases || ''}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      about: { ...siteContent.about, stats: { ...(siteContent.about?.stats || {}), releases: e.target.value } }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleUpdateSiteContent('about')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save About
                </button>
                <button
                  onClick={() => handleResetToDefault('about')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Artist Roster Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Badge</label>
                  <input
                    type="text"
                    value={siteContent.leaderboard.badge}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      leaderboard: { ...siteContent.leaderboard, badge: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Title</label>
                  <input
                    type="text"
                    value={siteContent.leaderboard.title}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      leaderboard: { ...siteContent.leaderboard, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Subtitle</label>
                  <input
                    type="text"
                    value={siteContent.leaderboard.subtitle}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      leaderboard: { ...siteContent.leaderboard, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleUpdateSiteContent('leaderboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save Leaderboard
                </button>
                <button
                  onClick={() => handleResetToDefault('leaderboard')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Releases Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Releases Section</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Badge</label>
                  <input
                    type="text"
                    value={siteContent.releases.badge}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      releases: { ...siteContent.releases, badge: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Title</label>
                  <input
                    type="text"
                    value={siteContent.releases.title}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      releases: { ...siteContent.releases, title: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Subtitle</label>
                  <input
                    type="text"
                    value={siteContent.releases.subtitle}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      releases: { ...siteContent.releases, subtitle: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleUpdateSiteContent('releases')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save Releases
                </button>
                <button
                  onClick={() => handleResetToDefault('releases')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>

            {/* Contact Section */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Email</label>
                  <input
                    type="email"
                    value={siteContent.contact.email}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact: { ...siteContent.contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-sm mb-2 block">Location</label>
                  <input
                    type="text"
                    value={siteContent.contact.location}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact: { ...siteContent.contact, location: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => handleUpdateSiteContent('contact')}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save Contact
                </button>
                <button
                  onClick={() => handleResetToDefault('contact')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

        {/* ADMINS TAB - Only for Head Admin */}
        {activeTab === 'admins' && currentAdminData?.permissions?.manage_admins && (
          <div className="space-y-8">
            {/* Create New Admin */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Admin</h2>
              <form onSubmit={handleCreateNewAdmin} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Email</label>
                    <input
                      type="email"
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="admin@808records.com"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Password</label>
                    <input
                      type="password"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-2 block">Role</label>
                    <select
                      value={newAdminForm.role}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, role: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
                    >
                      <option value="admin">Admin</option>
                      <option value="head_admin">Head Admin</option>
                      {currentAdminData?.role === 'owner' && (
                        <option value="developer">Developer</option>
                      )}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="text-white/60 text-sm mb-3 block">Permissions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(newAdminForm.permissions).map((perm) => (
                      <label key={perm} className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAdminForm.permissions[perm]}
                          onChange={(e) => setNewAdminForm({
                            ...newAdminForm,
                            permissions: { ...newAdminForm.permissions, [perm]: e.target.checked }
                          })}
                          className="w-4 h-4"
                        />
                        <span>{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Admin</span>
                </button>
              </form>
            </div>

            {/* Admins List */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Admin Accounts ({admins.length})</h2>
              <div className="space-y-4">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-bold text-lg">{admin.email}</h3>
                          {admin.role === 'owner' && (
                            <div className="group relative">
                              <Crown className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1.5 bg-black border border-yellow-400/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                <span className="text-xs text-yellow-300 font-medium">Owner of the site</span>
                                <div className="absolute left-1/2 -translate-x-1/2 top-full w-2 h-2 bg-black border-r border-b border-yellow-400/30 rotate-45 -mt-1"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            admin.role === 'owner'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border border-yellow-500/30'
                              : admin.role === 'developer'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-500/30'
                              : admin.role === 'head_admin' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {admin.role === 'owner' ? 'Owner' : 
                             admin.role === 'developer' ? 'Developer' :
                             admin.role === 'head_admin' ? 'Head Admin' : 'Admin'}
                          </span>
                          <span className="text-white/40 text-xs">
                            Created {new Date(admin.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {/* Only show edit/delete buttons if not owner role, and user has permissions */}
                        {admin.role !== 'owner' && currentAdminData?.permissions?.manage_admins && (
                          <>
                            <button
                              onClick={() => {
                                setEditingAdmin(admin);
                                setEditingAdminNewEmail('');
                                setEditingAdminNewPassword('');
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            {admin.email !== currentAdmin && admin.role !== 'developer' && (
                              <button
                                onClick={() => handleDeleteAdmin(admin.email, admin.email)}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/20"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-white/60 text-sm mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(admin.permissions).map(([perm, enabled]) => (
                          <span
                            key={perm}
                            className={`px-3 py-1 rounded-full text-xs ${
                              enabled 
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                : 'bg-white/5 text-white/30 border border-white/10'
                            }`}
                          >
                            {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Admin Modal */}
            {editingAdmin && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">Edit Admin</h3>
                      <p className="text-white/60 text-sm mt-1">{editingAdmin.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingAdmin(null);
                        setEditingAdminNewPassword('');
                        setEditingAdminNewEmail('');
                      }}
                      className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Credentials Section - Most Prominent */}
                    <div className="p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                      <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                        🔐 Login Credentials
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="text-white/80 text-sm mb-2 block font-medium">Change Email</label>
                          <input
                            type="email"
                            value={editingAdminNewEmail}
                            onChange={(e) => setEditingAdminNewEmail(e.target.value)}
                            placeholder={`Current: ${editingAdmin.email}`}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                          />
                          {editingAdminNewEmail && (
                            <p className="text-yellow-400 text-xs mt-2 flex items-center gap-1">
                              ⚠️ New email: <span className="font-semibold">{editingAdminNewEmail}</span>
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-white/80 text-sm mb-2 block font-medium">Change Password</label>
                          <input
                            type="password"
                            value={editingAdminNewPassword}
                            onChange={(e) => setEditingAdminNewPassword(e.target.value)}
                            placeholder="Enter new password to change"
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                          />
                          {editingAdminNewPassword && (
                            <p className="text-yellow-400 text-xs mt-2">⚠️ Password will be updated</p>
                          )}
                        </div>
                        {(editingAdminNewEmail || editingAdminNewPassword) && (
                          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                            <p className="text-yellow-300 text-sm">
                              {editingAdmin.email === currentAdmin 
                                ? '⚠️ You are editing your own credentials. You will be logged out and need to sign in again with your new credentials.'
                                : '⚠️ Admin will need to sign in with the new credentials on their next login.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Role Section */}
                    {currentAdminData?.role in ['owner', 'developer', 'head_admin'] && editingAdmin.role !== 'owner' && (
                      <div>
                        <label className="text-white/60 text-sm mb-2 block">Role</label>
                        <select
                          value={editingAdmin.role}
                          onChange={(e) => setEditingAdmin({ ...editingAdmin, role: e.target.value })}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                          disabled={editingAdmin.role === 'owner'}
                        >
                          <option value="admin">Admin</option>
                          <option value="head_admin">Head Admin</option>
                          {currentAdminData?.role === 'owner' && (
                            <option value="developer">Developer</option>
                          )}
                        </select>
                        {editingAdmin.role === 'owner' && (
                          <p className="text-yellow-400 text-xs mt-2">⚠️ Owner role cannot be changed</p>
                        )}
                      </div>
                    )}

                    {/* Permissions Section */}
                    <div>
                      <label className="text-white/60 text-sm mb-3 block">Permissions</label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.keys(editingAdmin.permissions).map((perm) => (
                          <label key={perm} className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingAdmin.permissions[perm]}
                              onChange={(e) => setEditingAdmin({
                                ...editingAdmin,
                                permissions: { ...editingAdmin.permissions, [perm]: e.target.checked }
                              })}
                              className="w-4 h-4"
                            />
                            <span>{perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleUpdateAdminPermissions(
                          editingAdmin.id, 
                          {
                            role: editingAdmin.role,
                            permissions: editingAdmin.permissions
                          },
                          editingAdminNewPassword.length > 0 || editingAdminNewEmail.length > 0,
                          editingAdminNewPassword,
                          editingAdminNewEmail
                        )}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90"
                      >
                        <Save className="w-4 h-4" />
                        Save All Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingAdmin(null);
                          setEditingAdminNewPassword('');
                          setEditingAdminNewEmail('');
                        }}
                        className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Total</div>
                <div className="text-3xl font-bold text-white">{submissionStats.total}</div>
              </div>
              <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="text-blue-300 text-sm mb-2">New</div>
                <div className="text-3xl font-bold text-blue-300">{submissionStats.new}</div>
              </div>
              <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
                <div className="text-green-300 text-sm mb-2">Reviewed</div>
                <div className="text-3xl font-bold text-green-300">{submissionStats.reviewed}</div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="text-white/60 text-sm mb-2">Archived</div>
                <div className="text-3xl font-bold text-white/60">{submissionStats.archived}</div>
              </div>
            </div>

            {/* Email Settings */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-3">Notification Settings</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-white/60 text-sm mb-2 block">Submission Notification Email</label>
                  <input
                    type="email"
                    value={siteContent.contact.email}
                    onChange={(e) => setSiteContent({
                      ...siteContent,
                      contact: { ...siteContent.contact, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                  />
                </div>
                <button
                  onClick={() => handleUpdateSiteContent('contact')}
                  className="mt-7 flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2">New submissions will be sent to this email address</p>
            </div>

            {/* Submissions List */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">Demo Submissions ({submissions.length})</h2>
              
              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-white/40">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="p-6 rounded-xl bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-bold text-lg">{submission.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'new' 
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                                : submission.status === 'reviewed'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-white/10 text-white/40 border border-white/20'
                            }`}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-white/60">
                              <span className="text-white/40">Email:</span> {submission.email}
                            </p>
                            {submission.artistName && (
                              <p className="text-white/60">
                                <span className="text-white/40">Artist Name:</span> {submission.artistName}
                              </p>
                            )}
                            {submission.demoLink && (
                              <p className="text-white/60">
                                <span className="text-white/40">Demo:</span>{' '}
                                <a 
                                  href={submission.demoLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline"
                                >
                                  {submission.demoLink}
                                </a>
                              </p>
                            )}
                            <p className="text-white/40 text-xs">
                              Submitted {new Date(submission.created_at).toLocaleDateString()} at {new Date(submission.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteSubmission(submission.id, submission.name)}
                          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Message */}
                      <div className="mb-4 p-4 rounded-lg bg-white/5">
                        <p className="text-white/40 text-xs mb-2">Message:</p>
                        <p className="text-white/80 text-sm">{submission.message}</p>
                      </div>

                      {/* Status Update */}
                      {selectedSubmission?.id === submission.id ? (
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <select
                              value={submission.status}
                              onChange={(e) => setSelectedSubmission({ ...selectedSubmission, status: e.target.value })}
                              className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                            >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="archived">Archived</option>
                            </select>
                            <button
                              onClick={() => handleUpdateSubmissionStatus(
                                submission.id, 
                                selectedSubmission.status, 
                                selectedSubmission.notes
                              )}
                              className="px-4 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-white/90"
                            >
                              Save Status
                            </button>
                            <button
                              onClick={() => setSelectedSubmission(null)}
                              className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                            >
                              Cancel
                            </button>
                          </div>
                          <textarea
                            placeholder="Add notes..."
                            value={selectedSubmission.notes || ''}
                            onChange={(e) => setSelectedSubmission({ ...selectedSubmission, notes: e.target.value })}
                            rows="2"
                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {submission.notes && (
                              <p className="text-white/60">
                                <span className="text-white/40">Notes:</span> {submission.notes}
                              </p>
                            )}
                            {submission.reviewed_by && (
                              <p className="text-white/40 text-xs">
                                Reviewed by {submission.reviewed_by}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedSubmission({ ...submission })}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-full text-sm hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                            Update
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        variant={confirmDialog.variant}
      />
    </div>
  );
};

export default AdminDashboard;
