using {LibraryManagementSystem as db} from '../db/demo';

@path: '/shop'
@impl: 'srv/bookshop.js'
service MyService {
    @odata.draft.enabled
    entity Book   as projection on db.Book actions{
        action SetActive();
       
    };
    

    entity Borrow as projection on db.Borrow;
    entity Member as projection on db.Member;
    
 action ResetAllBooksStatus() returns String;
}
