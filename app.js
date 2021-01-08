const start = document.querySelector("#starts-input");
const destination = document.querySelector("#destination-input");
const origin = document.querySelector("#start-list");
const destinationList = document.querySelector("#destinations-list");
const planBtn = document.querySelector("#planBtn");
//TRIP
let originLon = "";
let originLat = "";
let destLon = "";
let destlat = "";

const TOKEN =
  "sk.eyJ1IjoiYWRlYmF5b2Q4NDEyIiwiYSI6ImNramxrbjBieTBiMWkycm4wczQ4YnZwbTUifQ.HPHXzIRdJAEEmklz4EwhqQ";
const URL =
  "https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=YOUR_MAPBOX_ACCESS_TOKEN";

start.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchValue = start.value;
    origin.innerHTML = null;
    e.preventDefault();
    getStart(searchValue, TOKEN);
    // console.log(e);
  }
});
const getStart = async (searchValue, TOKEN) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=${TOKEN}`
  );
  const data = await response.json();
  const report = data.features;
  for (places of report) {
    // console.log(places.place_name);

    const [lon, lat] = places.geometry.coordinates;
    let li = document.createElement("li");
    li.innerHTML = `
          <div class=name>${places.place_name}</div>
          <div>${places.text}</div>
          `;
    li.setAttribute("data-lon", lon);
    li.setAttribute("data-lat", lat);
    li.classList.add("items-origin");
    li.addEventListener("click", () => {
      setCoordinates(lon, lat, "origin");
      isSelectedOrigin(li);
    });
    origin.appendChild(li);
  }
};
///destination
destination.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const searchValue = destination.value;
    destinationList.innerHTML = "";
    getDestination(searchValue, TOKEN);
    // console.log(e);
  }
});

const getDestination = async (searchValue, TOKEN) => {
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=${TOKEN}`
  );
  const data = await response.json();
  const report = data.features;
  for (places of report) {
    const [lon, lat] = places.geometry.coordinates;
    let li = document.createElement("li");
    li.innerHTML = `
      <div class=name>${places.place_name}</div>
      <div>${places.text}</div>
      `;
    li.setAttribute("data-lon", lon);
    li.setAttribute("data-lat", lat);
    li.classList.add("items-destination");
    li.addEventListener("click", () => {
      setCoordinates(lon, lat, "destination");
      isSelectedDestination(li);
    });
    destinationList.appendChild(li);
  }
};
const setCoordinates = (lon, lat, type) => {
  switch (type) {
    case "origin":
      originLon = lon;
      originLat = lat;
      break;
    case "destination":
      destLon = lon;
      destlat = lat;
      break;
    default:
      break;
  }
};
//selected class handler
const isSelectedDestination = (li) => {
  let listItems = Array.from(document.querySelectorAll(".items-destination"));
  for (list of listItems) {
    list.classList.remove("selected");
  }
  li.classList.add("selected");
};
const isSelectedOrigin = (li) => {
  let listItems = Array.from(document.querySelectorAll(".items-origin"));
  for (list of listItems) {
    list.classList.remove("selected");
  }
  li.classList.add("selected");
};

///plan trip
planBtn.addEventListener("click", () => {
  console.log({ originLon, originLat, destLon, destlat });
});
