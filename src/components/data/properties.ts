// src/components/data/properties.ts

export type Property = {
  id: string
  property_type: string
  title: string
  description: string
  address: string
  sub_district: string
  district: string
  city: string
  province: string
  postal_code: string
  latitude: number
  longitude: number
  land_area: number
  building_area: number
  bedrooms: number
  bathrooms: number
  floors: number
  garage: number
  year_built: number
  price: number
  price_per_sqm: number
  maintenance_fee: number
  certificate_type: string
  pbb_value: number
  company_name: string
  image_url: string
}

export const properties: Property[] = [
  {
    id: "1",
    property_type: "Rumah",
    title: "Ciputra Residence BSD Aster",
    description:
      "Hunian modern dengan desain minimalis di kawasan BSD City, cocok untuk keluarga muda. Dilengkapi dengan keamanan 24 jam dan taman hijau.",
    address: "Jl. BSD Raya Utama No. 5",
    sub_district: "Lengkong Kulon",
    district: "Serpong",
    city: "Tangerang Selatan",
    province: "Banten",
    postal_code: "15310",
    latitude: -6.3021,
    longitude: 106.6543,
    land_area: 72,
    building_area: 90,
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    garage: 1,
    year_built: 2024,
    price: 850_000_000,
    price_per_sqm: 9_444_000,
    maintenance_fee: 250_000,
    certificate_type: "SHM (Sertifikat Hak Milik)",
    pbb_value: 1_200_000,
    company_name: "PT Ciputra Development Tbk",
    image_url: "/rumah1.png",
  },
  {
    id: "2",
    property_type: "Rumah",
    title: "Summarecon Serpong Elora",
    description:
      "Cluster eksklusif di kawasan Gading Serpong dengan akses mudah ke fasilitas publik dan area komersial.",
    address: "Jl. Gading Serpong Boulevard No. 3",
    sub_district: "Kelapa Dua",
    district: "Kelapa Dua",
    city: "Tangerang",
    province: "Banten",
    postal_code: "15810",
    latitude: -6.2472,
    longitude: 106.6309,
    land_area: 84,
    building_area: 110,
    bedrooms: 4,
    bathrooms: 3,
    floors: 2,
    garage: 2,
    year_built: 2025,
    price: 1_200_000_000,
    price_per_sqm: 10_909_000,
    maintenance_fee: 300_000,
    certificate_type: "HGB (Hak Guna Bangunan)",
    pbb_value: 1_800_000,
    company_name: "Summarecon Agung Tbk",
    image_url: "/images/rumah2.jpg",
  },
  {
    id: "3",
    property_type: "Apartemen",
    title: "Permata Hijau Residence",
    description:
      "Apartemen mewah dengan fasilitas lengkap di jantung Jakarta Selatan, dekat dengan pusat bisnis dan hiburan.",
    address: "Jl. Permata Hijau No. 88",
    sub_district: "Grogol Utara",
    district: "Kebayoran Lama",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postal_code: "12210",
    latitude: -6.2267,
    longitude: 106.7793,
    land_area: 120,
    building_area: 150,
    bedrooms: 4,
    bathrooms: 3,
    floors: 1,
    garage: 1,
    year_built: 2023,
    price: 2_750_000_000,
    price_per_sqm: 18_333_000,
    maintenance_fee: 500_000,
    certificate_type: "Strata Title",
    pbb_value: 3_200_000,
    company_name: "Agung Podomoro Land",
    image_url: "/images/rumah3.jpg",
  },
  {
    id: "4",
    property_type: "Rumah",
    title: "Podomoro Golf View",
    description:
      "Hunian dengan pemandangan lapangan golf dan udara sejuk di kawasan Depok. Cocok untuk investasi jangka panjang.",
    address: "Jl. Raya Bogor KM 27",
    sub_district: "Cimanggis",
    district: "Cimanggis",
    city: "Depok",
    province: "Jawa Barat",
    postal_code: "16451",
    latitude: -6.3735,
    longitude: 106.8721,
    land_area: 60,
    building_area: 70,
    bedrooms: 2,
    bathrooms: 1,
    floors: 1,
    garage: 1,
    year_built: 2022,
    price: 650_000_000,
    price_per_sqm: 9_285_000,
    maintenance_fee: 150_000,
    certificate_type: "SHM (Sertifikat Hak Milik)",
    pbb_value: 950_000,
    company_name: "Agung Podomoro Group",
    image_url: "/images/rumah4.jpg",
  },
  {
    id: "5",
    property_type: "Rumah",
    title: "BSD Vanya Park Livia",
    description:
      "Rumah dua lantai dengan konsep hijau dan danau buatan, menghadirkan kenyamanan hidup alami di tengah BSD.",
    address: "Jl. BSD Raya Barat No. 9",
    sub_district: "Lengkong Kulon",
    district: "Pagedangan",
    city: "Tangerang",
    province: "Banten",
    postal_code: "15331",
    latitude: -6.3125,
    longitude: 106.6389,
    land_area: 78,
    building_area: 95,
    bedrooms: 3,
    bathrooms: 2,
    floors: 2,
    garage: 1,
    year_built: 2024,
    price: 1_050_000_000,
    price_per_sqm: 11_053_000,
    maintenance_fee: 280_000,
    certificate_type: "HGB (Hak Guna Bangunan)",
    pbb_value: 1_500_000,
    company_name: "Sinarmas Land",
    image_url: "/images/rumah5.jpg",
  },
]
