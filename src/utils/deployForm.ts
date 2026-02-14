import { LeadForm } from '@/types/form';
import { generateFormHTML } from './formGenerator';
import { VercelService } from '@/services/vercelService';

export interface DeployResult {
    success: boolean;
    url?: string;
    deploymentId?: string;
    projectId?: string;
    error?: string;
}

/**
 * Deploy form to Vercel
 * @param form - Form to deploy
 * @returns Deployment result with URL
 */
export async function deployFormToVercel(
    form: LeadForm
): Promise<DeployResult> {
    try {
        // Validate token
        if (!form.vercelToken) {
            return {
                success: false,
                error: 'Token da Vercel não configurado. Configure nas opções avançadas.',
            };
        }

        // Validate token first
        const isValidToken = await VercelService.validateToken(form.vercelToken);
        if (!isValidToken) {
            return {
                success: false,
                error: 'Token da Vercel inválido. Verifique o token nas configurações.',
            };
        }

        // Generate HTML
        const html = generateFormHTML(form);

        // Create deployment
        const deployment = await VercelService.createDeployment(
            form.vercelToken,
            `form-${form.slug}`,
            html
        );

        // Return success with deployment info
        return {
            success: true,
            url: `https://${deployment.url}`,
            deploymentId: deployment.id,
            projectId: deployment.projectId,
        };
    } catch (error) {
        console.error('Deploy error:', error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : 'Erro desconhecido ao fazer deploy',
        };
    }
}

/**
 * Check deployment status
 * @param token - Vercel token
 * @param deploymentId - Deployment ID to check
 * @returns Deployment status
 */
export async function checkDeploymentStatus(
    token: string,
    deploymentId: string
) {
    try {
        return await VercelService.getDeploymentStatus(token, deploymentId);
    } catch (error) {
        console.error('Status check error:', error);
        throw error;
    }
}
