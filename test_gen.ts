import { generateFormHTML } from './src/utils/formGenerator';
import { LeadForm, defaultForm, FormQuestion } from './src/types/form';

const mockQuestions: FormQuestion[] = [
    {
        id: 'test-q1',
        type: 'text',
        label: 'Pergunta de Teste 1',
        placeholder: 'Digite algo...',
        required: true,
        order: 0,
        isFixed: false,
    },
    {
        id: 'test-q2',
        type: 'select',
        label: 'Pergunta de Seleção',
        required: false,
        order: 1,
        isFixed: false,
        options: [
            { id: 'opt1', label: 'Opção A', value: 'ValA' },
            { id: 'opt2', label: 'Opção B', value: 'ValB' },
        ]
    }
];

const mockForm: LeadForm = {
    ...defaultForm,
    id: 'test-id',
    companyName: 'Test Company',
    questions: mockQuestions,
    qualificationCriteria: {
        rules: [
            { id: 'r1', questionId: 'test-q2', operator: 'equals', value: 'ValA' }
        ],
        logic: 'AND'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

try {
    const html = generateFormHTML(mockForm);

    // Checks
    if (!html.includes('Pergunta de Teste 1')) throw new Error('Pergunta de texto não encontrada');
    if (!html.includes('Opção A')) throw new Error('Opção de seleção não encontrada');
    if (!html.includes('ValA')) throw new Error('Valor da opção não encontrado');
    if (!html.includes('checkQualification()')) throw new Error('Lógica de qualificação não encontrada');

    console.log('✅ Form generation test passed successfully!');
} catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
}
