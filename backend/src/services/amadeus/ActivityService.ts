import AmadeusClient from './AmadeusClient';

/**
 * Service for discovering tours and activities using Amadeus Tours & Activities API
 */
export class ActivityService {
  /**
   * Search activities by geographic coordinates and radius
   * @param latitude Latitude of the search center
   * @param longitude Longitude of the search center
   * @param radius Search radius in KM (0-20, default: 1)
   * @returns Array of activity data with pricing and booking links
   */
  async searchActivitiesByLocation(
    latitude: number,
    longitude: number,
    radius: number = 5
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      console.log(
        `🎯 Searching activities at (${latitude}, ${longitude}) within ${radius}km`
      );

      const response = await amadeus.shopping.activities.get({
        latitude,
        longitude,
        radius,
      });

      const activities = response.data.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        name: activity.name,
        shortDescription: activity.shortDescription,
        description: activity.description,
        rating: activity.rating ? parseFloat(activity.rating) : null,
        price: {
          amount: activity.price?.amount ? parseFloat(activity.price.amount) : null,
          currency: activity.price?.currencyCode || null,
        },
        bookingLink: activity.bookingLink,
        minimumDuration: activity.minimumDuration,
        pictures: activity.pictures || [],
        geoCode: {
          latitude: activity.geoCode?.latitude
            ? parseFloat(activity.geoCode.latitude)
            : null,
          longitude: activity.geoCode?.longitude
            ? parseFloat(activity.geoCode.longitude)
            : null,
        },
      }));

      console.log(`✅ Found ${activities.length} activities`);
      return activities;
    } catch (error) {
      console.error('❌ Activity search failed:', error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Search activities within a bounding box
   * @param north Northern latitude boundary
   * @param west Western longitude boundary
   * @param south Southern latitude boundary
   * @param east Eastern longitude boundary
   */
  async searchActivitiesBySquare(
    north: number,
    west: number,
    south: number,
    east: number
  ) {
    try {
      const amadeus = AmadeusClient.getInstance();

      console.log(
        `📦 Searching activities in bounding box: N:${north}, W:${west}, S:${south}, E:${east}`
      );

      const response = await amadeus.shopping.activities.bySquare.get({
        north,
        west,
        south,
        east,
      });

      const activities = response.data.map((activity: any) => ({
        id: activity.id,
        type: activity.type,
        name: activity.name,
        shortDescription: activity.shortDescription,
        rating: activity.rating ? parseFloat(activity.rating) : null,
        price: {
          amount: activity.price?.amount ? parseFloat(activity.price.amount) : null,
          currency: activity.price?.currencyCode || null,
        },
        bookingLink: activity.bookingLink,
        pictures: activity.pictures || [],
        geoCode: {
          latitude: parseFloat(activity.geoCode?.latitude),
          longitude: parseFloat(activity.geoCode?.longitude),
        },
      }));

      console.log(`✅ Found ${activities.length} activities in bounding box`);
      return activities;
    } catch (error) {
      console.error('❌ Activity search by square failed:', error);
      return AmadeusClient.handleError(error);
    }
  }

  /**
   * Get specific activity details by ID
   * @param activityId Amadeus activity ID
   */
  async getActivityById(activityId: string) {
    try {
      const amadeus = AmadeusClient.getInstance();

      console.log(`🔍 Fetching activity details for ID: ${activityId}`);

      const response = await amadeus.shopping.activity(activityId).get();

      const activity = response.data;

      return {
        id: activity.id,
        type: activity.type,
        name: activity.name,
        shortDescription: activity.shortDescription,
        description: activity.description,
        rating: activity.rating ? parseFloat(activity.rating) : null,
        price: {
          amount: activity.price?.amount ? parseFloat(activity.price.amount) : null,
          currency: activity.price?.currencyCode || null,
        },
        bookingLink: activity.bookingLink,
        minimumDuration: activity.minimumDuration,
        pictures: activity.pictures || [],
        geoCode: {
          latitude: parseFloat(activity.geoCode?.latitude),
          longitude: parseFloat(activity.geoCode?.longitude),
        },
      };
    } catch (error) {
      console.error(`❌ Failed to fetch activity ${activityId}:`, error);
      return AmadeusClient.handleError(error);
    }
  }
}

export default new ActivityService();
