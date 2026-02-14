import React, { useState } from 'react';
import { useForms } from '@/contexts/FormsContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Building2, Globe, Calendar, Eye, Pencil, Download, Trash2, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { exportToHTML } from '@/utils/exportForm';
import { toast } from 'sonner';

const Dashboard = () => {
  const { forms, deleteForm, duplicateForm, updateForm } = useForms();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = forms.filter(f =>
    f.companyName.toLowerCase().includes(search.toLowerCase()) ||
    f.domain.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar "${name}"?`)) {
      deleteForm(id);
      toast.success('Formulário deletado');
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateForm(id);
    toast.success('Formulário duplicado');
  };

  const handleToggle = (form: typeof forms[0]) => {
    updateForm({ ...form, active: !form.active });
    toast.success(form.active ? 'Formulário desativado' : 'Formulário ativado');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{forms.length} formulário(s) cadastrado(s)</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/forms/new')}>
          <Plus className="w-4 h-4" /> Novo Formulário
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="admin-input w-full pl-10 max-w-sm"
          placeholder="Buscar formulários..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="admin-card p-12 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">Nenhum formulário encontrado</h3>
          <p className="text-muted-foreground text-sm mb-4">Crie seu primeiro formulário de captação de leads</p>
          <button className="btn-primary" onClick={() => navigate('/forms/new')}>
            <Plus className="w-4 h-4" /> Criar Formulário
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(form => (
            <div key={form.id} className="admin-card p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {form.logo ? (
                    <img src={form.logo} alt="" className="w-10 h-10 rounded-lg object-contain bg-muted flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                         style={{ background: form.colors.primary + '18', color: form.colors.primary }}>
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{form.companyName}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{form.domain || 'Sem domínio'}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleToggle(form)} title={form.active ? 'Desativar' : 'Ativar'}>
                  {form.active ? (
                    <ToggleRight className="w-6 h-6 text-success" />
                  ) : (
                    <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 mb-4 text-xs text-muted-foreground">
                <span className={form.active ? 'status-active' : 'status-inactive'}>
                  {form.active ? 'Ativo' : 'Inativo'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(form.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center gap-1 mt-auto pt-3 border-t border-border">
                <button className="btn-ghost text-xs flex-1 justify-center" onClick={() => navigate(`/forms/${form.id}`)}>
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button className="btn-ghost text-xs flex-1 justify-center" onClick={() => navigate(`/forms/${form.id}/preview`)}>
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <button className="btn-ghost text-xs flex-1 justify-center" onClick={() => exportToHTML(form)}>
                  <Download className="w-3.5 h-3.5" /> Exportar
                </button>
                <button className="btn-ghost text-xs" onClick={() => handleDuplicate(form.id)} title="Duplicar">
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button className="btn-ghost text-xs text-destructive" onClick={() => handleDelete(form.id, form.companyName)} title="Deletar">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
