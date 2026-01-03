import AmadeusClient from './AmadeusClient';

/**
 * Service for searching hotels and retrieving offers using Amadeus Hotel APIs
 */
export class HotelService {
  /**
   * Search hotels in a city by IATA code
   * @param cityCode IATA city code (e.g., PAR, NYC, LON)
   * @param radius Search radius in KM (1-300, default: 5)
   * @param chainCodes Optional hotel chain codes filter (e.g., ['MC', 'RT'])
   * @param amenities Optional amenities filter (e.g., ['SWIMMING_POOL', 'SPA'])
   * @returns Array of hotel data with locations and metadata
   */
  async searchHotelsByCity(
    cityCode: string,
    radius: number = 5,
    chainCodes?: string[],
    amenities?: string[]
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      const params: any = {
        cityCode,
        radius,
        radiusUnit: 'KM',
      };

      if (chainCodes && chainCodes.length > 0) {
        params.chainCodes = chainCodes.join(',');
      }

      if (amenities && amenities.length > 0) {
        params.amenities = amenities.join(',');
      }

      console.log(`🏨 Searching hotels in city: ${cityCode} within ${radius}km`);

      const response = await amadeus.referenceData.locations.hotels.byCity.get(
        params
      );

      const hotels = response.data.map((hotel: any) => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        iataCode: hotel.iataCode,
        dupeId: hotel.dupeId,
        geoCode: {
          latitude: hotel.geoCode?.latitude
            ? parseFloat(hotel.geoCode.latitude)
            : null,
          longitude: hotel.geoCode?.longitude
            ? parseFloat(hotel.geoCode.longitude)
            : null,
        },
        address: {
          countryCode: hotel.address?.countryCode,
        },
        distance: {
          value: hotel.distance?.value ? parseFloat(hotel.distance.value) : null,
          unit: hotel.distance?.unit,
        },
      }));

      console.log(`✅ Found ${hotels.length} hotels in ${cityCode}`);
      return hotels;
    } catch (error) {
      console.error(`❌ Hotel search failed for city ${cityCode}:`, error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Get hotel details by hotel IDs
   * @param hotelIds Array of Amadeus 8-character hotel IDs
   */
  async getHotelsByIds(hotelIds: string[]) {
    try {
      const amadeus = AmadeusClient.getInstance();

      console.log(`🔍 Fetching details for ${hotelIds.length} hotels`);

      const response = await amadeus.referenceData.locations.hotels.byHotels.get({
        hotelIds: hotelIds.join(','),
      });

      return response.data.map((hotel: any) => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        chainCode: hotel.chainCode,
        iataCode: hotel.iataCode,
        geoCode: {
          latitude: parseFloat(hotel.geoCode?.latitude),
          longitude: parseFloat(hotel.geoCode?.longitude),
        },
        address: hotel.address,
      }));
    } catch (error) {
      console.error('❌ Failed to fetch hotel details:', error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Get hotel offers with real-time pricing
   * @param hotelIds Array of hotel IDs (up to 20)
   * @param checkInDate Check-in date (YYYY-MM-DD)
   * @param checkOutDate Check-out date (YYYY-MM-DD)
   * @param adults Number of adults (1-9, default: 1)
   * @param roomQuantity Number of rooms (default: 1)
   * @param currency Preferred currency code (default: USD)
   * @param priceRange Optional price range filter (min-max)
   */
  async getHotelOffers(
    hotelIds: string[],
    checkInDate: string,
    checkOutDate: string,
    adults: number = 1,
    roomQuantity: number = 1,
    currency: string = 'USD',
    priceRange?: string
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      if (hotelIds.length > 20) {
        throw {
          status: 400,
          code: 'TOO_MANY_HOTELS',
          message: 'Maximum 20 hotel IDs allowed per request',
        };
      }

      const params: any = {
        hotelIds: hotelIds.join(','),
        checkInDate,
        checkOutDate,
        adults,
        roomQuantity,
        currency,
        bestRateOnly: true, // Get best rate for faster response
      };

      if (priceRange) {
        params.priceRange = priceRange;
      }

      console.log(
        `💰 Getting hotel offers for ${hotelIds.length} hotels (${checkInDate} to ${checkOutDate})`
      );

      const response = await amadeus.shopping.hotelOffersSearch.get(params);

      const offers = response.data.map((hotelData: any) => ({
        hotel: {
          hotelId: hotelData.hotel?.hotelId,
          chainCode: hotelData.hotel?.chainCode,
          name: hotelData.hotel?.name,
          cityCode: hotelData.hotel?.cityCode,
        },
        available: hotelData.available,
        offers: hotelData.offers?.map((offer: any) => ({
          id: offer.id,
          checkInDate: offer.checkInDate,
          checkOutDate: offer.checkOutDate,
          roomType: offer.room?.type,
          roomDescription: offer.room?.typeEstimated?.category,
          beds: offer.room?.typeEstimated?.beds,
          bedType: offer.room?.typeEstimated?.bedType,
          price: {
            currency: offer.price?.currency,
            base: offer.price?.base ? parseFloat(offer.price.base) : null,
            total: offer.price?.total ? parseFloat(offer.price.total) : null,
            taxes: offer.price?.taxes || [],
            variations: offer.price?.variations,
          },
          policies: {
            paymentType: offer.policies?.paymentType,
            cancellation: offer.policies?.cancellation,
          },
          guests: {
            adults: offer.guests?.adults,
          },
        })) || [],
      }));

      console.log(
        `✅ Retrieved offers for ${offers.length} hotels with availability`
      );
      return offers;
    } catch (error) {
      console.error('❌ Failed to get hotel offers:', error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Get detailed pricing for a specific hotel offer
   * @param offerId Amadeus offer ID from hotel offers search
   */
  async getOfferDetails(offerId: string) {
    try {
      const amadeus = AmadeusClient.getInstance();

      console.log(`🔍 Fetching detailed pricing for offer: ${offerId}`);

      const response = await amadeus.shopping.hotelOffer(offerId).get();

      const offer = response.data;

      return {
        id: offer.id,
        hotel: {
          hotelId: offer.hotel?.hotelId,
          name: offer.hotel?.name,
          chainCode: offer.hotel?.chainCode,
          cityCode: offer.hotel?.cityCode,
        },
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        room: {
          type: offer.room?.type,
          description: offer.room?.description,
          typeEstimated: offer.room?.typeEstimated,
        },
        price: {
          currency: offer.price?.currency,
          base: parseFloat(offer.price?.base),
          total: parseFloat(offer.price?.total),
          taxes: offer.price?.taxes,
          variations: offer.price?.variations,
        },
        policies: offer.policies,
        guests: offer.guests,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch offer ${offerId}:`, error);
      return AmadeusClient.handleError(error);
    }
  }
}

export default new HotelService();
