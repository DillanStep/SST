/**
 * @file LoginPage.tsx
 * @description Professional authentication page with banner and animations
 * 
 * Modern login experience with:
 * - Full-height banner image on left
 * - Clean grey/white form on right
 * - Smooth animations and transitions
 * - Server configuration management
 * 
 * @author SST Development Team
 * @license Non-Commercial Open Source - See LICENSE for terms
 * @version 2.0.0
 * @lastUpdated 2026-01-17
 */
import React, { useState, useEffect } from 'react';
import { Server, LogIn, Eye, EyeOff, AlertCircle, Settings, Check, RefreshCw, ChevronRight } from 'lucide-react';
import { Button, Input } from '../ui';
import { login } from '../../services/auth';
import type { User } from '../../services/auth';
import { getActiveServer, addServer, setActiveServerId } from '../../services/serverManager';
import type { ServerConfig } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Animation states
  const [mounted, setMounted] = useState(false);
  
  // Server configuration state
  const [activeServer, setActiveServer] = useState<ServerConfig | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [serverApiKey, setServerApiKey] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setMounted(true);
    const server = getActiveServer();
    setActiveServer(server);
    if (!server) {
      setShowServerConfig(true);
    }
  }, []);

  const handleTestConnection = async () => {
    if (!serverUrl.trim()) {
      setError('API URL is required');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus('idle');
    setError(null);

    try {
      const url = serverUrl.trim().replace(/\/$/, '');
      const response = await fetch(`${url}/health`, { 
        method: 'GET',
        headers: serverApiKey ? { 'X-API-Key': serverApiKey } : {}
      });
      
      if (response.ok) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
        setError(`Server returned ${response.status}`);
      }
    } catch {
      setConnectionStatus('error');
      setError('Cannot connect to server. Check the URL and ensure the API is running.');
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveServer = () => {
    if (!serverName.trim() || !serverUrl.trim()) {
      setError('Server name and API URL are required');
      return;
    }

    const url = serverUrl.trim().replace(/\/$/, '');
    const newServer = addServer({
      name: serverName.trim(),
      apiUrl: url,
      apiKey: serverApiKey.trim(),
    });
    
    setActiveServerId(newServer.id);
    setActiveServer(newServer);
    setShowServerConfig(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeServer) {
      setError('Please configure a server first');
      setShowServerConfig(true);
      return;
    }
    
    if (!username.trim() || !password) {
      setError('Username and password are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(username.trim(), password, rememberMe);
      onLogin(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Top/Left side - Banner Image on white background */}
      <div 
        className={`lg:w-1/2 xl:w-3/5 bg-white flex flex-col justify-center transition-opacity duration-700 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Banner Image - compact, no extra flex growth */}
        <div className="flex items-center justify-center p-4 lg:p-6">
          <img 
            src="/banners/Banner-03.png" 
            alt="SST Dashboard"
            className="w-full max-w-xl h-auto object-contain"
          />
        </div>
        
        {/* Content below banner - grey text, tighter spacing */}
        <div className="p-4 lg:px-6 lg:pb-6">
          <div className="max-w-xl mx-auto">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-surface-800">SST Dashboard</h1>
            <p className="mt-1 text-base text-surface-500">Server Management System</p>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <Server className="w-4 h-4 text-surface-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-700 text-sm">Complete Server Control</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Manage players, vehicles, and economy in one place</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-4 h-4 text-surface-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-700 text-sm">Real-time Monitoring</h3>
                  <p className="text-xs text-surface-500 mt-0.5">Live player tracking and server statistics</p>
                </div>
              </div>
            </div>
            
            <p className="text-xs text-surface-400 mt-6 hidden lg:block">
              © 2026 SST Development Team
            </p>
          </div>
        </div>
      </div>

      {/* Right/Bottom side - Login Form on grey background */}
      <div 
        className={`flex-1 flex items-center justify-center p-6 sm:p-12 bg-surface-100 transition-all duration-500 ${
          mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <div className="w-full max-w-md">
          {/* Mobile Logo - hidden on desktop since banner section shows it */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-700 rounded-2xl shadow-lg mb-4">
              <Server className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-surface-800">SST Dashboard</h1>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-10">
            <h2 className="text-3xl font-bold text-surface-800">Welcome back</h2>
            <p className="mt-2 text-surface-500">Sign in to access your server dashboard</p>
          </div>

          {/* Form Container - White card on grey background */}
          <div 
            className={`bg-white rounded-2xl shadow-sm border border-surface-200 p-6 sm:p-8 transition-all duration-300 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '150ms' }}
          >
            {showServerConfig ? (
              /* Server Configuration Form */
              <div className="space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-surface-200">
                  <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center">
                    <Settings size={20} className="text-surface-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-800">Configure Server</h3>
                    <p className="text-sm text-surface-500">Connect to your DayZ server API</p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm animate-fade-in">
                    <Check size={18} className="flex-shrink-0" />
                    <span>Connection successful!</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">
                      Server Name
                    </label>
                    <Input
                      type="text"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="My DayZ Server"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-600 mb-2">
                      API URL
                    </label>
                    <Input
                      type="text"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="http://your-server-ip:3001"
                    />
                    <p className="text-xs text-surface-400 mt-2">
                      The URL where your SST API is running
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      API Key <span className="text-surface-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      value={serverApiKey}
                      onChange={(e) => setServerApiKey(e.target.value)}
                      placeholder="Leave blank if not using API keys"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleTestConnection}
                    loading={testingConnection}
                    icon={<RefreshCw size={16} />}
                    className="flex-1"
                  >
                    Test
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveServer}
                    icon={<Check size={16} />}
                    className="flex-1"
                  >
                    Save & Continue
                  </Button>
                </div>

                {activeServer && (
                  <button
                    type="button"
                    onClick={() => setShowServerConfig(false)}
                    className="w-full text-sm text-surface-500 hover:text-surface-700 transition-colors mt-4"
                  >
                    Cancel and return to login
                  </button>
                )}
              </div>
            ) : (
              /* Login Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Active server indicator */}
                {activeServer && (
                  <div 
                    className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200 transition-all hover:border-surface-300"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-surface-200 flex items-center justify-center flex-shrink-0">
                        <Server size={16} className="text-surface-600" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-surface-800 block truncate">
                          {activeServer.name}
                        </span>
                        <span className="text-xs text-surface-400 truncate block">
                          {activeServer.apiUrl}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowServerConfig(true)}
                      className="text-xs font-medium text-surface-500 hover:text-surface-700 transition-colors flex-shrink-0 px-3 py-1.5 rounded-lg hover:bg-surface-100"
                    >
                      Change
                    </button>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-fade-in">
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-surface-700 mb-2">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    autoFocus
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-surface-400 hover:text-surface-600 transition-colors rounded-lg hover:bg-surface-100"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-surface-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-surface-300 text-surface-800 focus:ring-surface-400"
                    />
                    Remember me
                  </label>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Security notice: If your PC is compromised, we recommend changing your API key and login details.
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  loading={loading}
                  icon={<LogIn size={18} />}
                >
                  Sign In
                </Button>
              </form>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-surface-500 mt-6">
            SST Server Management Dashboard
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
