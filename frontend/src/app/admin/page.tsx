'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/authApi';
import { Upload, LogOut, FileText, CheckCircle, AlertCircle, Loader, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_V1_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') + '/api/v1' || 'http://127.0.0.1:8000/api/v1';

export default function AdminPage() {
  const router = useRouter();
  const { token, user, logout, setLoading: setAuthLoading } = useAuthStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('academics');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!token || !user) {
      router.push('/login');
      return;
    }
  }, [token, user, router]);

  // Fetch stats
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_V1_URL.replace('/v1', '')}/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.docx')) {
        toast.error('Only .docx files are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      const response = await axios.post(
        `${API_V1_URL}/admin/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success(`Document uploaded! ${response.data.chunks_created} chunks created.`);
      setUploadHistory([response.data, ...uploadHistory]);
      setFile(null);
      setCategory('academics');
      
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      fetchStats();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Upload failed';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await authApi.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      toast.success('Logged out successfully');
      router.push('/login');
    }
  };

  if (!token || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-600 to-orange-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LPU Admin</h1>
              <p className="text-xs text-slate-400">Knowledge Base Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-200">{user?.email}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-slate-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Document Management</h2>
          <p className="text-slate-400">Upload and manage university policy documents</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <StatCard icon={FileText} label="Total Documents" value={stats.total_documents} color="blue" />
            <StatCard icon={BarChart3} label="Total Chunks" value={stats.total_chunks} color="orange" />
            <StatCard icon={FileText} label="Categories" value={stats.categories} color="green" />
            <StatCard icon={Upload} label="Embedding Model" value={stats.embedding_model} color="purple" isText />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Card */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Upload Document</h3>
              
              <form onSubmit={handleUpload} className="space-y-6">
                {/* Category Select */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isUploading}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition disabled:opacity-50"
                  >
                    <option value="academics">📚 Academics</option>
                    <option value="administration">🏛️ Administration</option>
                    <option value="career">💼 Career Services</option>
                    <option value="facilities">🏢 Facilities</option>
                    <option value="finance">💰 Finance</option>
                    <option value="international">🌍 International</option>
                  </select>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    Select .docx File
                  </label>
                  <div className="relative">
                    <input
                      id="file-input"
                      type="file"
                      accept=".docx"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-input"
                      className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-slate-600 rounded-lg hover:border-orange-500 cursor-pointer transition bg-slate-700/20"
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-300 font-medium">
                          {file ? file.name : 'Click to select or drag & drop'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">.docx files only</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isUploading || !file}
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload Document
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Info Card */}
          <div className="space-y-6">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload Instructions
              </h4>
              <ul className="space-y-2 text-sm text-blue-200/80">
                <li>✓ Select a .docx file</li>
                <li>✓ Choose the category</li>
                <li>✓ Click upload</li>
                <li>✓ Document is indexed automatically</li>
              </ul>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
              <h4 className="font-semibold text-green-300 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Status
              </h4>
              <p className="text-sm text-green-200/80">
                ✓ Vector database online<br/>
                ✓ Embedding model ready<br/>
                ✓ LLM service connected
              </p>
            </div>
          </div>
        </div>

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Uploads</h3>
            <div className="space-y-4">
              {uploadHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.category}</p>
                      <p className="text-sm text-slate-400">{item.chunks_created} chunks created</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Just now</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, isText }: any) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    orange: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    green: 'bg-green-500/20 text-green-500 border-green-500/30',
    purple: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-2xl p-6 backdrop-blur-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className={`text-3xl font-bold ${Object.values(colorClasses)[Object.keys(colorClasses).indexOf(color)].split(' ')[2]}`}>
            {isText ? value : typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <Icon className="w-8 h-8 opacity-60" />
      </div>
    </div>
  );
}
