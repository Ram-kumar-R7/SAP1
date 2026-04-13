using { my.store as db } from '../db/product';

service MyService {
    // @odata.draft.enabled 
    entity product as projection on db.product actions{
        action applyInActive();
    };
  
    // entity producttext as projection on db.product.texts;
    function getAllRecords() returns array of product ;

    action addDiscount(ID : String, discount : Decimal)returns String;

}













