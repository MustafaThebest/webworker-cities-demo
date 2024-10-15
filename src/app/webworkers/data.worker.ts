/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  console.log("Data: ", data);
  let cities = data.cities;
  const [adminOne, adminTwo] = [data.adminOne, data.adminTwo]
  
  cities.map((city: any) => {
    if (adminOne.length > 0) {
      let foundAdminOne = adminOne.find((item: any) => {
        return item.code == `${city.country}.${city.admin1}`;
      });

      if (foundAdminOne) {
        city["subdivision1"] = foundAdminOne.name;
      };
    }

    if (adminTwo.length > 0) {
      let foundAdminTwo = adminTwo.find((item: any) => {
        return item.code == `${city.country}.${city.admin1}.${city.admin2}`;
      });

      if (foundAdminTwo) {
        city["subdivision2"] = foundAdminTwo.name;
      };
    }
  });

  postMessage(cities);
});
