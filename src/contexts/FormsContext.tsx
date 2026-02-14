import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LeadForm } from '@/types/form';

interface FormsContextType {
  forms: LeadForm[];
  addForm: (form: LeadForm) => void;
  updateForm: (form: LeadForm) => void;
  deleteForm: (id: string) => void;
  getForm: (id: string) => LeadForm | undefined;
  duplicateForm: (id: string) => LeadForm;
}

const FormsContext = createContext<FormsContextType | null>(null);

const STORAGE_KEY = 'admin_forms';

const sampleForms: LeadForm[] = [
  {
    id: 'sample-1',
    companyName: 'VilaSol Energy',
    slug: 'vilasol-energy',
    logo: '',
    domain: 'vilasol.ocdc.com.br',
    colors: { primary: '#ff8533', secondary: '#ffc933' },
    cities: ['Cotia/SP', 'São Paulo/SP', 'Campinas/SP', 'Outra'],
    webhooks: { qualified: 'https://webhook.site/qualified', disqualified: 'https://webhook.site/disqualified' },
    redirects: { qualified: 'https://vilasol.com.br/obrigado', disqualified: 'https://vilasol.com.br/desqualificado' },
    customization: {
      pageTitle: 'Simulador Solar',
      heroTitle: 'Economize até 95% na conta de luz',
      heroSubtitle: 'Solicite agora uma análise gratuita',
      benefits: '',
    },
    energyValues: ['Até R$ 200', 'R$ 200 a R$ 400', 'R$ 400 a R$ 600', 'R$ 600 a R$ 800', 'R$ 800 a R$ 1.000', 'Acima de R$ 1.000'],
    createdAt: '2026-02-14T10:00:00Z',
    updatedAt: '2026-02-14T10:00:00Z',
    active: true,
  },
];

export function FormsProvider({ children }: { children: ReactNode }) {
  const [forms, setForms] = useState<LeadForm[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : sampleForms;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
  }, [forms]);

  const addForm = (form: LeadForm) => setForms(prev => [...prev, form]);

  const updateForm = (form: LeadForm) =>
    setForms(prev => prev.map(f => (f.id === form.id ? { ...form, updatedAt: new Date().toISOString() } : f)));

  const deleteForm = (id: string) => setForms(prev => prev.filter(f => f.id !== id));

  const getForm = (id: string) => forms.find(f => f.id === id);

  const duplicateForm = (id: string) => {
    const original = forms.find(f => f.id === id)!;
    const newForm: LeadForm = {
      ...original,
      id: crypto.randomUUID(),
      companyName: `${original.companyName} (Cópia)`,
      slug: `${original.slug}-copia`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setForms(prev => [...prev, newForm]);
    return newForm;
  };

  return (
    <FormsContext.Provider value={{ forms, addForm, updateForm, deleteForm, getForm, duplicateForm }}>
      {children}
    </FormsContext.Provider>
  );
}

export function useForms() {
  const ctx = useContext(FormsContext);
  if (!ctx) throw new Error('useForms must be used within FormsProvider');
  return ctx;
}
