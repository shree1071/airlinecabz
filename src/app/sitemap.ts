import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.airlinecabz.com'
  
  // Main pages
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.4,
    },
  ]
  
  // Airport service areas for SEO
  const airportAreas = [
    'mg-road', 'koramangala', 'whitefield', 'marathahalli', 
    'indira-nagar', 'silk-board', 'jp-nagar', 'hal',
    'yeshwanthpur', 'rajaji-nagar', 'banashankari'
  ]
  
  // Outstation destinations for SEO
  const outstationDestinations = [
    'ooty', 'mysore', 'coorg', 'chikmagalur', 'goa',
    'tirupati', 'wayanad', 'chennai', 'kodaikanal'
  ]
  
  // Add airport area pages (for future implementation)
  const airportAreaRoutes = airportAreas.map(area => ({
    url: `${baseUrl}/airport-taxi-${area}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  // Add outstation destination pages (for future implementation)
  const outstationRoutes = outstationDestinations.map(dest => ({
    url: `${baseUrl}/bangalore-to-${dest}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [...routes]
}
