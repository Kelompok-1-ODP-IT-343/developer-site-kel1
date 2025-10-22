export type Customer = {
  id: string

  // --- Data Profil ---
  name: string
  username: string
  email: string
  phone: string
  nik: string
  npwp: string
  birth_date: string
  birth_place: string
  gender: string
  marital_status: string
  address: string
  sub_district: string
  district: string
  city: string
  province: string
  postal_code: string
  ktp: string
  slip: string
  credit_score: 1 | 2 | 3 | 4 | 5
  credit_status: "Lancar" | "Dalam Perhatian Khusus" | "Kurang Lancar" | "Diragukan" | "Macet"
  status: "approve" | "reject"
  property_id: string
  application_id: string
  approval_date: string // format "YYYY-MM-DD"

  // --- Data Pekerjaan ---
  occupation: string
  company_postal_code: string
  company_name: string
  company_address: string
  company_district: string
  company_subdistrict: string
  company_city: string
  company_province: string
  monthly_income: string
  
}

export const customers: Customer[] = [
  {
    id: "1",
    name: "Dheaz Kelvin",
    username: "dheazkelvin",
    email: "dheaz@example.com",
    phone: "081234567890",
    nik: "3273010208000001",
    npwp: "12.345.678.9-012.000",
    birth_date: "1999-05-21",
    birth_place: "Jakarta",
    gender: "Male",
    marital_status: "Single",
    address: "Jl. Sudirman No. 25",
    sub_district: "Kebayoran Baru",
    district: "Jakarta Selatan",
    city: "Jakarta",
    province: "DKI Jakarta",
    postal_code: "12190",
    ktp: "/ktp_dummy.jpeg",
    slip: "/slip_dummy.png",
    credit_score: 1,
    credit_status: "Lancar",
    status: "approve",
    property_id: "3",    
    application_id: "APP-001",
    approval_date: "2025-04-16",

    occupation: "Software Engineer",
    company_postal_code: "10210",
    company_name: "PT Bank Negara Indonesia (Persero) Tbk",
    company_address: "Jl. Jenderal Sudirman No. 1",
    company_district: "Tanah Abang",
    company_subdistrict: "Bendungan Hilir",
    company_city: "Jakarta Pusat",
    company_province: "DKI Jakarta",
    monthly_income: "15.000.000",
  },
  {
    id: "2",
    name: "Cecilion Depok",
    username: "cecilion",
    email: "cecilion@example.com",
    phone: "082233445566",
    nik: "3275011104990002",
    npwp: "98.765.432.1-987.000",
    birth_date: "1998-04-11",
    birth_place: "Depok",
    gender: "Female",
    marital_status: "Married",
    address: "Jl. Margonda Raya No. 5",
    sub_district: "Beji",
    district: "Depok",
    city: "Depok",
    province: "Jawa Barat",
    postal_code: "16424",
    ktp: "/ktp_dummy.jpeg",
    slip: "/slip_dummy.png",
    credit_score: 5,
    credit_status: "Macet",
    status: "reject",
    property_id: "1",
    application_id: "APP-002",
    approval_date: "2024-03-26",

    occupation: "UI/UX Designer",
    company_postal_code: "16426",
    company_name: "PT Ruang Desain Digital",
    company_address: "Jl. Kemang No. 21",
    company_district: "Beji",
    company_subdistrict: "Pondok Cina",
    company_city: "Depok",
    company_province: "Jawa Barat",
    monthly_income: "12.000.000",
  },
  {
    id: "3",
    name: "Bintang Adi",
    username: "bintangadi",
    email: "bintang@example.com",
    phone: "081355667788",
    nik: "3271020503990003",
    npwp: "13.579.624.9-543.000",
    birth_date: "1997-03-05",
    birth_place: "Bandung",
    gender: "Male",
    marital_status: "Married",
    address: "Jl. Setiabudi No. 8",
    sub_district: "Cidadap",
    district: "Bandung",
    city: "Bandung",
    province: "Jawa Barat",
    postal_code: "40141",
    ktp: "/ktp_dummy.jpeg",
    slip: "/slip_dummy.png",
    credit_score: 3,
    credit_status: "Kurang Lancar",
    status: "approve",
    property_id: "2",
    application_id: "APP-003",
    approval_date: "2025-08-19",

    occupation: "Data Analyst",
    company_postal_code: "40135",
    company_name: "PT Analitika Nusantara",
    company_address: "Jl. Asia Afrika No. 2",
    company_district: "Sumur Bandung",
    company_subdistrict: "Braga",
    company_city: "Bandung",
    company_province: "Jawa Barat",
    monthly_income: "13.500.000",
  },
  {
    id: "4",
    name: "Sarah Wijaya",
    username: "sarahwijaya",
    email: "sarah@example.com",
    phone: "085266778899",
    nik: "3578021002980004",
    npwp: "23.654.987.3-120.000",
    birth_date: "1998-02-10",
    birth_place: "Surabaya",
    gender: "Female",
    marital_status: "Single",
    address: "Jl. Manyar Kertoarjo No. 10",
    sub_district: "Gubeng",
    district: "Surabaya",
    city: "Surabaya",
    province: "Jawa Timur",
    postal_code: "60282",
    ktp: "/ktp_dummy.jpeg",
    slip: "/slip_dummy.png",
    credit_score: 1,
    credit_status: "Lancar",
    status: "reject",
    property_id: "2",
    application_id: "APP-004",
    approval_date: "2023-01-29",

    occupation: "Marketing Specialist",
    company_postal_code: "60234",
    company_name: "PT Surya Digital Media",
    company_address: "Jl. Raya Darmo No. 30",
    company_district: "Wonokromo",
    company_subdistrict: "Darmo",
    company_city: "Surabaya",
    company_province: "Jawa Timur",
    monthly_income: "11.000.000",
  },
  {
    id: "5",
    name: "Andika Pratama",
    username: "andikapratama",
    email: "andika@example.com",
    phone: "081345556677",
    nik: "3576032006990005",
    npwp: "32.754.682.4-321.000",
    birth_date: "1996-06-20",
    birth_place: "Malang",
    gender: "Male",
    marital_status: "Married",
    address: "Jl. Ijen No. 14",
    sub_district: "Klojen",
    district: "Malang",
    city: "Malang",
    province: "Jawa Timur",
    postal_code: "65119",
    ktp: "/ktp_dummy.jpeg",
    slip: "/slip_dummy.png",
    credit_score: 1,
    credit_status: "Lancar",
    status: "approve",
    property_id: "3",
    application_id: "APP-005",
    approval_date: "2025-11-29",

    occupation: "Civil Engineer",
    company_postal_code: "65111",
    company_name: "PT Konstruksi Mega Jaya",
    company_address: "Jl. Letjen Sutoyo No. 5",
    company_district: "Lowokwaru",
    company_subdistrict: "Dinoyo",
    company_city: "Malang",
    company_province: "Jawa Timur",
    monthly_income: "14.000.000",
  },]