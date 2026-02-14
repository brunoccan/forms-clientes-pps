export interface VercelDeploymentResponse {
    id: string;
    url: string;
    name: string;
    status: 'READY' | 'ERROR' | 'BUILDING' | 'QUEUED';
    createdAt: number;
    projectId?: string;
}

export interface VercelDeploymentRequest {
    name: string;
    files: Array<{
        file: string;
        data: string;
    }>;
    projectSettings?: {
        framework: null;
    };
}

export class VercelService {
    private static readonly API_BASE = 'https://api.vercel.com';

    /**
     * Create a new deployment on Vercel
     * @param token - Vercel API token
     * @param projectName - Name for the project (slug)
     * @param htmlContent - HTML content to deploy
     * @returns Deployment response with URL
     */
    static async createDeployment(
        token: string,
        projectName: string,
        htmlContent: string
    ): Promise<VercelDeploymentResponse> {
        if (!token) {
            throw new Error('Token da Vercel não configurado');
        }

        // Prepare deployment payload
        const payload: VercelDeploymentRequest = {
            name: projectName,
            files: [
                {
                    file: 'index.html',
                    data: htmlContent,
                },
            ],
            projectSettings: {
                framework: null,
            },
        };

        try {
            const response = await fetch(`${this.API_BASE}/v13/deployments`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(
                    error.error?.message || `Erro ao fazer deploy: ${response.status}`
                );
            }

            const data = await response.json();

            return {
                id: data.id,
                url: data.url,
                name: data.name,
                status: data.readyState || 'BUILDING',
                createdAt: data.createdAt,
                projectId: data.projectId,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro desconhecido ao fazer deploy na Vercel');
        }
    }

    /**
     * Check deployment status
     * @param token - Vercel API token
     * @param deploymentId - Deployment ID
     * @returns Deployment status
     */
    static async getDeploymentStatus(
        token: string,
        deploymentId: string
    ): Promise<VercelDeploymentResponse> {
        if (!token) {
            throw new Error('Token da Vercel não configurado');
        }

        try {
            const response = await fetch(
                `${this.API_BASE}/v13/deployments/${deploymentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Erro ao verificar status: ${response.status}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                url: data.url,
                name: data.name,
                status: data.readyState || 'BUILDING',
                createdAt: data.createdAt,
                projectId: data.projectId,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Erro ao verificar status do deployment');
        }
    }

    /**
     * Validate Vercel token
     * @param token - Vercel API token to validate
     * @returns true if token is valid
     */
    static async validateToken(token: string): Promise<boolean> {
        if (!token) return false;

        try {
            const response = await fetch(`${this.API_BASE}/v2/user`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.ok;
        } catch {
            return false;
        }
    }
}
