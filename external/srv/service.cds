using  ExchangeRate_APIs as API  from './external/ExchangeRate_APIs';

service MyService {
    entity externalApi as projection on API.ExchangeRateMdiReplicationReports;
    annotate externalApi with @cds.persistence.table;
    
    
}



