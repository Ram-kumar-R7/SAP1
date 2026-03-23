namespace external.db;
 
using { API_BUSINESS_PARTNER as s4 } from '../srv/external/API_BUSINESS_PARTNER';
 
 
entity PartnerDetails {
  key ID : String;
  Email : String(100);
  partner:Association to s4.A_BusinessPartner on partner.BusinessPartner = ID
}


