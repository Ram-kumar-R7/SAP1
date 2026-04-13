// const cds = require('@sap/cds');
// const axios = require('axios');

// module.exports = cds.service.impl(function () {

//   this.on('getByLocation', async (req) => {

//     const loc = req.data.loc;

//     try {
//       let searchText = loc;
     

//       if (/^\d+$/.test(loc)) {

//         const res1 = await axios.get(`https://api.postalpincode.in/pincode/${loc}`);

//         if (res1.data[0].Status === "Error") {
//           return [{ name: "Invalid pincode", latitude: null, longitude: null }];
//         }

//         const place = res1.data[0].PostOffice;
//         searchText = place.District; 
    
//       }
      
//       let res2 = await axios.get(
//         `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=1&language=en&format=json`
//       );

//       if (!res2.data.results || res2.data.results.length === 0) {
//         res2 = await axios.get(
//           `https://geocoding-api.open-meteo.com/v1/search?name=India&count=1`
//         );
//       }

      
//       if (!res2.data.results) {
//         return [{
//           name: "No data found",
//           state: data.admin1 ,
//           latitude: null,
//           longitude: null
//         }];
//       }

//       const data = res2.data.results[0];

//        return [{
//         name: data.name,
//         state: data.admin1 || "",
//         latitude: data.latitude,
//         longitude: data.longitude
//       }];


//     } catch (err) {
//       console.error(err);
//       return req.error(500, "Error fetching data");
//     }

//   });

// });



// --------------------------------------------------------------------------




// const axios = require('axios');

// const CSC_API_KEY = '8b1291add55ef8aa6641cedb42bfe3686ff95b818171868a7d3fac7d69ad07a3';

// // cache (important)
// const cache = {};

// module.exports = (srv) => {

//   srv.on('getDistricts', async (req) => {

//     const { state } = req.data;

//     if (!state) {
//       return req.error(400, "State is required");
//     }

//     // ✅ return cache if exists
//     if (cache[state]) return cache[state];

//     try {
//       // 1. get all states
//       const statesRes = await axios.get(
//         "https://api.countrystatecity.in/v1/countries/IN/states",
//         {
//           headers: { "X-CSCAPI-KEY": CSC_API_KEY }
//         }
//       );

//       const states = statesRes.data;

//       // 2. find state
//       const matched = states.find(
//         s => s.name.toLowerCase() === state.toLowerCase()
//       );

//       if (!matched) return [];

//       // 3. get districts (cities)
//       const citiesRes = await axios.get(
//         `https://api.countrystatecity.in/v1/countries/IN/states/${matched.iso2}/cities`,
//         {
//           headers: { "X-CSCAPI-KEY": CSC_API_KEY }
//         }
//       );

//       const cities = citiesRes.data;

//       // ⚠ limit for safety (remove later)
//       const limited = cities.slice(0, 20);

//       // 4. get lat/lon in parallel
//       const results = await Promise.all(
//         limited.map(async (city) => {

//           try {
//             const geo = await axios.get(
//               "https://nominatim.openstreetmap.org/search",
//               {
//                 params: {
//                   q: `${city.name}, ${state}, India`,
//                   format: "json",
//                   limit: 1
//                 },
//                 headers: {
//                   "User-Agent": "capm-app"
//                 }
//               }
//             );

//             if (geo.data.length > 0) {
//               return {
//                 state,
//                 district: city.name,
//                 latitude: parseFloat(geo.data[0].lat),
//                 longitude: parseFloat(geo.data[0].lon)
//               };
//             }

//           } catch (e) {
//             console.log("Geo fail:", city.name);
//           }

//           return null;
//         })
//       );

//       const finalData = results.filter(x => x !== null);

//       // cache it
//       cache[state] = finalData;

//       return finalData;

//     } catch (err) {
//       console.error(err.message);
//       return req.error(500, "API failed");
//     }

//   });

// };


















// -----------------------------------------------------------------------------------------------------















const axios = require('axios');

// cache
const cache = {};

module.exports = (srv) => {

  srv.on('getDistricts', async (req) => {

    const { state } = req.data;

    if (!state) {
      return req.error(400, "State is required");
    }

    // cache
    if (cache[state]) return cache[state];

    try {

      //  Overpass query (district = admin_level 6)
      const query = `
        [out:json];
        area["name"="${state}"]["boundary"="administrative"]->.a;
        relation(area.a)["admin_level"="6"];
        out center;
      `;

      const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
        {
          headers: { "Content-Type": "text/plain" }
        }
      );

      const elements = response.data.elements;

      const result = elements.map(el => ({
        state,
        district: el.tags.name,
        latitude: el.center?.lat || null,
        longitude: el.center?.lon || null
      }));

      cache[state] = result;

      return result;

    } catch (err) {
      console.error(err.message);
      return req.error(500, "Failed to fetch districts");
    }

  });

};


















// -------------------------------------------------------


















