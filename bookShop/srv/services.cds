// using {bookShop as db} from '../db/book';

using {bookShop as db} from '../db/book';

service MyService {
  @odata.draft.enabled
  entity Book as
    projection on db.Book {
      *,
      virtual stockCriticality : Integer
    }
    actions {
      action Active();
    }

// service MyService {
//     @odata.draft.enabled
//     entity Book  as projection on db.Book{
//          *,
//             case
//                 when stock >= 15
//                      then 3
//                 when stock > 5
//                      then 2
//                 else 1
//             end as stockCriticality : Integer
//     };
// }


//   entity Book as projection on db.Book {
//     *,
//     case
//       when stock >= 15 then 3
//       when stock > 5 then 2
//       else 1
//     end as stockCriticality : Integer
//   }

}
