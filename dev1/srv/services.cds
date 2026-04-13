using {sap.capire.incidents as my} from '../db/schema';

service ProcessorService {
    entity Incidents as projection on my.Incidents;

    @readonly
    entity Customers as projection on my.Customers;
}

annotate ProcessorService.Incidents with @odata.draft.enabled; 
annotate ProcessorService with @(requires: 'support'); 

service AdminService {
    entity Customers as projection on my.Customers;
    entity Incidents as projection on my.Incidents;
    entity Status as projection on my.Status;
}

annotate AdminService with @(requires: 'admin');


