'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/control-components';
import { Loader2, Link2, Unlink } from 'lucide-react';
import type { StravaConnectionStatus } from '@/types/strava';
import posthog from 'posthog-js';

export function ConnectedServices() {
  const [stravaStatus, setStravaStatus] = useState<StravaConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStravaStatus();
  }, []);

  const fetchStravaStatus = async () => {
    try {
      const response = await fetch('/api/strava/status');
      if (response.ok) {
        const data = await response.json();
        setStravaStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch Strava status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectStrava = async () => {
    setActionLoading(true);
    // Track Strava connect initiated event
    posthog.capture('strava_connected', {
      action: 'initiated',
    });
    // Redirect to Strava OAuth flow
    window.location.href = '/api/strava/authorize';
  };

  const handleDisconnectStrava = async () => {
    if (!confirm('Are you sure you want to disconnect your Strava account?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
      });

      if (response.ok) {
        // Track Strava disconnected event
        posthog.capture('strava_disconnected');
        setStravaStatus({ connected: false });
      }
    } catch (error) {
      console.error('Failed to disconnect Strava:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Strava Connection */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          {/* Strava Logo */}
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FC4C02]/10">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              fill="#FC4C02"
            >
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 dark:text-white">Strava</h4>
            {stravaStatus?.connected ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Connected as {stravaStatus.athlete?.name}
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Import routes from your activities
              </p>
            )}
          </div>
        </div>

        {stravaStatus?.connected ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            onClick={handleDisconnectStrava}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Unlink className="w-4 h-4" />
            )}
            Disconnect
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
            onClick={handleConnectStrava}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            Connect Strava
          </Button>
        )}
      </div>

      {/* Future: Add more services here */}
      {/* <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700">
            <span className="text-xs text-gray-400">?</span>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-400">More Coming Soon</h4>
            <p className="text-xs text-gray-400">Garmin, Komoot, etc.</p>
          </div>
        </div>
      </div> */}
    </div>
  );
}
