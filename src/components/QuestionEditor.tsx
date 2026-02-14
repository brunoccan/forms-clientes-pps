import React from 'react';
import { FormQuestion, QuestionType } from '@/types/form';
import { X, Plus, GripVertical } from 'lucide-react';

interface QuestionEditorProps {
    question: FormQuestion;
    onChange: (updated: FormQuestion) => void;
    onRemove: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onChange, onRemove }) => {
    const updateField = (field: keyof FormQuestion, value: any) => {
        onChange({ ...question, [field]: value });
    };

    const addOption = () => {
        const newOption = {
            id: crypto.randomUUID(),
            label: `Opção ${(question.options?.length || 0) + 1}`,
            value: `Opção ${(question.options?.length || 0) + 1}`,
        };
        onChange({
            ...question,
            options: [...(question.options || []), newOption],
        });
    };

    const updateOption = (id: string, field: 'label' | 'value', value: string) => {
        const newOptions = question.options?.map(opt =>
            opt.id === id ? { ...opt, [field]: value, value: field === 'label' ? value : opt.value } : opt
        );
        onChange({ ...question, options: newOptions });
    };

    const removeOption = (id: string) => {
        const newOptions = question.options?.filter(opt => opt.id !== id);
        onChange({ ...question, options: newOptions });
    };

    return (
        <div className="border border-border rounded-lg p-4 bg-card mb-4 relative group">
            <div className="absolute top-2 right-2 flex gap-2">
                {!question.isFixed && (
                    <button
                        onClick={onRemove}
                        className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-muted transition-colors"
                        title="Remover pergunta"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="admin-label">Pergunta</label>
                        <input
                            className="admin-input w-full"
                            value={question.label}
                            onChange={e => updateField('label', e.target.value)}
                            placeholder="Digite a pergunta..."
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="admin-label">Tipo</label>
                        <select
                            className="admin-input w-full"
                            value={question.type}
                            onChange={e => updateField('type', e.target.value as QuestionType)}
                            disabled={question.isFixed}
                        >
                            <option value="text">Texto Curto</option>
                            <option value="textarea">Texto Longo</option>
                            <option value="email">E-mail</option>
                            <option value="phone">Telefone</option>
                            <option value="select">Seleção (Lista)</option>
                            <option value="radio">Seleção (Radio)</option>
                        </select>
                    </div>
                </div>

                {question.type !== 'select' && question.type !== 'radio' && (
                    <div>
                        <label className="admin-label">Placeholder</label>
                        <input
                            className="admin-input w-full"
                            value={question.placeholder || ''}
                            onChange={e => updateField('placeholder', e.target.value)}
                            placeholder="Ex: Digite sua resposta..."
                        />
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id={`req-${question.id}`}
                        checked={question.required}
                        onChange={e => updateField('required', e.target.checked)}
                        disabled={question.isFixed}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor={`req-${question.id}`} className="text-sm font-medium cursor-pointer">
                        Obrigatória
                    </label>
                </div>

                {(question.type === 'select' || question.type === 'radio') && (
                    <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Opções</label>
                            <button
                                onClick={addOption}
                                className="text-xs flex items-center gap-1 text-primary hover:underline font-medium"
                            >
                                <Plus className="w-3 h-3" /> Adicionar Opção
                            </button>
                        </div>

                        <div className="space-y-2">
                            {question.options?.map((opt, index) => (
                                <div key={opt.id} className="flex gap-2 items-center">
                                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                                    <input
                                        className="admin-input flex-1 h-9 text-sm"
                                        value={opt.label}
                                        onChange={e => updateOption(opt.id, 'label', e.target.value)}
                                        placeholder={`Opção ${index + 1}`}
                                    />
                                    <button
                                        onClick={() => removeOption(opt.id)}
                                        className="text-muted-foreground hover:text-destructive p-1"
                                        title="Remover opção"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}

                            {(!question.options || question.options.length === 0) && (
                                <p className="text-xs text-muted-foreground text-center py-2">
                                    Nenhuma opção adicionada.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionEditor;
