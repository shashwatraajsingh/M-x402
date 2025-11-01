import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/protected/weather
 * 
 * A demo protected API that requires x402 payment to access.
 * 
 * This looks like a free API! 🎉
 * All payment logic is handled in middleware.ts before the request reaches here.
 */
export async function GET(request: NextRequest) {
  // Just return your data - payment already verified by middleware!
  
  const weatherData = {
    location: "San Francisco, CA",
    temperature: 72,
    conditions: "Sunny",
    humidity: 65,
    windSpeed: 8,
    forecast: [
      { day: "Monday", high: 75, low: 58, conditions: "Partly Cloudy" },
      { day: "Tuesday", high: 73, low: 56, conditions: "Sunny" },
      { day: "Wednesday", high: 70, low: 55, conditions: "Cloudy" },
      { day: "Thursday", high: 68, low: 54, conditions: "Rainy" },
      { day: "Friday", high: 71, low: 56, conditions: "Sunny" },
    ],
  };

  return NextResponse.json(weatherData);
}

