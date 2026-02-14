import React from 'react';
import { FormQuestion, QualificationCriteria, QualificationRule } from '@/types/form';
import { Plus, Trash2, Info } from 'lucide-react';

interface QualificationRuleBuilderProps {
    questions: FormQuestion[];
    criteria: QualificationCriteria;
    onChange: (criteria: QualificationCriteria) => void;
}

const QualificationRuleBuilder: React.FC<QualificationRuleBuilderProps> = ({
    questions,
    criteria,
    onChange,
}) => {
    const addRule = () => {
        const defaultQuestion = questions.find(q => q.type === 'select' || q.type === 'radio');
        if (!defaultQuestion) return;

        const newRule: QualificationRule = {
            id: crypto.randomUUID(),
            questionId: defaultQuestion.id,
            operator: 'equals',
            value: defaultQuestion.options?.[0]?.value || '',
        };

        onChange({
            ...criteria,
            rules: [...criteria.rules, newRule],
        });
    };

    const removeRule = (id: string) => {
        onChange({
            ...criteria,
            rules: criteria.rules.filter(r => r.id !== id),
        });
    };

    const updateRule = (id: string, field: keyof QualificationRule, value: any) => {
        onChange({
            ...criteria,
            rules: criteria.rules.map(r => (r.id === id ? { ...r, [field]: value } : r)),
        });
    };

    // Only allow selecting questions that have options (select/radio) for now, to simplify logic
    const validQuestions = questions.filter(
        q => q.type === 'select' || q.type === 'radio'
    );

    if (validQuestions.length === 0) {
        return (
            <div className="p-4 border border-border rounded-lg bg-muted/20 text-center">
                <p className="text-muted-foreground text-sm">
                    Adicione perguntas de seleção para configurar regras de qualificação.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium">Regras de Qualificação</h3>
                    <p className="text-xs text-muted-foreground">
                        Leads que atenderem a estas regras serão marcados como qualificados.
                    </p>
                </div>
                <button
                    onClick={addRule}
                    className="text-xs flex items-center gap-1 btn-secondary py-1 px-3"
                >
                    <Plus className="w-3 h-3" /> Adicionar Regra
                </button>
            </div>

            {criteria.rules.length > 0 && (
                <div className="flex items-center gap-2 mb-2 bg-muted/30 p-2 rounded">
                    <span className="text-xs font-medium">Lógica:</span>
                    <select
                        className="text-xs bg-transparent border-none focus:ring-0 font-bold text-primary cursor-pointer"
                        value={criteria.logic}
                        onChange={e => onChange({ ...criteria, logic: e.target.value as 'AND' | 'OR' })}
                    >
                        <option value="AND">TODAS as regras (E)</option>
                        <option value="OR">PELO MENOS UMA regra (OU)</option>
                    </select>
                </div>
            )}

            <div className="space-y-3">
                {criteria.rules.map((rule, index) => {
                    const question = questions.find(q => q.id === rule.questionId);

                    return (
                        <div key={rule.id} className="flex gap-2 items-center p-3 border border-border rounded-lg bg-card">
                            <span className="text-xs font-mono text-muted-foreground w-6 text-center">
                                {index === 0 ? 'SE' : criteria.logic === 'AND' ? 'E' : 'OU'}
                            </span>

                            <select
                                className="admin-input flex-1 h-9 text-sm"
                                value={rule.questionId}
                                onChange={e => updateRule(rule.id, 'questionId', e.target.value)}
                            >
                                {validQuestions.map(q => (
                                    <option key={q.id} value={q.id}>
                                        {q.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="admin-input w-24 h-9 text-sm"
                                value={rule.operator}
                                onChange={e => updateRule(rule.id, 'operator', e.target.value)}
                            >
                                <option value="equals">Igual a</option>
                                <option value="contains">Contém</option>
                                <option value="greaterThan">Maior que</option>
                                <option value="lessThan">Menor que</option>
                            </select>

                            {question?.options && (
                                <select
                                    className="admin-input flex-1 h-9 text-sm"
                                    value={rule.value}
                                    onChange={e => updateRule(rule.id, 'value', e.target.value)}
                                >
                                    {question.options.map(opt => (
                                        <option key={opt.id} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <button
                                onClick={() => removeRule(rule.id)}
                                className="text-muted-foreground hover:text-destructive p-1.5 hover:bg-muted rounded-md transition-colors"
                                title="Remover regra"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}

                {criteria.rules.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                        <Info className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">
                            Nenhuma regra definida.<br />
                            Por padrão, todos os leads serão considerados <strong>Qualificados</strong>.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualificationRuleBuilder;
