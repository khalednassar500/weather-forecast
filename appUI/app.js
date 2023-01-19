const INPUT = document.getElementById('zip');
const GENERATE_BUTTON = document.getElementById('generate');
const GENERATE_DATA = document.getElementById('generate_data');
const LOADING_BEHAVIOR = document.getElementById('loading')
const API_KEY = '77a88e0e9b353c4f64ed2ff682856e28';

let lastSearch = '';
GENERATE_BUTTON.onclick = () => {
  let inputValue = INPUT.value;
  if (inputValue && inputValue !== lastSearch) {      
    lastSearch = inputValue;
    document.getElementById('user_input').classList.add('up');
    const LON_LAT_URL =`https://api.openweathermap.org/data/2.5/weather?q=${inputValue}&appid=${API_KEY}&units=metric`   // get lon, lat coords
    
    GET_DATA(LON_LAT_URL)
    .then((data) => {
      const LON = data.coord.lon;
      const LAT = data.coord.lat;
      const TEMP_URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${LAT}&lon=${LON}&exclude=minutely&appid=${API_KEY}&units=metric`
      const {main,name, sys:{country}} = data;

      GET_DATA(TEMP_URL)
      .then((tempData) => {
        POST_DATA('/add', tempData);

        updateUI(name, country);
      })
    })
  }
}

/*-- get request --*/
const GET_DATA = async (url) => {
  LOADING_BEHAVIOR.classList.add('show');
  const RES = await fetch(url);
  
  try {
    const DATA = await RES.json();
    if (DATA.cod == 404) throw DATA;
    return DATA;
  }catch(error) {
    LOADING_BEHAVIOR.classList.remove('show');
    GENERATE_DATA.classList.add('show');
    GENERATE_DATA.innerHTML = '<h1>'+error.message+'</h1>';
    console.log('error:--> ' + error.message);
    return;
  }
}

/*-- POST request --*/
const POST_DATA = async (url, data = {}) => {
  const RES = await fetch (url, {
    method: 'POST', 
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json',
    },       
    body: JSON.stringify(data), 
  })
}

/*-- update the UI --*/
const WEATHER_CONDITIONS = {
  '01': 'It will be a lovely day',
  '02': 'It will be a lovely day',
  '03': 'It will be a lovely day',
  '04':'It will be a lovely day',
  '09': "Don't forget the umbrella today",
  '10': "Don't forget the umbrella today",
  '11': 'It will be a terrifying day',
  '13':  'It will be a cold white day',
  '50': 'Watch out today while you are out'
}

const DATE = document.getElementById('date');
const TODAY_ICON = document.getElementById('today_icon');
const DESCIRIPTION = document.getElementById('description');

const updateUI = async (name, country) => {
  const RES = await fetch('/all');

  try {
    const NEW_DATA = await RES.json();

    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const CURRENT_DAY = DAYS[new Date().getDay()];
    
    let todayUIData = `
    <div id='head'>
      <h1>${name} <sup>${country}</sup></h1>          
      <p id='date'>${CURRENT_DAY}</p>
    </div>

    <section id='today'>
    <h2>❝ ${WEATHER_CONDITIONS[NEW_DATA.current.weather[0].icon.slice(0,2)]} ❞</h2>
    <section id='today_data'>
      <div>
        <section id='icon'>
          <img id='today_icon' src='./icons/${NEW_DATA.current.weather[0].icon}.svg' alt='today weather icon'>
          <p id='description'>${NEW_DATA.current.weather[0].description}</p>
        </section>
        <p id='temp'>${Math.round(NEW_DATA.current.temp)}<sup>℃</sup></p>
      </div>
      <div>
        <p>Wind: ${NEW_DATA.current.wind_speed} mph</p>
        <p>Humidity: ${NEW_DATA.current.humidity}%</p>
      </div>
    </section>
    </section>`;

    let currentHoure = new Date().getHours();
    let next48HoureData = NEW_DATA.hourly.map((x,i) => {
      if (currentHoure > 23 ) currentHoure = 00;
      ++currentHoure
      return  `
        <div>
          <p>${Math.round(x.temp)}<sup>℃</sup></p> 
          <img src='./icons/${x.weather[0].icon}.svg' alt='weather image'>
          <p>${currentHoure-1}:00</p>
        </div>`;
    });

    let next24HoureUIData = `
      <section id='forecast_hourly'>
        <h3>Forecast for next 24 hours</h3>
        <section>
          ${next48HoureData.slice(0 , 24).join('')}
        </section>
      </section>`;

    let currentDay = new Date().getDay()-1;
    let next7DayData = NEW_DATA.daily.map((x,i) => {
      ++currentDay
      if (currentDay > 6 ) currentDay = 0;
      return  `
        <div>
          <p>${Math.round(x.temp.max)}<sup>℃</sup></p> 
          <img src='./icons/${x.weather[0].icon}.svg' alt='weather image'>
          <p>${DAYS[currentDay].slice(0,3)}</p>
        </div>`
    });
    let next7DayUIData = `
      <section id='forecast_daily'>
        <h3>Forecast for next 7 days</h3>
        <section>
          ${next7DayData.slice(0 , 7).join('')}
        </section>
      </section>`;
    GENERATE_DATA.innerHTML = `
      ${todayUIData}
      ${next24HoureUIData}
      ${next7DayUIData}`;

    GENERATE_DATA.scrollIntoView();
    LOADING_BEHAVIOR.classList.remove('show');
    GENERATE_DATA.classList.add('show');
  }catch(error) {
    console.log('error :---> '+ error)
  }
}
