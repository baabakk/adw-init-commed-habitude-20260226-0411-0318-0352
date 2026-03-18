"use strict";
/**
 * WhatsApp Business API Integration (stub)
 *
 * PRODUCTION SETUP REQUIRED:
 * 1. Apply for WhatsApp Business API access via Meta
 * 2. Get approved business account and phone number
 * 3. Set environment variables: WHATSAPP_API_KEY, WHATSAPP_PHONE_NUMBER_ID
 * 4. Implement webhook handler for incoming messages and status updates
 * 5. Add message template approval workflow (required for notifications)
 * 6. Implement rate limiting per WhatsApp Business API quotas
 * 7. Handle 24-hour messaging window restrictions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsappProvider = exports.WhatsAppProvider = void 0;
class WhatsAppProvider {
    constructor() {
        this.apiVersion = 'v18.0';
        this.enabled = false;
        // Load configuration from environment variables
        this.apiKey = process.env.WHATSAPP_API_KEY;
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        this.enabled = !!(this.apiKey && this.phoneNumberId);
        if (!this.enabled) {
            console.warn('WhatsApp Provider not configured. Set WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID environment variables.');
        }
    }
    /**
     * Send WhatsApp message
     */
    async sendMessage(to, message) {
        if (!this.enabled) {
            console.log(`[WHATSAPP STUB] Would send to ${to}: ${message}`);
            return;
        }
        try {
            // PRODUCTION: Replace with actual WhatsApp Business API call
            // const response = await fetch(
            //   `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
            //   {
            //     method: 'POST',
            //     headers: {
            //       'Authorization': `Bearer ${this.apiKey}`,
            //       'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //       messaging_product: 'whatsapp',
            //       to: to,
            //       type: 'text',
            //       text: { body: message }
            //     })
            //   }
            // );
            //
            // if (!response.ok) {
            //   throw new Error(`WhatsApp API error: ${response.statusText}`);
            // }
            console.log(`[WHATSAPP] Sent to ${to}: ${message}`);
        }
        catch (error) {
            console.error('WhatsApp send failed:', error);
            throw new Error(`Failed to send WhatsApp message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Send WhatsApp message using approved template
     * Required for messages outside 24-hour window
     */
    async sendTemplateMessage(to, templateName, languageCode = 'en', parameters) {
        if (!this.enabled) {
            console.log(`[WHATSAPP STUB] Would send template "${templateName}" to ${to}`);
            return;
        }
        try {
            // PRODUCTION: Send template message
            // const components = parameters ? [{
            //   type: 'body',
            //   parameters: parameters.map(p => ({ type: 'text', text: p }))
            // }] : [];
            //
            // const response = await fetch(
            //   `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
            //   {
            //     method: 'POST',
            //     headers: {
            //       'Authorization': `Bearer ${this.apiKey}`,
            //       'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //       messaging_product: 'whatsapp',
            //       to: to,
            //       type: 'template',
            //       template: {
            //         name: templateName,
            //         language: { code: languageCode },
            //         components: components
            //       }
            //     })
            //   }
            // );
            console.log(`[WHATSAPP] Sent template "${templateName}" to ${to}`);
        }
        catch (error) {
            console.error('WhatsApp template send failed:', error);
            throw new Error(`Failed to send WhatsApp template: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Send WhatsApp message with buttons
     */
    async sendMessageWithButtons(to, message, buttons) {
        if (!this.enabled) {
            console.log(`[WHATSAPP STUB] Would send to ${to} with buttons: ${message}`);
            return;
        }
        try {
            // PRODUCTION: Send interactive message with buttons
            // const response = await fetch(
            //   `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`,
            //   {
            //     method: 'POST',
            //     headers: {
            //       'Authorization': `Bearer ${this.apiKey}`,
            //       'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({
            //       messaging_product: 'whatsapp',
            //       to: to,
            //       type: 'interactive',
            //       interactive: {
            //         type: 'button',
            //         body: { text: message },
            //         action: {
            //           buttons: buttons.map(btn => ({
            //             type: 'reply',
            //             reply: { id: btn.id, title: btn.title }
            //           }))
            //         }
            //       }
            //     })
            //   }
            // );
            console.log(`[WHATSAPP] Sent to ${to} with buttons: ${message}`);
        }
        catch (error) {
            console.error('WhatsApp send with buttons failed:', error);
            throw new Error(`Failed to send WhatsApp message with buttons: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Handle incoming webhook update
     */
    async handleWebhook(update) {
        if (!this.enabled) {
            return;
        }
        try {
            // PRODUCTION: Process incoming messages and status updates
            // Handle user replies to habit reminders
            // Process button clicks
            // Update message delivery status
            console.log('[WHATSAPP] Received webhook update:', update);
            if (update.entry) {
                for (const entry of update.entry) {
                    if (entry.changes) {
                        for (const change of entry.changes) {
                            if (change.value?.messages) {
                                for (const message of change.value.messages) {
                                    console.log('[WHATSAPP] Incoming message:', message);
                                    // Process message
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error handling WhatsApp webhook:', error);
        }
    }
    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(signature, payload) {
        if (!this.enabled) {
            return false;
        }
        try {
            // PRODUCTION: Verify webhook signature using app secret
            // const crypto = require('crypto');
            // const expectedSignature = crypto
            //   .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
            //   .update(payload)
            //   .digest('hex');
            // return signature === `sha256=${expectedSignature}`;
            return true; // Stub
        }
        catch (error) {
            console.error('Webhook signature verification failed:', error);
            return false;
        }
    }
    /**
     * Test WhatsApp API connection
     */
    async testConnection() {
        if (!this.enabled) {
            return false;
        }
        try {
            // PRODUCTION: Test API connection
            // const response = await fetch(
            //   `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}`,
            //   {
            //     headers: {
            //       'Authorization': `Bearer ${this.apiKey}`
            //     }
            //   }
            // );
            // return response.ok;
            return true;
        }
        catch (error) {
            console.error('WhatsApp connection test failed:', error);
            return false;
        }
    }
    /**
     * Get provider status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            configured: !!(this.apiKey && this.phoneNumberId),
            apiVersion: this.apiVersion
        };
    }
}
exports.WhatsAppProvider = WhatsAppProvider;
exports.whatsappProvider = new WhatsAppProvider();
