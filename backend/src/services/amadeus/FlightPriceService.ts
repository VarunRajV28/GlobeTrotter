import AmadeusClient from './AmadeusClient';

/**
 * Service for confirming flight prices using Amadeus Flight Offers Price API
 */
export class FlightPriceService {
  /**
   * Confirm and get detailed pricing for flight offers
   * This API validates flight offers obtained from Flight Offers Search
   * and provides confirmed pricing with fare details before booking
   * 
   * @param flightOffers Array of flight offer objects from Flight Offers Search
   * @param include Optional additional info: 'credit-card-fees', 'bags', 'other-services', 'detailed-fare-rules'
   * @returns Confirmed flight offers with validated pricing
   */
  async confirmFlightPrice(
    flightOffers: any[],
    include?: string[]
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      const body: any = {
        data: {
          type: 'flight-offers-pricing',
          flightOffers,
        },
      };

      const params: any = {};
      if (include && include.length > 0) {
        params.include = include.join(',');
      }

      console.log(
        `💰 Confirming pricing for ${flightOffers.length} flight offer(s)`
      );

      const response = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify(body),
        params
      );

      const pricedOffers = response.data.flightOffers?.map((offer: any) => ({
        id: offer.id,
        type: offer.type,
        source: offer.source,
        instantTicketingRequired: offer.instantTicketingRequired,
        nonHomogeneous: offer.nonHomogeneous,
        oneWay: offer.oneWay,
        lastTicketingDate: offer.lastTicketingDate,
        lastTicketingDateTime: offer.lastTicketingDateTime,
        numberOfBookableSeats: offer.numberOfBookableSeats,
        itineraries: offer.itineraries?.map((itinerary: any) => ({
          duration: itinerary.duration,
          segments: itinerary.segments?.map((segment: any) => ({
            departure: {
              iataCode: segment.departure?.iataCode,
              terminal: segment.departure?.terminal,
              at: segment.departure?.at,
            },
            arrival: {
              iataCode: segment.arrival?.iataCode,
              terminal: segment.arrival?.terminal,
              at: segment.arrival?.at,
            },
            carrierCode: segment.carrierCode,
            flightNumber: segment.number,
            aircraft: segment.aircraft,
            operating: segment.operating,
            duration: segment.duration,
            id: segment.id,
            numberOfStops: segment.numberOfStops,
            blacklistedInEU: segment.blacklistedInEU,
          })),
        })),
        price: {
          currency: offer.price?.currency,
          total: offer.price?.total ? parseFloat(offer.price.total) : null,
          base: offer.price?.base ? parseFloat(offer.price.base) : null,
          fees: offer.price?.fees?.map((fee: any) => ({
            amount: parseFloat(fee.amount),
            type: fee.type,
          })),
          taxes: offer.price?.taxes?.map((tax: any) => ({
            amount: parseFloat(tax.amount),
            code: tax.code,
          })),
          grandTotal: offer.price?.grandTotal
            ? parseFloat(offer.price.grandTotal)
            : null,
        },
        pricingOptions: offer.pricingOptions,
        validatingAirlineCodes: offer.validatingAirlineCodes,
        travelerPricings: offer.travelerPricings?.map((tp: any) => ({
          travelerId: tp.travelerId,
          fareOption: tp.fareOption,
          travelerType: tp.travelerType,
          price: {
            currency: tp.price?.currency,
            total: parseFloat(tp.price?.total),
            base: parseFloat(tp.price?.base),
          },
          fareDetailsBySegment: tp.fareDetailsBySegment,
        })),
      }));

      console.log(
        `✅ Price confirmed for ${pricedOffers?.length || 0} flight offer(s)`
      );

      return {
        flightOffers: pricedOffers,
        bookingRequirements: response.data.bookingRequirements,
      };
    } catch (error) {
      console.error('❌ Flight price confirmation failed:', error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Validate and confirm pricing for a single flight offer
   * @param flightOffer Single flight offer object
   */
  async confirmSingleFlightPrice(flightOffer: any) {
    return this.confirmFlightPrice([flightOffer]);
  }

  /**
   * Get detailed fare rules for flight offers
   * @param flightOffers Array of flight offers
   */
  async getFlightPriceWithFareRules(flightOffers: any[]) {
    return this.confirmFlightPrice(flightOffers, ['detailed-fare-rules']);
  }

  /**
   * Get flight pricing with all additional services info
   * @param flightOffers Array of flight offers
   */
  async getCompleteFlightPricing(flightOffers: any[]) {
    return this.confirmFlightPrice(flightOffers, [
      'credit-card-fees',
      'bags',
      'other-services',
      'detailed-fare-rules',
    ]);
  }
}

export default new FlightPriceService();
