import { useState, useRef } from 'react';
import { DocFile } from '@/lib/types';
import { toast } from 'sonner';
import { Upload, X, FileText, Image } from 'lucide-react';

interface DocumentUploadProps {
  label: string;
  accept?: string;
  documents: DocFile[];
  onDocumentsChange: (docs: DocFile[]) => void;
}

export function DocumentUpload({ label, accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png', documents, onDocumentsChange }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const maxSize = 10 * 1024 * 1024; // 10MB
    const newDocs: DocFile[] = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} excede o limite de 10MB`);
        return;
      }
      newDocs.push({ name: file.name, type: file.type, size: file.size });
    });

    if (newDocs.length > 0) {
      onDocumentsChange([...documents, ...newDocs]);
      toast.success(`${newDocs.length} arquivo(s) adicionado(s)`);
    }
  };

  const removeDoc = (index: number) => {
    onDocumentsChange(documents.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-3.5 h-3.5 text-primary" />;
    return <FileText className="w-3.5 h-3.5 text-primary" />;
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/[0.12]'); }}
        onDragLeave={e => { e.currentTarget.classList.remove('border-primary', 'bg-primary/[0.12]'); }}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-primary', 'bg-primary/[0.12]'); handleFiles(e.dataTransfer.files); }}
        className="w-full border border-dashed border-input rounded-[6px] p-5 text-center hover:border-primary hover:bg-primary/[0.12] transition-all"
      >
        <Upload className="w-4 h-4 mx-auto mb-1.5 text-muted-foreground" />
        <div className="text-[11px] font-medium mb-0.5">{label}</div>
        <div className="text-[10px] text-muted-foreground">PDF, DOC, DOCX, JPG, PNG — até 10MB</div>
      </button>

      {documents.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center gap-2 bg-secondary/60 border border-input/50 rounded-[6px] px-3 py-2">
              {getIcon(doc.type)}
              <span className="text-[12px] text-foreground truncate flex-1">{doc.name}</span>
              <span className="text-[10px] text-muted-foreground">{formatSize(doc.size)}</span>
              <button type="button" onClick={() => removeDoc(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
