using {API_BUSINESS_PARTNER as s4 } from './external/API_BUSINESS_PARTNER';
using { external.db as API } from '../db/external';

service MyService {
   entity PartnerDetails as projection on API.PartnerDetails;
   
       @cds.persistence.table
    entity A_BusinessPartner as projection on s4.A_BusinessPartner{
     key BusinessPartner,
     BusinessPartnerFullName,
     BusinessPartnerName,
   
    };
    
}




























