import AmadeusClient from './AmadeusClient';

/**
 * Service for searching cities using Amadeus City Search API
 */
export class CitySearchService {
  /**
   * Search for cities by keyword
   * @param keyword Search term (min 2 chars, max 10 chars)
   * @param countryCode Optional ISO 3166 Alpha-2 country code filter
   * @param maxResults Maximum number of results (default: 10)
   * @returns Array of city data with IATA codes and geocodes
   */
  async searchCities(
    keyword: string,
    countryCode?: string,
    maxResults: number = 10
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      const params: any = {
        keyword,
        max: maxResults,
        include: ['AIRPORTS'],
      };

      if (countryCode) {
        params.countryCode = countryCode;
      }

      console.log(`🔍 Searching cities with keyword: "${keyword}"`);
      const response = await amadeus.referenceData.locations.cities.get(params);

      const cities = response.data.map((city: any) => ({
        type: city.type,
        subType: city.subType,
        name: city.name,
        iataCode: city.iataCode,
        countryCode: city.address?.countryCode,
        latitude: parseFloat(city.geoCode?.latitude),
        longitude: parseFloat(city.geoCode?.longitude),
        airports: city.included?.airports || [],
      }));

      console.log(`✅ Found ${cities.length} cities for "${keyword}"`);
      return cities;
    } catch (error) {
      console.error(`❌ City search failed for "${keyword}":`, error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Get city details by IATA code
   * @param iataCode City IATA code (e.g., PAR, NYC, LON)
   */
  async getCityByCode(iataCode: string) {
    try {
      const cities = await this.searchCities(iataCode);
      
      if (cities.length === 0) {
        throw {
          status: 404,
          code: 'CITY_NOT_FOUND',
          message: `City with code ${iataCode} not found`,
        };
      }

      return cities[0];
    } catch (error) {
      return AmadeusClient.handleError(error);
    }
  }
}

export default new CitySearchService();
