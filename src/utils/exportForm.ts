import { LeadForm } from '@/types/form';
import { generateFormHTML } from './formGenerator';

export function exportToHTML(form: LeadForm) {
  const html = generateFormHTML(form);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `formulario-${form.slug}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
