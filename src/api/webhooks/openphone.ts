import { Request, Response } from 'express';
import { OpenAIService } from '../../services/openai';
import { OpenPhoneService } from '../../services/openphone';
import { logger } from '../../utils/logger';

export async function handleOpenPhoneWebhook(req: Request, res: Response) {
    try {
        // 1. Validate webhook type
        if (!['call.recording.completed', 'call.transcript.completed'].includes(req.body.type)) {
            return res.status(400).json({ error: 'Invalid webhook type' });
        }

        const callId = req.body.data.callId;
        const openPhoneService = new OpenPhoneService();
        const openAIService = new OpenAIService();

        // 2. Get transcript
        let transcript: string;
        try {
            transcript = await openPhoneService.getTranscript(callId);
        } catch (error) {
            logger.error('Error getting transcript', { error, callId });
            return res.status(500).json({ error: 'Failed to get transcript' });
        }

        // 3. Analyze with OpenAI
        const analysis = await openAIService.analyzeCall(transcript);

        // 4. Check if it's a prospect call and process accordingly
        if (analysis.isProspectCall) {
            await openAIService.generateProspectCoachingInsights(analysis);
        }

        logger.info('Successfully processed call recording', { callId });
        res.status(200).json({ status: 'success' });
    } catch (error) {
        logger.error('Error processing webhook', { error });
        res.status(500).json({ error: 'Internal server error' });
    }
}