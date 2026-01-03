import Amadeus, { ResponseError } from 'amadeus';

/**
 * Singleton Amadeus client for making API requests
 * Handles OAuth token management automatically via the SDK
 */
class AmadeusClient {
  private static instance: Amadeus | null = null;

  private constructor() {}

  public static getInstance(): Amadeus {
    if (!AmadeusClient.instance) {
      const clientId = process.env.AMADEUS_CLIENT_ID;
      const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
      const hostname = process.env.AMADEUS_HOSTNAME || 'test';

      if (!clientId || !clientSecret) {
        throw new Error(
          'Amadeus credentials not found. Please set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env'
        );
      }

      AmadeusClient.instance = new Amadeus({
        clientId,
        clientSecret,
        hostname: hostname as 'production' | 'test',
      });

      console.log(`✅ Amadeus client initialized (${hostname} environment)`);
    }

    return AmadeusClient.instance;
  }

  /**
   * Handle Amadeus API errors with consistent formatting
   */
  public static handleError(error: any): never {
    // Check if it's an Amadeus client error
    if (error && error.code && error.description) {
      const amadeusError = {
        status: error.response?.statusCode || 500,
        code: error.code,
        message: error.description?.[0]?.title || error.description || 'Amadeus API error',
        errors: error.description || [],
      };

      console.error('❌ Amadeus API Error:', amadeusError);
      throw amadeusError;
    }

    console.error('❌ Unexpected Error:', error);
    throw {
      status: 500,
      code: 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
    };
  }
}

export default AmadeusClient;
