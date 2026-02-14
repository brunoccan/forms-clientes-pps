import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormQuestion } from '@/types/form';
import QuestionEditor from './QuestionEditor';

interface SortableQuestionItemProps {
    question: FormQuestion;
    onChange: (updated: FormQuestion) => void;
    onRemove: () => void;
}

export function SortableQuestionItem({ question, onChange, onRemove }: SortableQuestionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <QuestionEditor
                question={question}
                onChange={onChange}
                onRemove={onRemove}
            />
        </div>
    );
}
