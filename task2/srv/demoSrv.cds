using {my.demoproject as db} from '../db/demo';
using{my.sample as dep} from '../db/email';

service A_AddressEmailAddress {
    entity EmailAddress as projection on db.EmailAddress;
    entity Email as projection on dep.Email
}



