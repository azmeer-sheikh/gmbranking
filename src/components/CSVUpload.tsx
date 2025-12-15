import React, { useRef, useState } from 'react';
import { Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface CSVUploadProps {
  title: string;
  description: string;
  onUpload: (csvText: string) => void;
  onDownloadSample: () => void;
  acceptedColumns: string[];
}

export function CSVUpload({
  title,
  description,
  onUpload,
  onDownloadSample,
  acceptedColumns,
}: CSVUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        onUpload(csvText);
        setStatus('success');
        setMessage(`Successfully uploaded ${file.name}`);
        setTimeout(() => setStatus('idle'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="mb-1">{title}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        <Button variant="outline" size="sm" onClick={onDownloadSample}>
          <Download className="size-4 mr-2" />
          Sample CSV
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <p className="text-sm mb-2">Expected columns:</p>
          <div className="flex flex-wrap gap-2">
            {acceptedColumns.map((col) => (
              <span
                key={col}
                className="text-xs bg-background px-2 py-1 rounded border"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button onClick={handleUploadClick} className="w-full">
          <Upload className="size-4 mr-2" />
          Upload CSV File
        </Button>

        {status !== 'idle' && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 text-green-900'
                : 'bg-red-50 text-red-900'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <AlertCircle className="size-4" />
            )}
            <span className="text-sm">{message}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
