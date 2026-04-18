import { NextResponse } from "next/server";
import { insforge } from "@/lib/insforge";

export async function POST() {
  try {
    // Define all vehicles from your landing page
    const vehicles = [
      // Airport Taxi Vehicles
      {
        name: "Hatchback",
        slug: "hatchback",
        base_fare: 799,
        per_km_rate: 0,
        image_url: "/imgi_4_mini.png",
        is_ev: false,
        is_active: true,
        sort_order: 1,
        capacity: "3+1",
        vehicle_category: "airport"
      },
      {
        name: "Swift Dzire",
        slug: "swift-dzire",
        base_fare: 899,
        per_km_rate: 0,
        image_url: "/imgi_5_swift.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 2,
        capacity: "4+1",
        vehicle_category: "airport"
      },
      {
        name: "Toyota Etios",
        slug: "toyota-etios",
        base_fare: 1049,
        per_km_rate: 0,
        image_url: "/imgi_6_etios.png",
        is_ev: false,
        is_active: true,
        sort_order: 3,
        capacity: "4+1",
        vehicle_category: "airport"
      },
      {
        name: "Swift Dzire CNG w/ Carrier",
        slug: "swift-dzire-cng",
        base_fare: 1100,
        per_km_rate: 0,
        image_url: "/imgi_5_swift.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 4,
        capacity: "4+1",
        vehicle_category: "airport"
      },
      {
        name: "New Swift Dzire",
        slug: "new-swift-dzire",
        base_fare: 1100,
        per_km_rate: 0,
        image_url: "/imgi_5_swift.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 5,
        capacity: "4+1",
        vehicle_category: "airport"
      },
      {
        name: "Ertiga SUV",
        slug: "ertiga-suv",
        base_fare: 1699,
        per_km_rate: 0,
        image_url: "/imgi_8_ertiga.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 6,
        capacity: "6+1",
        vehicle_category: "airport"
      },
      {
        name: "Toyota Innova",
        slug: "toyota-innova",
        base_fare: 1799,
        per_km_rate: 0,
        image_url: "/imgi_9_innova.png",
        is_ev: false,
        is_active: true,
        sort_order: 7,
        capacity: "7+1",
        vehicle_category: "airport"
      },
      {
        name: "Toyota Innova Crysta",
        slug: "toyota-innova-crysta",
        base_fare: 1999,
        per_km_rate: 0,
        image_url: "/imgi_10_crysta.png",
        is_ev: false,
        is_active: true,
        sort_order: 8,
        capacity: "7+1",
        vehicle_category: "airport"
      },
      {
        name: "Innova Hycross",
        slug: "innova-hycross",
        base_fare: 2499,
        per_km_rate: 0,
        image_url: "/imgi_11_hycross.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 9,
        capacity: "7+1",
        vehicle_category: "airport"
      },
      {
        name: "Tempo Traveller NON AC",
        slug: "tempo-traveller-non-ac",
        base_fare: 3599,
        per_km_rate: 0,
        image_url: "/imgi_12_tt.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 10,
        capacity: "12+1",
        vehicle_category: "airport"
      },
      {
        name: "Tempo Traveller AC",
        slug: "tempo-traveller-ac",
        base_fare: 3999,
        per_km_rate: 0,
        image_url: "/imgi_12_tt.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 11,
        capacity: "12+1",
        vehicle_category: "airport"
      },
      // Outstation Vehicles
      {
        name: "Sedan (Outstation)",
        slug: "sedan-outstation",
        base_fare: 0,
        per_km_rate: 12,
        image_url: "/imgi_7_Verito.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 12,
        capacity: "4+1",
        vehicle_category: "outstation"
      },
      {
        name: "New Swift Dzire / Etios (Outstation)",
        slug: "swift-dzire-etios-outstation",
        base_fare: 0,
        per_km_rate: 13,
        image_url: "/imgi_5_swift.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 13,
        capacity: "4+1",
        vehicle_category: "outstation"
      },
      {
        name: "Toyota Innova (Outstation)",
        slug: "toyota-innova-outstation",
        base_fare: 0,
        per_km_rate: 16,
        image_url: "/imgi_9_innova.png",
        is_ev: false,
        is_active: true,
        sort_order: 14,
        capacity: "7+1",
        vehicle_category: "outstation"
      },
      {
        name: "Ertiga SUV (Outstation)",
        slug: "ertiga-suv-outstation",
        base_fare: 0,
        per_km_rate: 16,
        image_url: "/imgi_8_ertiga.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 15,
        capacity: "6+1",
        vehicle_category: "outstation"
      },
      {
        name: "Toyota Innova Crysta (Outstation)",
        slug: "toyota-innova-crysta-outstation",
        base_fare: 0,
        per_km_rate: 18,
        image_url: "/imgi_10_crysta.png",
        is_ev: false,
        is_active: true,
        sort_order: 16,
        capacity: "7+1",
        vehicle_category: "outstation"
      },
      {
        name: "Tempo Traveller (Outstation)",
        slug: "tempo-traveller-outstation",
        base_fare: 0,
        per_km_rate: 19,
        image_url: "/imgi_12_tt.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 17,
        capacity: "12+1",
        vehicle_category: "outstation"
      },
      {
        name: "Innova Hycross (Outstation)",
        slug: "innova-hycross-outstation",
        base_fare: 0,
        per_km_rate: 22,
        image_url: "/imgi_11_hycross.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 18,
        capacity: "7+1",
        vehicle_category: "outstation"
      },
      // Local Hire Vehicles
      {
        name: "Sedan (4hrs 40km)",
        slug: "sedan-4hrs-40km",
        base_fare: 1300,
        per_km_rate: 15,
        image_url: "/imgi_7_Verito.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 19,
        capacity: "4+1",
        vehicle_category: "local"
      },
      {
        name: "Sedan (8hrs 80km)",
        slug: "sedan-8hrs-80km",
        base_fare: 2100,
        per_km_rate: 15,
        image_url: "/imgi_7_Verito.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 20,
        capacity: "4+1",
        vehicle_category: "local"
      },
      {
        name: "Ertiga SUV (Local)",
        slug: "ertiga-suv-local",
        base_fare: 2799,
        per_km_rate: 20,
        image_url: "/imgi_8_ertiga.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 21,
        capacity: "6+1",
        vehicle_category: "local"
      },
      {
        name: "Toyota Innova (Local)",
        slug: "toyota-innova-local",
        base_fare: 3200,
        per_km_rate: 20,
        image_url: "/imgi_9_innova.png",
        is_ev: false,
        is_active: true,
        sort_order: 22,
        capacity: "7+1",
        vehicle_category: "local"
      },
      {
        name: "Toyota Innova Crysta (Local)",
        slug: "toyota-innova-crysta-local",
        base_fare: 3499,
        per_km_rate: 20,
        image_url: "/imgi_10_crysta.png",
        is_ev: false,
        is_active: true,
        sort_order: 23,
        capacity: "7+1",
        vehicle_category: "local"
      },
      {
        name: "Tempo Traveller (Local)",
        slug: "tempo-traveller-local",
        base_fare: 4499,
        per_km_rate: 25,
        image_url: "/imgi_12_tt.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 24,
        capacity: "12+1",
        vehicle_category: "local"
      },
      {
        name: "Innova Hycross (Local)",
        slug: "innova-hycross-local",
        base_fare: 4499,
        per_km_rate: 30,
        image_url: "/imgi_11_hycross.jpg",
        is_ev: false,
        is_active: true,
        sort_order: 25,
        capacity: "7+1",
        vehicle_category: "local"
      },
    ];

    // First, check if vehicles already exist
    const { data: existingVehicles } = await insforge.database
      .from("vehicle_types")
      .select("slug");

    const existingSlugs = new Set(existingVehicles?.map(v => v.slug) || []);

    // Filter out vehicles that already exist
    const newVehicles = vehicles.filter(v => !existingSlugs.has(v.slug));

    if (newVehicles.length === 0) {
      return NextResponse.json({ 
        message: "All vehicles already exist in the database",
        total: vehicles.length,
        existing: existingSlugs.size
      });
    }

    // Insert new vehicles
    const { data, error } = await insforge.database
      .from("vehicle_types")
      .insert(newVehicles)
      .select();

    if (error) {
      console.error("Error seeding vehicles:", error);
      return NextResponse.json({ 
        error: "Failed to seed vehicles", 
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Vehicles seeded successfully",
      inserted: data?.length || 0,
      total: vehicles.length,
      vehicles: data
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ 
      error: "Internal server error",
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}
