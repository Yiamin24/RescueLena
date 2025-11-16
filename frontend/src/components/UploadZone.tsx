import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, File, Image as ImageIcon, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../lib/api';

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
      // Reset input so same file can be uploaded again
      e.target.value = '';
    }
  };

  const processFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      status: 'pending',
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsExpanded(true);

    // Check if all files are images for batch upload
    const allImages = files.every(f => f.type.startsWith('image/'));
    
    if (allImages && files.length > 1) {
      // Use batch upload for multiple images
      batchUpload(newFiles);
    } else {
      // Upload individually
      newFiles.forEach(uploadedFile => {
        simulateUpload(uploadedFile);
      });
    }
  };

  const batchUpload = async (uploadedFiles: UploadedFile[]) => {
    // Update all to uploading
    uploadedFiles.forEach(uf => {
      setUploadedFiles(prev => 
        prev.map(f => f.id === uf.id ? { ...f, status: 'uploading' as const } : f)
      );
    });

    try {
      const files = uploadedFiles.map(uf => uf.file);
      const result = await api.batchUpload(files);
      
      // Mark all as completed
      uploadedFiles.forEach(uf => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === uf.id ? { ...f, status: 'completed' as const, progress: 100 } : f)
        );
      });

      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('incident-uploaded'));
      
    } catch (error) {
      console.error('Batch upload error:', error);
      // Mark all as error
      uploadedFiles.forEach(uf => {
        setUploadedFiles(prev => 
          prev.map(f => f.id === uf.id ? { ...f, status: 'error' as const } : f)
        );
      });
    }
  };

  const simulateUpload = async (uploadedFile: UploadedFile) => {
    // Update status to uploading
    setUploadedFiles(prev => 
      prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'uploading' as const } : f)
    );

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(f => {
          if (f.id === uploadedFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        })
      );
    }, 100);

    // Call API
    try {
      let result;
      if (uploadedFile.file.type.startsWith('image/')) {
        result = await api.analyzeImage(uploadedFile.file);
      } else if (uploadedFile.file.type.includes('pdf') || uploadedFile.file.type.includes('document')) {
        result = await api.analyzeDocument(uploadedFile.file);
      } else {
        throw new Error('Unsupported file type');
      }

      clearInterval(progressInterval);
      
      // Check if duplicate
      if (result.duplicate) {
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'completed' as const, progress: 100 } : f)
        );
        
        // Show duplicate message
        alert(`⚠️ Duplicate Incident!\n\nA similar ${result.existing_incident?.type} incident already exists ${result.distance_meters}m away.\n\nShowing existing incident instead.`);
        
        // Trigger dashboard refresh to show existing incident
        window.dispatchEvent(new CustomEvent('incident-uploaded'));
      } else {
        // New incident created
        setUploadedFiles(prev => 
          prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'completed' as const, progress: 100 } : f)
        );
        
        // Show success message
        alert(`✅ Incident Created!\n\nType: ${result.type}\nLocation: ${result.location}\nUrgency: ${result.urgency}\n\nIncident added to dashboard.`);
        
        // Trigger dashboard refresh
        window.dispatchEvent(new CustomEvent('incident-uploaded'));
      }
      
      // Auto-remove file after 3 seconds
      setTimeout(() => {
        setUploadedFiles(prev => prev.filter(f => f.id !== uploadedFile.id));
      }, 3000);
      
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => f.id === uploadedFile.id ? { ...f, status: 'error' as const } : f)
      );
      
      // Show error message
      alert(`❌ Upload Failed!\n\n${error.message || 'Please try again.'}`);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return ImageIcon;
    if (file.type.includes('pdf') || file.type.includes('document')) return FileText;
    return File;
  };

  return (
    <div className="space-y-3">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 text-white border border-purple-500/30"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isExpanded ? 'Hide' : 'Show'} Upload Zone
        {uploadedFiles.length > 0 && (
          <span className="ml-2 bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs">
            {uploadedFiles.length}
          </span>
        )}
      </Button>

      {/* Upload Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 rounded-xl border-2 border-dashed transition-all ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/20 bg-white/5'
              }`}
            >
              <div className="text-center">
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-400' : 'text-slate-400'}`} />
                <h3 className="text-lg text-white mb-2">
                  Drop files here or click to browse
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Supports: Images, PDFs, Documents (up to 100 files)
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label 
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium cursor-pointer transition-all"
                >
                  Select Files
                </label>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {uploadedFiles.map(uploadedFile => {
                  const FileIconComponent = getFileIcon(uploadedFile.file);
                  
                  return (
                    <motion.div
                      key={uploadedFile.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3"
                    >
                      {/* Preview/Icon */}
                      <div className="flex-shrink-0">
                        {uploadedFile.preview ? (
                          <img 
                            src={uploadedFile.preview} 
                            alt={uploadedFile.file.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded bg-purple-500/20 flex items-center justify-center">
                            <FileIconComponent className="w-6 h-6 text-purple-400" />
                          </div>
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{uploadedFile.file.name}</div>
                        <div className="text-xs text-slate-400">
                          {(uploadedFile.file.size / 1024).toFixed(1)} KB
                        </div>
                        
                        {/* Progress Bar */}
                        {uploadedFile.status === 'uploading' && (
                          <div className="mt-1 w-full bg-white/10 rounded-full h-1 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                              style={{ width: `${uploadedFile.progress}%` }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                        {uploadedFile.status === 'uploading' && (
                          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                        )}
                        {uploadedFile.status === 'completed' && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {uploadedFile.status === 'error' && (
                          <X className="w-5 h-5 text-red-400" />
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFile(uploadedFile.id)}
                        className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-slate-400" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
