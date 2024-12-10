import OpenAI from 'openai';
import { logger } from '../utils/logger';

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async analyzeCall(transcript: string) {
        try {
            const completion = await this.openai.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert sales call analyzer. Analyze the following call transcript and determine if this is a prospect call.'
                    },
                    {
                        role: 'user',
                        content: transcript
                    }
                ],
                model: 'gpt-4-1106-preview',
            });

            return {
                isProspectCall: this.determineIfProspectCall(completion.choices[0].message.content),
                analysis: completion.choices[0].message.content
            };
        } catch (error) {
            logger.error('Error analyzing call with OpenAI', { error });
            throw error;
        }
    }

    private determineIfProspectCall(analysis: string): boolean {
        // Implement logic to determine if this is a prospect call
        // This is a simple implementation that should be enhanced based on your needs
        return analysis.toLowerCase().includes('prospect') || 
               analysis.toLowerCase().includes('potential customer');
    }

    async generateProspectCoachingInsights(analysis: any) {
        // Implement prospect coaching logic
        return analysis;
    }
}