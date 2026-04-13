const cds = require('@sap/cds');
const axios = require('axios');
const location = require('india-states-districts');


module.exports = cds.service.impl(function () {

  this.on('getByLocation', async (req) => {

    const loc = req.data.loc;

    try {
      let searchText = loc;

      if (/^\d+$/.test(loc)) {

        const res1 = await axios.get(
          `https://api.postalpincode.in/pincode/${loc}`
        );

        if (res1?.data?.[0]?.Status === "Error") {
          return [{
            name: "Invalid pincode",
            state: "",
            latitude: null,
            longitude: null
          }];
        }

        const place = res1.data[0].PostOffice[0];
        // console.log(place);
        searchText = place.District || place.State;
      }

      let res2 = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&language=en&format=json`);
      // console.log(res2);
      
      // if (!res2?.data?.results?.length) {
      //   res2 = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=India&language=en&format=json`);
      // }

      if (!res2?.data?.results?.length) {
        return [{
          name: "No data found",
          state: "",
          latitude: null,
          longitude: null
        }];
      }

      const data = res2.data.results[0];

      return [{
        name: data.name,
        state: data.admin1 || "",
        latitude: data.latitude,
        longitude: data.longitude
      }];

    } catch (err) {
      console.error(err);
      return req.error(500, {
        error: "Error fetching data",
        details: err.message
      });
    }
  });


  this.on('getDistricts', async (req) => {

    const { state } = req.data;

    if (!state) {
      return req.error(400, "State is required");
    }

    const data = location.getAllStatesWithDistricts();
    // console.log(data);
    

    const match = data.find(
      s => s.name.toLowerCase() === state.toLowerCase()
    );
    // console.log(match);
    
    
    if (!match) return [];

    const districts = match.districts;
    // console.log(districts);
    

    const results = await Promise.all(
      districts.map(async (district) => {

        const key = `${district}-${state}`;
        console.log(key);
        
        const geoCache = {};

        if (geoCache[key]) return geoCache[key];

        try {

          let geo = null;
          // let res;

          // res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district + ", " + state + ", India")}&language=en&format=json`);
          // geo = res.data?.results?.[0];

          if (!geo) {
            res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(district)}&language=en&format=json`);
            geo = res.data?.results?.[0];
          }

          const obj = {
            state,
            district,
            latitude: geo?.latitude || null,
            longitude: geo?.longitude || null
          };

          geoCache[key] = obj;

          return obj;

        } catch (error) {
          console.error("Geo failed:", district, error.message);
          return {
            state,
            district,
            latitude: null,
            longitude: null
          };
        }
      })
    );

    return results;
  });

});






