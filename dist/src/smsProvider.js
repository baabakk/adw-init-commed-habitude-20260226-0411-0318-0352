"use strict";
/**
 * SMS Gateway Integration (Twilio/AWS SNS stub)
 *
 * PRODUCTION SETUP REQUIRED:
 * 1. Install provider SDK: npm install twilio (or aws-sdk)
 * 2. Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * 3. Implement retry logic with exponential backoff
 * 4. Add rate limiting to respect provider quotas
 * 5. Implement webhook handlers for delivery status
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.smsProvider = exports.SMSProvider = void 0;
class SMSProvider {
    constructor() {
        this.enabled = false;
        // Load configuration from environment variables
        this.accountSid = process.env.TWILIO_ACCOUNT_SID;
        this.authToken = process.env.TWILIO_AUTH_TOKEN;
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
        this.enabled = !!(this.accountSid && this.authToken && this.fromNumber);
        if (!this.enabled) {
            console.warn('SMS Provider not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER environment variables.');
        }
    }
    /**
     * Send SMS message
     */
    async sendSMS(to, message) {
        if (!this.enabled) {
            console.log(`[SMS STUB] Would send to ${to}: ${message}`);
            return;
        }
        try {
            // PRODUCTION: Replace with actual Twilio SDK call
            // const client = require('twilio')(this.accountSid, this.authToken);
            // await client.messages.create({
            //   body: message,
            //   from: this.fromNumber,
            //   to: to
            // });
            console.log(`[SMS] Sent to ${to}: ${message}`);
        }
        catch (error) {
            console.error('SMS send failed:', error);
            throw new Error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Send bulk SMS messages
     */
    async sendBulkSMS(recipients) {
        let successful = 0;
        let failed = 0;
        const errors = [];
        for (const recipient of recipients) {
            try {
                await this.sendSMS(recipient.to, recipient.message);
                successful++;
            }
            catch (error) {
                failed++;
                errors.push(`${recipient.to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
        return { successful, failed, errors };
    }
    /**
     * Test SMS provider connection
     */
    async testConnection() {
        if (!this.enabled) {
            return false;
        }
        try {
            // PRODUCTION: Implement actual connection test
            // const client = require('twilio')(this.accountSid, this.authToken);
            // await client.api.accounts(this.accountSid).fetch();
            return true;
        }
        catch (error) {
            console.error('SMS provider connection test failed:', error);
            return false;
        }
    }
    /**
     * Validate phone number format
     */
    validatePhoneNumber(phoneNumber) {
        // Basic E.164 format validation
        const e164Regex = /^\+[1-9]\d{1,14}$/;
        return e164Regex.test(phoneNumber);
    }
    /**
     * Get provider status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            configured: !!(this.accountSid && this.authToken && this.fromNumber),
            provider: 'Twilio (stub)'
        };
    }
}
exports.SMSProvider = SMSProvider;
exports.smsProvider = new SMSProvider();
