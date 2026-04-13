// service LocationService {

//       function getByLocation(loc:String) returns array of {
//         name:String;
//         latitude:Integer;
//         longitude:Integer;
//     };

// }



service LocationService {

  function getDistricts(state: String)
    returns array of {
      state        : String;
      district     : String;
      latitude     : Decimal(10,6);
      longitude    : Decimal(10,6);
    };

}

