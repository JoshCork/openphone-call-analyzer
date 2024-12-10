import { logger } from '../utils/logger';

interface CallRecording {
    id: string;
    url: string;
    duration: number;
    createdAt: string;
}

interface CallTranscript {
    id: string;
    text: string;
    createdAt: string;
}

export class OpenPhoneService {
    private apiKey: string;
    private baseUrl: string = 'https://api.openphone.com/v1';

    constructor() {
        this.apiKey = process.env.OPENPHONE_API_KEY || '';
    }

    private async makeRequest(path: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`OpenPhone API error: ${response.statusText}`);
        }

        return response.json();
    }

    async getRecordingUrl(callId: string): Promise<string> {
        try {
            const response = await this.makeRequest(`/call-recordings/${callId}`);
            
            if (!response.data || response.data.length === 0) {
                throw new Error('No recordings found for this call');
            }

            // Get the most recent recording
            const recording = response.data[0] as CallRecording;
            return recording.url;
        } catch (error) {
            logger.error('Error getting recording URL', { error, callId });
            throw error;
        }
    }

    async getTranscript(callId: string): Promise<string> {
        try {
            const response = await this.makeRequest(`/calls/${callId}/transcript`);
            
            if (!response.data || typeof response.data.text !== 'string') {
                throw new Error('No transcript available for this call');
            }

            return response.data.text;
        } catch (error) {
            logger.error('Error getting transcript', { error, callId });
            throw error;
        }
    }

    async createWebhook(url: string): Promise<void> {
        try {
            await this.makeRequest('/webhooks', {
                method: 'POST',
                body: JSON.stringify({
                    url,
                    events: [
                        'call.recording.completed',
                        'call.transcript.completed'
                    ]
                })
            });
        } catch (error) {
            logger.error('Error creating webhook', { error });
            throw error;
        }
    }
}