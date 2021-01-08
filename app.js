const start = document.querySelector("#starts-input");
const destination = document.querySelector("#destination-input");
const origin = document.querySelector("#start-list");
const destinationList = document.querySelector("#destinations-list");
const planBtn = document.querySelector("#planBtn");
const myTrip = document.querySelector("#my-trip");
const errors = document.querySelector("#errors");
//TRIP
let originLon;
let originLat;
let destLon;
let destlat;

const TOKEN =
  "sk.eyJ1IjoiYWRlYmF5b2Q4NDEyIiwiYSI6ImNramxrbjBieTBiMWkycm4wczQ4YnZwbTUifQ.HPHXzIRdJAEEmklz4EwhqQ";
const URL =
  "https://api.mapbox.com/geocoding/v5/mapbox.places/Los%20Angeles.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=YOUR_MAPBOX_ACCESS_TOKEN";

const TRIP_URL = "https://api.winnipegtransit.com/api/v3/trip-planner";
const TRIP_API = "bc48tF4O8hcBz_1j-kkc";
start.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchValue = start.value;
    if (!searchValue) return;
    origin.innerHTML = null;
    e.preventDefault();
    getStart(searchValue, TOKEN);
    // console.log(e);
  }
});
const getStart = async (searchValue, TOKEN) => {
  errors.innerHTML = "";
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=${TOKEN}`
  );
  const data = await response.json();
  const report = data.features;
  // console.log(report);
  if (report.length === 0) {
    errors.innerHTML = `Oops! Out of range`;
    return;
  }
  for (places of report) {
    // console.log(places.place_name);
    //using array distrucring
    const [lon, lat] = places.geometry.coordinates;
    let li = document.createElement("li");
    let strArr = places.place_name.split(",");
    li.innerHTML = `
          <div class=name>${strArr[0]}</div>
          <div>${strArr[1]}</div>
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
  errors.innerHTML = "";

  if (e.key === "Enter") {
    e.preventDefault();

    const searchValue = destination.value;
    if (!searchValue) return;
    destinationList.innerHTML = "";
    getDestination(searchValue, TOKEN);
    // console.log(e);
  }
});

const getDestination = async (searchValue, TOKEN) => {
  errors.innerHTML = "";
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchValue}.json?bbox=-97.325875, 49.766204, -96.953987, 49.99275  &access_token=${TOKEN}`
  );
  const data = await response.json();
  const report = data.features;
  if (report.length === 0) {
    errors.innerHTML = `Oops! Out of range`;
    return;
  }
  for (places of report) {
    const [lon, lat] = places.geometry.coordinates;
    let li = document.createElement("li");
    let strArr = places.place_name.split(",");
    li.innerHTML = `
          <div class=name>${strArr[0]}</div>
          <div>${strArr[1]}</div>
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
  errors.innerHTML = "";
  let listItems = Array.from(document.querySelectorAll(".items-destination"));
  for (list of listItems) {
    list.classList.remove("selected");
  }
  li.classList.add("selected");
};
const isSelectedOrigin = (li) => {
  errors.innerHTML = "";
  let listItems = Array.from(document.querySelectorAll(".items-origin"));
  for (list of listItems) {
    list.classList.remove("selected");
  }
  li.classList.add("selected");
};

///plan trip
planBtn.addEventListener("click", () => {
  // console.log({ originLon, originLat, destLon, destlat });
  if (!destLon || !destlat || !originLat || !originLon) {
    errors.innerHTML = "Please select your origin and destination";
    return;
  }
  if (destLon === originLon && destlat === originLat) {
    errors.innerHTML = "you cannot select same location";
    return;
  }
  getTrip();
});
const getTrip = async () => {
  const response = await fetch(
    `https://api.winnipegtransit.com/v3/trip-planner.json?origin=geo/${originLat},${originLon}&api-key=${TRIP_API}&destination=geo/${destlat},${destLon}`
  );
  const data = await response.json();
  // console.log(data);
  let report = data;
  // report.plans.sort((a, b) => {
  //   if (a.segments.length > b.segments.length) return -1;
  // });
  // console.log(report);
  if (report.plans.length === 0) {
    errors.innerHTML = "No plan at this hour";
    return;
  }
  report.plans.sort((a, b) => {
    if (a.times.durations.total > b.times.durations.total) return -1;
  });
  // console.log(report);

  // console.log(report.plans[report.plans.length - 1]);
  let recommendedPath = report.plans[report.plans.length - 1];
  //loop through recommended path
  for (path of recommendedPath.segments) {
    updateTrips(path);
  }
};

const updateTrips = (path) => {
  const li = document.createElement("li");
  switch (path.type) {
    case "walk":
      li.innerHTML = `<i class="fas fa-walking" aria-hidden="true"></i>Walk for ${
        path.times.durations.total
      } minutes
      to ${
        path.to.destination
          ? `your destination`
          : `stop #${path.to.stop.key} - ${path.to.stop.name}`
      }`;
      myTrip.appendChild(li);
      break;
    case "ride":
      li.innerHTML = `<i class="fas fa-bus" aria-hidden="true"></i>Ride the Route ${path.route.name} for ${path.times.durations.total} minutes`;
      myTrip.appendChild(li);

      break;
    case "transfer":
      li.innerHTML = `<i class="fas fa-ticket-alt" aria-hidden="true"></i>Transfer from stop
      #${path.from.stop.key} - ${path.from.stop.name} to  stop #${path.to.stop.key} - ${path.from.stop.name}`;
      myTrip.appendChild(li);
      break;
    default:
      break;
  }
};
