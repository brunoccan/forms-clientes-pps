import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForms } from '@/contexts/FormsContext';
import { LeadForm, defaultForm, createSlug } from '@/types/form';
import { toast } from 'sonner';
import { Save, Eye, ArrowLeft, Plus, X, GripVertical, Send, Cloud, ExternalLink } from 'lucide-react';
import { exportToHTML } from '@/utils/exportForm';
import { deployFormToVercel } from '@/utils/deployForm';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import QuestionEditor from '@/components/QuestionEditor';
import { SortableQuestionItem } from '@/components/SortableQuestionItem';
import QualificationRuleBuilder from '@/components/QualificationRuleBuilder';
import { FormQuestion, defaultQuestions, QualificationCriteria } from '@/types/form';

const FormEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getForm, addForm, updateForm } = useForms();
  const isNew = id === 'new';

  const [form, setForm] = useState<Omit<LeadForm, 'id' | 'createdAt' | 'updatedAt'>>({ ...defaultForm });
  const [activeTab, setActiveTab] = useState('basic');
  const [newCity, setNewCity] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isDeploying, setIsDeploying] = useState(false);
  const [questions, setQuestions] = useState<FormQuestion[]>(defaultQuestions);
  const [criteria, setCriteria] = useState<QualificationCriteria>({ rules: [], logic: 'AND' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!isNew && id) {
      const existing = getForm(id);
      if (existing) {
        const { id: _, createdAt: __, updatedAt: ___, ...rest } = existing;
        setForm(rest);

        // Migration/Loading logic
        if (existing.questions && existing.questions.length > 0) {
          setQuestions(existing.questions);
        } else {
          // Migrate legacy fields to questions if needed
          const migratedQuestions = [...defaultQuestions];

          // Migrate cities
          if (existing.cities && existing.cities.length > 0) {
            const locQ = migratedQuestions.find(q => q.id === 'location');
            if (locQ) {
              locQ.options = existing.cities.map((c, i) => ({
                id: `opt-${i}`,
                label: c,
                value: c
              }));
            }
          }

          // Migrate energy values
          if (existing.energyValues && existing.energyValues.length > 0) {
            const billQ = migratedQuestions.find(q => q.id === 'billValue');
            if (billQ) {
              billQ.options = existing.energyValues.map((v, i) => ({
                id: `val-${i}`,
                label: v,
                value: v
              }));
            }
          }

          setQuestions(migratedQuestions);
        }

        if (existing.qualificationCriteria) {
          setCriteria(existing.qualificationCriteria);
        }
      } else {
        navigate('/dashboard');
      }
    }
  }, [id]);

  const updateField = (path: string, value: any) => {
    setForm(prev => {
      const parts = path.split('.');
      const updated = { ...prev } as any;
      let obj = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] };
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      if (path === 'companyName') {
        updated.slug = createSlug(value);
      }
      return updated;
    });
  };

  const addCity = () => {
    const city = newCity.trim();
    if (!city) return;
    if (form.cities.includes(city)) { toast.error('Cidade já adicionada'); return; }
    setForm(prev => ({ ...prev, cities: [...prev.cities.filter(c => c !== 'Outra'), city, 'Outra'] }));
    setNewCity('');
  };

  const removeCity = (city: string) => {
    if (city === 'Outra') return;
    setForm(prev => ({ ...prev, cities: prev.cities.filter(c => c !== city) }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (form.companyName.length < 3) errs.companyName = 'Mínimo 3 caracteres';
    if (form.cities.filter(c => c !== 'Outra').length < 2) errs.cities = 'Mínimo 2 cidades';
    if (form.webhooks.qualified && !/^https?:\/\/.+/.test(form.webhooks.qualified)) errs.webhookQ = 'URL inválida';
    if (form.webhooks.disqualified && !/^https?:\/\/.+/.test(form.webhooks.disqualified)) errs.webhookD = 'URL inválida';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { toast.error('Corrija os erros antes de salvar'); return; }
    const now = new Date().toISOString();

    if (isNew) {
      const newForm: LeadForm = {
        ...form,
        questions,
        qualificationCriteria: criteria,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };
      addForm(newForm);
      toast.success('Formulário criado!');
      navigate('/dashboard');
    } else {
      const existing = getForm(id!)!;
      const updatedFormData = {
        ...existing,
        ...form,
        questions,
        qualificationCriteria: criteria,
        updatedAt: now
      };
      updateForm(updatedFormData);
      toast.success('Formulário atualizado!');

      // Auto-deploy if enabled
      if (form.autoDeployOnSave && form.vercelToken) {
        toast.info('Iniciando deploy automático...', { id: 'auto-deploy' });
        setIsDeploying(true);

        try {
          const result = await deployFormToVercel(updatedFormData as LeadForm);

          if (result.success && result.url) {
            const deployedForm = {
              ...updatedFormData,
              deploymentUrl: result.url,
              vercelProjectId: result.projectId || form.vercelProjectId,
              lastDeployedAt: now,
            };
            updateForm(deployedForm);
            setForm({ ...form, deploymentUrl: result.url, lastDeployedAt: now });

            toast.success(
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Deploy automático concluído! 🚀</span>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  {result.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>,
              { id: 'auto-deploy', duration: 5000 }
            );
          } else {
            toast.error(`Auto-deploy falhou: ${result.error}`, { id: 'auto-deploy' });
          }
        } catch (error) {
          toast.error('Erro no auto-deploy', { id: 'auto-deploy' });
        } finally {
          setIsDeploying(false);
        }
      }
    }
  };

  const handleExport = () => {
    if (!validate()) { toast.error('Corrija os erros antes de exportar'); return; }
    const now = new Date().toISOString();
    const fullForm: LeadForm = {
      ...form,
      questions,
      qualificationCriteria: criteria,
      id: id || 'preview',
      createdAt: now,
      updatedAt: now
    };
    exportToHTML(fullForm);
    toast.success('HTML exportado!');
  };

  const testWebhook = async (url: string) => {
    if (!url) { toast.error('URL não configurada'); return; }
    try {
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, company: form.companyName, timestamp: new Date().toISOString() }),
      });
      toast.success(`Webhook respondeu: ${resp.status}`);
    } catch {
      toast.error('Erro ao testar webhook');
    }
  };

  const handleDeploy = async () => {
    if (!validate()) { toast.error('Corrija os erros antes de fazer deploy'); return; }
    if (!form.vercelToken) { toast.error('Configure o token da Vercel na aba Avançado'); return; }

    setIsDeploying(true);
    toast.loading('Fazendo deploy na Vercel...', { id: 'deploy' });

    try {
      const now = new Date().toISOString();
      const fullForm: LeadForm = {
        ...form,
        questions,
        qualificationCriteria: criteria,
        id: id || 'preview',
        createdAt: now,
        updatedAt: now
      };

      const result = await deployFormToVercel(fullForm);

      if (result.success && result.url) {
        // Update form with deployment info
        const updatedForm = {
          ...form,
          deploymentUrl: result.url,
          vercelProjectId: result.projectId || form.vercelProjectId,
          lastDeployedAt: now,
        };
        setForm(updatedForm);

        // Save if not new
        if (!isNew && id) {
          const existing = getForm(id)!;
          updateForm({ ...existing, ...updatedForm, updatedAt: now });
        }

        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-semibold">Deploy realizado com sucesso! 🚀</span>
            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              {result.url} <ExternalLink className="w-3 h-3" />
            </a>
          </div>,
          { id: 'deploy', duration: 5000 }
        );
      } else {
        toast.error(result.error || 'Erro ao fazer deploy', { id: 'deploy' });
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer deploy', { id: 'deploy' });
    } finally {
      setIsDeploying(false);
    }
  };

  const addQuestion = () => {
    const newQ: FormQuestion = {
      id: crypto.randomUUID(),
      type: 'text',
      label: 'Nova Pergunta',
      required: false,
      order: questions.length,
      isFixed: false
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestion = (updated: FormQuestion) => {
    setQuestions(questions.map(q => q.id === updated.id ? updated : q));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((q) => q.id === active.id);
        const newIndex = items.findIndex((q) => q.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order property for all items
        return newItems.map((q, index) => ({ ...q, order: index }));
      });
    }
  };

  const tabs = [
    { id: 'basic', label: 'Básico' },
    { id: 'questions', label: 'Perguntas' },
    { id: 'webhooks', label: 'Webhooks' },
    { id: 'customization', label: 'Personalização' },
    { id: 'advanced', label: 'Avançado' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isNew ? 'Novo Formulário' : `Editar: ${form.companyName}`}
            </h1>
            {form.slug && <p className="text-xs text-muted-foreground">formulario-{form.slug}.html</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" onClick={() => {
            if (!isNew && id) navigate(`/forms/${id}/preview`);
            else toast.info('Salve o formulário primeiro para visualizar');
          }}>
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <Save className="w-4 h-4" /> Exportar HTML
          </button>
          <button
            className="btn-secondary"
            onClick={handleDeploy}
            disabled={isDeploying}
          >
            <Cloud className="w-4 h-4" /> {isDeploying ? 'Deploying...' : 'Deploy Vercel'}
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-card p-6">
        {/* BASIC TAB */}
        {activeTab === 'basic' && (
          <div className="space-y-5 max-w-xl">
            <div>
              <label className="admin-label">Nome da Empresa *</label>
              <input className="admin-input w-full" value={form.companyName}
                onChange={e => updateField('companyName', e.target.value)} placeholder="Ex: VilaSol Energy" />
              {errors.companyName && <p className="text-destructive text-xs mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <label className="admin-label">Slug</label>
              <input className="admin-input w-full bg-muted" value={form.slug} readOnly />
            </div>
            <div>
              <label className="admin-label">Logo (URL)</label>
              <input className="admin-input w-full" value={form.logo}
                onChange={e => updateField('logo', e.target.value)} placeholder="https://..." />
              {form.logo && (
                <img src={form.logo} alt="Logo preview" className="mt-2 h-12 object-contain rounded bg-muted p-1" />
              )}
            </div>
            <div>
              <label className="admin-label">Domínio / Subdomínio</label>
              <input className="admin-input w-full" value={form.domain}
                onChange={e => updateField('domain', e.target.value)} placeholder="empresa.ocdc.com.br" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Cor Primária</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.colors.primary}
                    onChange={e => updateField('colors.primary', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <input className="admin-input flex-1" value={form.colors.primary}
                    onChange={e => updateField('colors.primary', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="admin-label">Cor Secundária</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={form.colors.secondary}
                    onChange={e => updateField('colors.secondary', e.target.value)}
                    className="w-10 h-10 rounded-lg border border-border cursor-pointer" />
                  <input className="admin-input flex-1" value={form.colors.secondary}
                    onChange={e => updateField('colors.secondary', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <div className="max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Perguntas do Formulário</h3>
              <button className="btn-primary py-1.5 px-3 text-sm" onClick={addQuestion}>
                <Plus className="w-4 h-4" /> Adicionar Pergunta
              </button>
            </div>

            <div className="bg-muted/20 p-4 rounded-lg border border-border">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {questions.map((q) => (
                      <SortableQuestionItem
                        key={q.id}
                        question={q}
                        onChange={updateQuestion}
                        onRemove={() => removeQuestion(q.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {/* WEBHOOKS TAB */}
        {activeTab === 'webhooks' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <label className="admin-label">Webhook Qualificado</label>
              <div className="flex gap-2">
                <input className="admin-input flex-1" value={form.webhooks.qualified}
                  onChange={e => updateField('webhooks.qualified', e.target.value)} placeholder="https://..." />
                <button className="btn-secondary" onClick={() => testWebhook(form.webhooks.qualified)}>
                  <Send className="w-4 h-4" /> Testar
                </button>
              </div>
              {errors.webhookQ && <p className="text-destructive text-xs mt-1">{errors.webhookQ}</p>}
            </div>
            <div>
              <label className="admin-label">Webhook Desqualificado</label>
              <div className="flex gap-2">
                <input className="admin-input flex-1" value={form.webhooks.disqualified}
                  onChange={e => updateField('webhooks.disqualified', e.target.value)} placeholder="https://..." />
                <button className="btn-secondary" onClick={() => testWebhook(form.webhooks.disqualified)}>
                  <Send className="w-4 h-4" /> Testar
                </button>
              </div>
              {errors.webhookD && <p className="text-destructive text-xs mt-1">{errors.webhookD}</p>}
            </div>
            <hr className="border-border" />
            <div>
              <label className="admin-label">URL Página de Obrigado (Qualificado)</label>
              <input className="admin-input w-full" value={form.redirects.qualified}
                onChange={e => updateField('redirects.qualified', e.target.value)} placeholder="https://empresa.com/obrigado" />
            </div>
            <div>
              <label className="admin-label">URL Página Desqualificado</label>
              <input className="admin-input w-full" value={form.redirects.disqualified}
                onChange={e => updateField('redirects.disqualified', e.target.value)} placeholder="https://empresa.com/desqualificado" />
            </div>
          </div>
        )}

        {/* CUSTOMIZATION TAB */}
        {activeTab === 'customization' && (
          <div className="space-y-5 max-w-xl">
            <div>
              <label className="admin-label">Título da Página</label>
              <input className="admin-input w-full" value={form.customization.pageTitle}
                onChange={e => updateField('customization.pageTitle', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Título Hero</label>
              <input className="admin-input w-full" value={form.customization.heroTitle}
                onChange={e => updateField('customization.heroTitle', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Subtítulo Hero</label>
              <input className="admin-input w-full" value={form.customization.heroSubtitle}
                onChange={e => updateField('customization.heroSubtitle', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Texto de Benefícios</label>
              <textarea className="admin-input w-full min-h-[100px]" value={form.customization.benefits}
                onChange={e => updateField('customization.benefits', e.target.value)}
                placeholder="Descreva os benefícios do serviço..." />
            </div>
            <div className="p-4 rounded-lg border border-border bg-muted/30">
              <p className="text-sm font-medium mb-2">Preview do Header</p>
              <div className="rounded-lg p-4 text-center" style={{ background: form.colors.primary, color: 'white' }}>
                <h3 className="font-bold text-lg">{form.customization.heroTitle || 'Título'}</h3>
                <p className="text-sm opacity-90">{form.customization.heroSubtitle || 'Subtítulo'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED TAB */}
        {activeTab === 'advanced' && (
          <div className="max-w-xl space-y-8">
            <QualificationRuleBuilder
              questions={questions}
              criteria={criteria}
              onChange={setCriteria}
            />

            <hr className="border-border" />

            <div>
              <label className="admin-label">Valores de Conta de Energia (Legado)</label>
              <p className="text-xs text-muted-foreground mb-3">Um por linha</p>
              <textarea
                className="admin-input w-full min-h-[160px] font-mono text-sm"
                value={form.energyValues.join('\n')}
                onChange={e => updateField('energyValues', e.target.value.split('\n').filter(Boolean))}
              />
            </div>

            <hr className="border-border" />

            <div>
              <label className="admin-label">Deploy Automático na Vercel</label>
              <p className="text-xs text-muted-foreground mb-3">
                Configure seu token da Vercel para fazer deploy automático.
                <a
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1"
                >
                  Criar token aqui
                </a>
              </p>
              <input
                className="admin-input w-full font-mono text-sm"
                type="password"
                value={form.vercelToken || ''}
                onChange={e => updateField('vercelToken', e.target.value)}
                placeholder="vercel_token_aqui"
              />
            </div>

            {form.vercelToken && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
                <input
                  type="checkbox"
                  id="auto-deploy-toggle"
                  checked={form.autoDeployOnSave || false}
                  onChange={e => updateField('autoDeployOnSave', e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <label htmlFor="auto-deploy-toggle" className="flex-1 cursor-pointer">
                  <div className="font-medium text-sm">Auto-deploy ao salvar</div>
                  <div className="text-xs text-muted-foreground">
                    Faz deploy automático na Vercel toda vez que você salvar o formulário
                  </div>
                </label>
                {form.autoDeployOnSave && (
                  <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></div>
                    Ativo
                  </div>
                )}
              </div>
            )}

            {form.deploymentUrl && (
              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <p className="text-sm font-medium mb-2">Último Deploy</p>
                <a
                  href={form.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {form.deploymentUrl} <ExternalLink className="w-3 h-3" />
                </a>
                {form.lastDeployedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(form.lastDeployedAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormEditorPage;
