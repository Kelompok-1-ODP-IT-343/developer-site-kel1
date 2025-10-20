export type DeveloperDetail = {
  id: string
  company_name: string
  contact_person: string
  phone: string
  email: string
  website: string
  address: string
  city: string
  province: string
  postal_code: string
  established_year: string
  description: string
  partnership_level: string
  logo: string
}

export const developers: DeveloperDetail[] = [
  {
    id: "1",
    company_name: "PT Ciputra Development Tbk",
    contact_person: "Ciputra",
    phone: "081234567890",
    email: "ciputra@example.com",
    website: "https://www.ciputradevelopment.com",
    address: "Jl. Prof. Dr. Satrio No.6, Kuningan",
    city: "Jakarta Selatan",
    province: "DKI Jakarta",
    postal_code: "12940",
    established_year: "1981",
    description: "Salah satu pengembang properti terbesar di Indonesia dengan berbagai proyek residensial dan komersial.",
    partnership_level: "Platinum",
    logo: "/images/developers/ciputra.png",
  },
  {
    id: "2",
    company_name: "Sinar Mas Land",
    contact_person: "Michael Widjaja",
    phone: "082233445566",
    email: "sinarmas@example.com",
    website: "https://www.sinarmasland.com",
    address: "BSD City",
    city: "Tangerang Selatan",
    province: "Banten",
    postal_code: "15310",
    established_year: "1988",
    description: "Pengembang utama BSD City dan berbagai proyek premium lainnya.",
    partnership_level: "Gold",
    logo: "/images/developers/sinarmas.png",
  },
  {
    id: "3",
    company_name: "PT Intiland Development Tbk",
    contact_person: "Hendro Gondokusumo",
    phone: "083312345678",
    email: "intiland@example.com",
    website: "https://www.intiland.com",
    address: "Jl. Jend. Sudirman No.32",
    city: "Jakarta Pusat",
    province: "DKI Jakarta",
    postal_code: "10220",
    established_year: "1975",
    description: "Pengembang properti terkemuka dengan proyek ikonik di Jakarta dan Surabaya.",
    partnership_level: "Silver",
    logo: "/images/developers/intiland.png",
  },
]
