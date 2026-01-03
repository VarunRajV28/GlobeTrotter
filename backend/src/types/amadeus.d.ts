declare module 'amadeus' {
  export class ResponseError extends Error {
    code: string;
    description: any;
    response: {
      statusCode: number;
      body: any;
    };
  }

  export interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
    hostname?: 'production' | 'test';
  }

  export default class Amadeus {
    constructor(config: AmadeusConfig);
    
    referenceData: {
      locations: {
        cities: {
          get(params: any): Promise<any>;
        };
        hotels: {
          byCity: {
            get(params: any): Promise<any>;
          };
          byHotels: {
            get(params: any): Promise<any>;
          };
        };
      };
    };

    shopping: {
      activities: {
        get(params: any): Promise<any>;
        bySquare: {
          get(params: any): Promise<any>;
        };
      };
      activity(id: string): {
        get(): Promise<any>;
      };
      hotelOffersSearch: {
        get(params: any): Promise<any>;
      };
      hotelOffer(id: string): {
        get(): Promise<any>;
      };
      flightOffers: {
        pricing: {
          post(body: string, params?: any): Promise<any>;
        };
      };
    };
  }
}
