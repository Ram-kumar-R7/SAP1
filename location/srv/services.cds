type Location {
  name      : String;
  state     : String;
  latitude  : Double;
  longitude : Double;
}

type District {
  state     : String;
  district  : String;
  latitude  : Double;
  longitude : Double;
}


service LocationService {

  function getByLocation(loc : String)
    returns array of Location;

  function getDistricts(state : String)
    returns array of District;

}




