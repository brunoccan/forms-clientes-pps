import { generateFormHTML } from './src/utils/formGenerator';
import { LeadForm, defaultForm, FormQuestion, defaultQuestions } from './src/types/form';

const debugForm: LeadForm = {
    ...defaultForm,
    id: 'debug-id',
    companyName: 'Debug Co',
    questions: defaultQuestions,
    qualificationCriteria: { rules: [], logic: 'AND' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

try {
    const html = generateFormHTML(debugForm);

    // Extract step divs with content - using simple regex
    // We want to see the onclick handlers and data-step attributes

    // Step 4 (Location)
    const locMatch = html.match(/<div class="step.*?" data-step="4" data-qid="location">([\s\S]*?)<\/div>/);
    if (locMatch) {
        console.log('\n--- STEP 4 (LOCATION) ---');
        console.log(locMatch[0].substring(0, 500) + '...'); // Print first 500 chars
    } else {
        console.log('\n--- STEP 4 NOT FOUND ---');
    }

    // Step 5 (Priority)
    const prioMatch = html.match(/<div class="step.*?" data-step="5" data-qid="priority">([\s\S]*?)<\/div>/);
    if (prioMatch) {
        console.log('\n--- STEP 5 (PRIORITY) ---');
        console.log(prioMatch[0].substring(0, 500) + '...');
    } else {
        console.log('\n--- STEP 5 NOT FOUND ---');
    }

    // Check for any hardcoded steps with data-step="4" or "5" that are NOT the ones above
    // This detects duplicates
    const allStep4 = html.match(/data-step="4"/g);
    console.log(`\nOccurrences of data-step="4": ${allStep4?.length}`);

    const allStep5 = html.match(/data-step="5"/g);
    console.log(`Occurrences of data-step="5": ${allStep5?.length}`);


} catch (error) {
    console.error('Error:', error);
}
