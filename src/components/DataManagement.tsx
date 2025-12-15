import React from 'react';
import { CSVUpload } from './CSVUpload';
import { useData } from '../context/DataContext';
import {
  parseKeywordsCSV,
  parseRankingsCSV,
  downloadSampleKeywordsCSV,
  downloadSampleRankingsCSV,
} from '../utils/csvParser';
import { Database, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';

export function DataManagement() {
  const { keywords, addKeywords, addRankings, isLoading, error, loadDataFromBackend } = useData();
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const handleKeywordsUpload = async (csvText: string) => {
    setUploadError(null);
    try {
      const parsedKeywords = parseKeywordsCSV(csvText);
      await addKeywords(parsedKeywords);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload keywords';
      setUploadError(errorMessage);
      console.error('Error uploading keywords:', err);
    }
  };

  const handleRankingsUpload = async (csvText: string) => {
    setUploadError(null);
    try {
      const parsedRankings = parseRankingsCSV(csvText, keywords);
      await addRankings(parsedRankings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload rankings';
      setUploadError(errorMessage);
      console.error('Error uploading rankings:', err);
    }
  };

  const handleRefresh = async () => {
    setUploadError(null);
    try {
      await loadDataFromBackend();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh data';
      setUploadError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FB] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="size-8 text-[#0052CC]" />
            <h1>Data Management</h1>
          </div>
          <p className="text-muted-foreground">
            Upload your keyword and ranking data to populate the dashboard
          </p>
        </div>

        {(error || uploadError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {error || uploadError}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mb-6 flex items-center justify-center gap-2 p-4 bg-white rounded-lg border">
            <Loader2 className="size-5 animate-spin text-[#0052CC]" />
            <p>Syncing with database...</p>
          </div>
        )}

        <div className="flex justify-end mb-4">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Refresh Data'
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <CSVUpload
            title="Upload Keywords"
            description="Upload Google Keyword Planner data with search volumes and metrics"
            onUpload={handleKeywordsUpload}
            onDownloadSample={downloadSampleKeywordsCSV}
            acceptedColumns={[
              'Keyword',
              'Monthly Searches',
              'Competition',
              'CPC',
              'State',
              'City',
              'Avg Job Size',
            ]}
          />

          <CSVUpload
            title="Upload GMB Rankings"
            description="Upload ranking positions for each keyword (upload keywords first)"
            onUpload={handleRankingsUpload}
            onDownloadSample={downloadSampleRankingsCSV}
            acceptedColumns={[
              'Keyword',
              'Rank',
              'GMB Name',
              'Traffic Share',
              'My Business',
            ]}
          />
        </div>

        {keywords.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-900">
              ✓ Successfully loaded {keywords.length} keyword
              {keywords.length !== 1 ? 's' : ''} from database
            </p>
          </div>
        )}
      </div>
    </div>
  );
}