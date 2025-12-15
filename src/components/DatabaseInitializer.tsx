import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, Database } from 'lucide-react';
import * as api from '../services/api';

export default function DatabaseInitializer() {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error' | 'initializing'>('checking');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checkHealth = async () => {
    setStatus('checking');
    setError('');
    
    try {
      const result = await api.healthCheck();
      if (result.status === 'ok') {
        setStatus('ready');
        setMessage('Server is running');
        
        // Try to fetch data to see if tables exist
        try {
          await api.getClients();
          setMessage('Database is initialized and ready');
        } catch (err) {
          setMessage('Server is running but database needs initialization');
        }
      }
    } catch (err) {
      setStatus('error');
      setError('Server is not responding. The edge function may need to be deployed.');
      console.error('Health check failed:', err);
    }
  };

  const initializeDB = async () => {
    setStatus('initializing');
    setError('');
    
    try {
      const result = await api.initializeDatabase();
      if (result.success) {
        // Also seed the keywords
        setMessage('Database initialized! Seeding keywords...');
        const seedResult = await api.seedKeywords();
        
        if (seedResult.success) {
          setStatus('ready');
          setMessage(`Database ready! ${seedResult.message}`);
          
          // Reload the page after 2 seconds
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          setStatus('ready');
          setMessage('Database initialized but seeding failed. You can seed manually later.');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } else {
        setStatus('error');
        setError(result.message || 'Database initialization failed');
      }
    } catch (err) {
      setStatus('error');
      setError(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (status === 'ready' && !error) {
    return null; // Don't show anything if everything is working
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="p-6 max-w-md w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg" style={{ backgroundColor: status === 'error' ? '#FF3B30' : '#0052CC' }}>
            <Database className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl" style={{ fontWeight: 700 }}>
              Database Setup
            </h2>
            <p className="text-sm text-slate-500">Required for first-time use</p>
          </div>
        </div>

        {status === 'checking' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Loader2 className="size-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm" style={{ fontWeight: 600, color: '#0052CC' }}>
                Checking server status...
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Connecting to Supabase Edge Function
              </p>
            </div>
          </div>
        )}

        {status === 'initializing' && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Loader2 className="size-5 text-blue-600 animate-spin" />
            <div>
              <p className="text-sm" style={{ fontWeight: 600, color: '#0052CC' }}>
                Initializing database...
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Creating tables and indexes
              </p>
            </div>
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200 mb-4">
              <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm" style={{ fontWeight: 600, color: '#FF3B30' }}>
                  Connection Error
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  {error}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs" style={{ fontWeight: 600 }} className="mb-2">
                  Troubleshooting Steps:
                </p>
                <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Ensure the Supabase Edge Function is deployed</li>
                  <li>Check that environment variables are set (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL)</li>
                  <li>Verify the server is running at: <code className="text-xs bg-slate-200 px-1 rounded">https://cjrkhbgqptyjpqfynvvs.supabase.co/functions/v1/make-server-dc7dce20</code></li>
                </ol>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={checkHealth}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RefreshCw className="size-4" />
                  Retry Connection
                </Button>
                <Button
                  onClick={initializeDB}
                  className="flex-1 gap-2"
                  style={{ backgroundColor: '#0052CC' }}
                >
                  <Database className="size-4" />
                  Initialize DB
                </Button>
              </div>
            </div>
          </>
        )}

        {status === 'ready' && message && (
          <>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200 mb-4">
              <CheckCircle2 className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm" style={{ fontWeight: 600, color: '#00C47E' }}>
                  {message}
                </p>
              </div>
            </div>

            {message.includes('needs initialization') && (
              <Button
                onClick={initializeDB}
                className="w-full gap-2"
                style={{ backgroundColor: '#0052CC' }}
              >
                <Database className="size-4" />
                Initialize Database Now
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}