import express from 'express';
import dotenv from 'dotenv';
import { handleOpenPhoneWebhook } from './api/webhooks/openphone';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Webhook endpoint
app.post('/webhook/openphone', handleOpenPhoneWebhook);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});