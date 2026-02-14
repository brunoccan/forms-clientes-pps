export type QuestionType = 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'radio';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface FormQuestion {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  order: number;
  isFixed: boolean; // true para nome, email, whatsapp
  options?: QuestionOption[]; // para tipo 'select' ou 'radio'
}

export interface QualificationRule {
  id: string;
  questionId: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan';
  value: string;
}

export interface QualificationCriteria {
  rules: QualificationRule[];
  logic: 'AND' | 'OR';
}

export interface LeadForm {
  id: string;
  companyName: string;
  slug: string;
  logo: string;
  domain: string;
  colors: {
    primary: string;
    secondary: string;
  };
  // Legacy fields (kept for backward compatibility during migration)
  cities?: string[];
  energyValues?: string[];

  // New fields
  questions: FormQuestion[];
  qualificationCriteria: QualificationCriteria;

  webhooks: {
    qualified: string;
    disqualified: string;
  };
  redirects: {
    qualified: string;
    disqualified: string;
  };
  customization: {
    pageTitle: string;
    heroTitle: string;
    heroSubtitle: string;
    benefits: string;
  };
  createdAt: string;
  updatedAt: string;
  active: boolean;
  // Vercel deployment
  vercelToken?: string;
  vercelProjectId?: string;
  deploymentUrl?: string;
  lastDeployedAt?: string;
  autoDeployOnSave?: boolean;
}

export const defaultQuestions: FormQuestion[] = [
  {
    id: 'name',
    type: 'text',
    label: 'Qual o seu nome?',
    placeholder: 'Digite seu nome',
    required: true,
    order: 0,
    isFixed: true,
  },
  {
    id: 'whatsapp',
    type: 'phone',
    label: 'Seu WhatsApp',
    placeholder: '(00) 00000-0000',
    required: true,
    order: 1,
    isFixed: true,
  },
  {
    id: 'email',
    type: 'email',
    label: 'Seu e-mail',
    placeholder: 'seuemail@exemplo.com',
    required: true,
    order: 2,
    isFixed: true,
  },
  {
    id: 'location',
    type: 'select',
    label: 'Qual sua localidade?',
    required: true,
    order: 3,
    isFixed: false,
    options: [
      { id: 'opt-1', label: 'São Paulo/SP', value: 'São Paulo/SP' },
      { id: 'opt-2', label: 'Outra', value: 'Outra' },
    ],
  },
  {
    id: 'priority',
    type: 'select',
    label: 'Qual seu nível de prioridade?',
    required: true,
    order: 4,
    isFixed: false,
    options: [
      { id: 'prio-1', label: 'Comecei a pesquisar agora. Pouco urgente', value: 'Baixa' },
      { id: 'prio-2', label: 'Estou fazendo cotações e pretendo me decidir em breve', value: 'Média' },
      { id: 'prio-3', label: 'Tenho grande prioridade em começar a economizar', value: 'Alta' },
    ],
  },
  {
    id: 'billValue',
    type: 'select',
    label: 'Valor da conta de energia',
    required: true,
    order: 5,
    isFixed: false,
    options: [
      { id: 'val-1', label: 'Até R$ 200', value: 'Até R$ 200' },
      { id: 'val-2', label: 'R$ 200 a R$ 400', value: 'R$ 200 a R$ 400' },
      { id: 'val-3', label: 'R$ 400 a R$ 600', value: 'R$ 400 a R$ 600' },
      { id: 'val-4', label: 'R$ 600 a R$ 800', value: 'R$ 600 a R$ 800' },
      { id: 'val-5', label: 'Acima de R$ 1.000', value: 'Acima de R$ 1.000' },
    ],
  },
];

export const defaultForm: Omit<LeadForm, 'id' | 'createdAt' | 'updatedAt'> = {
  companyName: '',
  slug: '',
  logo: '',
  domain: '',
  colors: { primary: '#3b82f6', secondary: '#fbbf24' },
  questions: defaultQuestions,
  qualificationCriteria: {
    rules: [],
    logic: 'AND',
  },
  webhooks: { qualified: '', disqualified: '' },
  redirects: { qualified: '', disqualified: '' },
  customization: {
    pageTitle: 'Simulador Solar',
    heroTitle: 'Economize até 95% na conta de luz',
    heroSubtitle: 'Solicite agora uma análise gratuita',
    benefits: '',
  },
  active: true,
  vercelToken: '',
  vercelProjectId: '',
  deploymentUrl: '',
  lastDeployedAt: '',
  autoDeployOnSave: false,
};

export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
