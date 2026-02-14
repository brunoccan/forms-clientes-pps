import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForms } from '@/contexts/FormsContext';
import { generateFormHTML } from '@/utils/formGenerator';
import { ArrowLeft, Monitor, Smartphone, Download } from 'lucide-react';
import { exportToHTML } from '@/utils/exportForm';

const FormPreviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getForm } = useForms();
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (id) {
      const form = getForm(id);
      if (form) {
        setHtml(generateFormHTML(form));
      } else {
        navigate('/dashboard');
      }
    }
  }, [id]);

  const form = id ? getForm(id) : undefined;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={() => navigate(id ? `/forms/${id}` : '/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Preview: {form?.companyName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-card shadow-sm' : 'text-muted-foreground'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
          {form && (
            <button className="btn-primary" onClick={() => exportToHTML(form)}>
              <Download className="w-4 h-4" /> Exportar HTML
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div
          className={`bg-card rounded-xl border border-border shadow-lg overflow-hidden transition-all duration-300 ${
            viewMode === 'mobile' ? 'w-[375px]' : 'w-full max-w-4xl'
          }`}
          style={{ height: '80vh' }}
        >
          <iframe
            srcDoc={html}
            className="w-full h-full border-0"
            title="Form Preview"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    </div>
  );
};

export default FormPreviewPage;
