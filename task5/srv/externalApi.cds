using {ExchangeRate_APIs as S4} from './external/ExchangeRate_APIs';

service MyService {
         @cds.persistence.table
    entity Foo as projection on S4.ExchangeRates{
        key ExchangeRateOID,
        ExchangeRateDisplayID,

    }
}
