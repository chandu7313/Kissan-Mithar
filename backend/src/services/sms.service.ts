import axios from 'axios';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export interface SmsResult {
  success: boolean;
  message: string;
  requestId?: string;
}

/**
 * SMS Service abstraction — currently implements Fast2SMS.
 * Easily swappable to MSG91, Twilio, etc.
 */
export class SmsService {
  private static readonly FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2';

  /**
   * Sends an OTP SMS via configured provider
   */
  static async sendOtp(phoneNumber: string, otp: string): Promise<SmsResult> {
    const number10Digit = phoneNumber.replace(/\D/g, '').slice(-10);

    if (!number10Digit || number10Digit.length !== 10) {
      return { success: false, message: 'Invalid phone number' };
    }

    const provider = env.SMS_PROVIDER || 'FAST2SMS';

    switch (provider) {
      case 'FAST2SMS':
        return this.sendViaFast2SMS(number10Digit, otp);
      default:
        logger.warn({ provider }, 'Unknown SMS provider, falling back to console-only');
        return { success: true, message: 'OTP logged (no SMS provider configured)' };
    }
  }

  /**
   * Fast2SMS OTP route implementation
   */
  private static async sendViaFast2SMS(phone: string, otp: string): Promise<SmsResult> {
    const apiKey = env.SMS_API_KEY;
    if (!apiKey) {
      logger.error('SMS_API_KEY not configured — cannot send OTP');
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      const response = await axios.post(
        this.FAST2SMS_URL,
        {
          route: 'otp',
          variables_values: otp,
          numbers: phone,
          flash: 0,
        },
        {
          headers: {
            authorization: apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data?.return === true || response.data?.status_code === 200) {
        logger.info({ phone: `***${phone.slice(-4)}` }, 'OTP SMS sent successfully');
        return {
          success: true,
          message: 'OTP sent successfully',
          requestId: response.data?.request_id,
        };
      } else {
        logger.error({ response: response.data, phone: `***${phone.slice(-4)}` }, 'Fast2SMS returned failure');
        return { success: false, message: response.data?.message || 'SMS delivery failed' };
      }
    } catch (error: any) {
      logger.error({ err: error.message, phone: `***${phone.slice(-4)}` }, 'Fast2SMS API call failed');
      return { success: false, message: `SMS API error: ${error.message}` };
    }
  }
}
