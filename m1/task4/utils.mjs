import casual from "casual";

export function getRandomRow(index) {
  return [
    index,
    casual.first_name,
    casual.last_name,
    casual.company_name,
    casual.address1,
    casual.city,
    casual.country_code,
    casual.zip(),
    casual.phone,
    casual.email,
    casual.url,
  ];
}
