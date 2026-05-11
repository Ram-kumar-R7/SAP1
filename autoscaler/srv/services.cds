using {Office as db } from '../db/demo';

service MyService {

    entity employee as projection on db.employee;

}





