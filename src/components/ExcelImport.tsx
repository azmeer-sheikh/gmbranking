import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Trash2,
  Users,
  Hash,
  Target,
  Globe,
} from 'lucide-react';
import {
  parseExcelFile,
  downloadTemplate,
  validateClientData,
  validateKeywordData,
  validateCompetitorData,
  validateGlobalKeywordData,
  type ExcelClientRow,
  type ExcelKeywordRow,
  type ExcelCompetitorRow,
  type ExcelGlobalKeywordRow,
} from '../lib/excel-utils';

interface ExcelImportProps {
  type: 'clients' | 'keywords' | 'competitors' | 'global_keywords';
  onImport: (data: any[]) => Promise<{ success: boolean; message: string }>;
}

export default function ExcelImport({ type, onImport }: ExcelImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors: string[];
    data: any[];
  } | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getTypeConfig = () => {
    switch (type) {
      case 'clients':
        return {
          title: 'Import Clients',
          icon: Users,
          color: '#0052CC',
          description: 'Upload client data with business information',
          templateName: 'Clients Template',
        };
      case 'keywords':
        return {
          title: 'Import Keywords',
          icon: Hash,
          color: '#00C47E',
          description: 'Upload keyword data for your clients',
          templateName: 'Keywords Template',
        };
      case 'competitors':
        return {
          title: 'Import Competitors',
          icon: Target,
          color: '#FF3B30',
          description: 'Upload competitor analysis data',
          templateName: 'Competitors Template',
        };
      case 'global_keywords':
        return {
          title: 'Import Global Keywords',
          icon: Globe,
          color: '#9333EA',
          description: 'Upload industry-wide keyword database',
          templateName: 'Global Keywords Template',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls)$/)) {
      alert('Please select an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(selectedFile);
    setUploading(true);
    setImportResult(null);
    setValidationResult(null);

    try {
      const data = await parseExcelFile(selectedFile);
      setParsedData(data);

      // Validate based on type
      let validation;
      switch (type) {
        case 'clients':
          validation = validateClientData(data);
          break;
        case 'keywords':
          validation = validateKeywordData(data);
          break;
        case 'competitors':
          validation = validateCompetitorData(data);
          break;
        case 'global_keywords':
          validation = validateGlobalKeywordData(data);
          break;
      }

      setValidationResult(validation);
    } catch (error) {
      console.error('Error parsing file:', error);
      setValidationResult({
        valid: false,
        errors: ['Failed to parse Excel file. Please check the file format.'],
        data: [],
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.valid || validationResult.data.length === 0) {
      return;
    }

    setUploading(true);
    const result = await onImport(validationResult.data);
    setImportResult(result);
    setUploading(false);

    // If successful, reset after 3 seconds to allow another import
    if (result.success) {
      setTimeout(() => {
        handleReset();
      }, 3000);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedData([]);
    setValidationResult(null);
    setImportResult(null);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPreviewTable = () => {
    if (!parsedData || parsedData.length === 0) return null;

    const headers = Object.keys(parsedData[0]);
    const previewData = parsedData.slice(0, 5);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300">
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 text-left text-slate-700 bg-slate-50">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                {headers.map((header) => (
                  <td key={header} className="px-4 py-3 text-slate-600">
                    {row[header]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {parsedData.length > 5 && (
          <p className="text-sm text-slate-500 mt-3 text-center">
            Showing 5 of {parsedData.length} rows
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg" style={{ backgroundColor: config.color }}>
            <Icon className="size-6 text-white" />
          </div>
          <div>
            <h3 className="text-slate-900">{config.title}</h3>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => downloadTemplate(type)}
          className="gap-2"
        >
          <Download className="size-4" />
          Download Template
        </Button>
      </div>

      {/* Upload Area */}
      {!file && (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileInput}
            className="hidden"
          />
          <FileSpreadsheet className="size-16 mx-auto mb-4 text-slate-400" />
          <h4 className="text-slate-900 mb-2">
            Drag & drop your Excel file here
          </h4>
          <p className="text-sm text-slate-500 mb-4">or</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            style={{ backgroundColor: config.color }}
            className="text-white"
          >
            <Upload className="size-4 mr-2" />
            Browse Files
          </Button>
          <p className="text-xs text-slate-400 mt-4">
            Supports .xlsx and .xls files
          </p>
        </div>
      )}

      {/* File Selected */}
      {file && (
        <div className="space-y-6">
          {/* File Info */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="size-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-900" style={{ fontWeight: 600 }}>
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset}>
              <Trash2 className="size-4 mr-2" />
              Remove
            </Button>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div>
              {validationResult.valid ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-900" style={{ fontWeight: 600 }}>
                        Validation Successful
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Found {validationResult.data.length} valid{' '}
                        {validationResult.data.length === 1 ? 'row' : 'rows'} ready to
                        import
                      </p>
                    </div>
                    <Badge className="bg-green-100 text-green-700">
                      {validationResult.data.length} rows
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <XCircle className="size-5 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-red-900" style={{ fontWeight: 600 }}>
                        Validation Failed
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        {validationResult.errors.length} error(s) found:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {validationResult.errors.slice(0, 5).map((error, idx) => (
                          <li key={idx} className="text-sm text-red-600 ml-4 list-disc">
                            {error}
                          </li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li className="text-sm text-red-600 ml-4">
                            ... and {validationResult.errors.length - 5} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preview Button */}
          {parsedData.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="w-full gap-2"
            >
              <Eye className="size-4" />
              {showPreview ? 'Hide' : 'Show'} Data Preview
            </Button>
          )}

          {/* Preview Table */}
          {showPreview && (
            <Card className="p-4">
              <h4 className="text-slate-900 mb-4">Data Preview</h4>
              {renderPreviewTable()}
            </Card>
          )}

          {/* Import Result */}
          {importResult && (
            <div
              className={`p-4 rounded-lg border ${
                importResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle className="size-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="size-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <p
                    className={`text-sm ${
                      importResult.success ? 'text-green-900' : 'text-red-900'
                    }`}
                    style={{ fontWeight: 600 }}
                  >
                    {importResult.success ? 'Import Successful!' : 'Import Failed'}
                  </p>
                  <p
                    className={`text-sm mt-1 ${
                      importResult.success ? 'text-green-700' : 'text-red-700'
                    }`}
                  >
                    {importResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleImport}
              disabled={
                !validationResult ||
                !validationResult.valid ||
                validationResult.data.length === 0 ||
                uploading
              }
              className="flex-1"
              style={{ backgroundColor: config.color }}
            >
              {uploading ? (
                <>Processing...</>
              ) : (
                <>
                  <Upload className="size-4 mr-2" />
                  Import {validationResult?.data.length || 0} Rows
                </>
              )}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Template Info */}
      <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <p style={{ fontWeight: 600 }}>How to use:</p>
            <ol className="mt-2 space-y-1 ml-4 list-decimal text-blue-700">
              <li>Download the template using the button above</li>
              <li>The template includes example data - review the format</li>
              <li>Replace example data with your own data (keep headers unchanged)</li>
              <li>Save and upload your file using drag & drop or browse</li>
              <li>Review the validation results and fix any errors</li>
              <li>Click Import to add the data to your database</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}