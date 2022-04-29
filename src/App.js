import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

const LOADING = "loading",
  LOADED = "loaded",
  FAILURE = "failure",
  SUCCESS = "success",
  RUNNING = "running";

let allCountries;
let errMessage = null;
let fetchedFlag = LOADING; // use this to determine the success of 'fetch'
let stateToBeginWith = {},
  allTheNames;

function App() {
  const [state, setState] = useState(false);
  useEffect(() => {
    fetch(`https://restcountries.com/v3.1/all`)
      .then((result) => {
        if (result.status !== 200) {
          errMessage = `Server responds with error: ${result.status}`;
          throw new Error(errMessage);
        }
        // console.log(result.status);
        return result.json();
      })
      .then((data) => {
        allCountries = data;
        fetchedFlag = LOADED;
        setUp();
        setState(true);
      })
      .catch((err) => {
        if (!errMessage) {
          errMessage = "Status Error = " + err;
        }
        fetchedFlag = FAILURE;
        throw new Error(errMessage);
      });
  }, []);

  //const [stateObject, setStateObject] = useState({ ...stateToBeginWith }); // shallow copy
  const [stateObject, setStateObject] = useState(null); // shallow copy
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  console.log(fetchedFlag);
  console.log(stateObject);
  console.log(stateToBeginWith);

  function handleClick(event) {
    console.log(fetchedFlag, SUCCESS);
    if (fetchedFlag === LOADING) {
      return null;
    }

    console.log(stateToBeginWith);
    console.log(fetchedFlag);

    if (fetchedFlag === SUCCESS) {
      // Very first Iteration
      // update State
      console.log(stateObject);
      setStateObject((state) => Object.assign({}, stateToBeginWith)); // shallow copy
      //forceUpdate();
      fetchedFlag = RUNNING;
      console.log(stateObject);
      console.log(stateToBeginWith);
    }

    console.log("WELL");
    console.log(stateObject);
  }

  handleClick();

  if (fetchedFlag === LOADING) {
    return null;
  }
  setStateObject((state) => Object.assign({}, stateToBeginWith));
  return (
    <div className="App">
      <DisplayCountries
        theCountries={[...stateObject.displayedList]}
        handleClick={handleClick}
      />
    </div>
  );
}

function setUp() {
  let allTheNames = verifyJson();
  fetchedFlag = SUCCESS;
  console.log(fetchedFlag);

  let consecNums = [...Array(allCountries.length).keys()]; // 0,1,2,3,... to the length of allCountries-1 i.e. 0-188

  // The state has 4 elements: countryNameList, displayedList, textEntered, region
  stateToBeginWith = {
    countryNameList: consecNums,
    displayedList: consecNums,
    textEntered: "",
    region: "all",
  };

  console.log(fetchedFlag, stateToBeginWith);
}

function RunApp(props) {
  //const [stateObject, setStateObject] = useState({ ...objectToBeginWith }); // shallow copy

  console.log("TESTING");

  DisplayCountries();
  //const [stateObject, setStateObject] = useState({ ...tempObject }); // shallow copy
  return <>DisplayCountries propsAllObjects=tempAllObjects</>;
}

const DisplayCountries = (props) => {
  let listOfCountriesIndices = props.theCountries;
  return (
    <div className="flex-container">
      {listOfCountriesIndices.map((countryIndex) => {
        // let theClassName = child.gender === "m" ? "malename" : "femalename";
        let theEntry = allCountries[countryIndex];
        return (
          <DisplayACountry
            key={countryIndex}
            countryName={theEntry.common.name}
            capitalName={theEntry.capital}
            flag={theEntry.flags.svg}
            alt={theEntry.flags.svg}
            region={theEntry.region}
            population={theEntry.population}
            //theClassName={theClassName}
            theIndex={countryIndex}
            handleClick={props.handleClick}
          />
        );
      })}
    </div>
  );
};

function DisplayACountry(props) {
  let theSpan = (
    <span
      key={props.index}
      className="countrycard"
      id={props.countryName}
      onClick={props.handleClick}
    >
      <img src={props.flag} alt={`Flag for ${props.countryName}`}></img>
      <span className="cardtext">
        <h2>{props.countryName}</h2>
        <span>
          <b>Population:</b> {props.population}
        </span>

        <span>
          <b>Region:</b> {props.region}
        </span>

        <span>
          <b>Capital:</b> {props.capital}
        </span>
      </span>
    </span>
  );
  return theSpan;
}

/*
 check that the inputted allCountriesJSON data is consistent 
 also build a secondary list with all the country names and capitals names 

 List has 250 countries

 FORMAT

altSpellings: (3) ['UY', 'Oriental Republic of Uruguay', 'República Oriental del Uruguay']
area: 181034
borders: (2) ['ARG', 'BRA']
capital: ['Montevideo']
capitalInfo: {latlng: Array(2)}
car: {signs: Array(1), side: 'right'}
cca2: "UY"
cca3: "URY"
ccn3: "858"
cioc: "URU"
coatOfArms: {png: 'https://mainfacts.com/media/images/coats_of_arms/uy.png', svg: 'https://mainfacts.com/media/images/coats_of_arms/uy.svg'}
continents: ['South America']
currencies: {UYU: {…}}
demonyms: {eng: {…}, fra: {…}}
fifa: "URU"
flag: ...
flags: {png: 'https://flagcdn.com/w320/uy.png', svg: 'https://flagcdn.com/uy.svg'}
gini: {2019: 39.7}
idd: {root: '+5', suffixes: Array(1)}
independent: true
landlocked: false
languages: {spa: 'Spanish'}
latlng: (2) [-33, -56]
maps: {googleMaps: 'https://goo.gl/maps/tiQ9Baekb1jQtDSD9', openStreetMaps: 'https://www.openstreetmap.org/relation/287072'}
name: {common: 'Uruguay', official: 'Oriental Republic of Uruguay', nativeName: {…}}
population: 3473727
postalCode: {format: '#####', regex: '^(\d{5})$'}
region: "Americas"
startOfWeek: "monday"
status: "officially-assigned"
subregion: "South America"
timezones: ['UTC-03:00']
tld: ['.uy']
translations: {ara: {…}, ces: {…}, cym: {…}, deu: {…}, est: {…}, …}
unMember: true

THEREFORE DISCOVERED THAT 
Uncaught Error: No. 25 - Antarctica has no capital!
region: "Antarctic"

Uncaught Error: No. 65 - Bouvet Island has no capital! 
region: "Antarctic"

Uncaught Error: No. 107 - Macau has no capital!
region: "Asia"

Uncaught Error: No. 181 - Heard Island and McDonald Islands has no capital!
region: "Antarctic"

SO I WILL FILTER ONLY FOR 
Africa
America
Asia
Europe
Oceania

This results with allCountries having 189 entries
*/

function verifyJson() {
  allCountries.forEach((element, index) => {
    if (!element.name.common) {
      throw new Error(`No. ${index} - CANNOT DETERMINE COUNTRY NAME`);
    }
    let aname = element.name.common;
    if (aname === "Macau") {
      element.capital = [];
    } else if (
      aname === "Antarctica" ||
      aname === "Bouvet Island" ||
      aname === "Heard Island and McDonald Islands"
    ) {
      // IGNORE - region: "Antarctic"
    } else {
      if (!("capital" in element)) {
        throw new Error(`No. ${index} - ${aname} has no capital!`);
      }
      if (!element.flags.svg) {
        throw new Error(`No. ${index} - ${aname} has no SVG flag!`);
      }
      if (!("population" in element)) {
        throw new Error(`No. ${index} - ${aname} has no population!`);
      }
      if (!("region" in element)) {
        throw new Error(`No. ${index} - ${aname} has no region!`);
      }
    }
  });

  allCountries = allCountries
    .filter(
      (element) =>
        element.region === "Africa" ||
        element.region === "America" ||
        element.region === "Asia" ||
        element.region === "Europe" ||
        element.region === "Oceania"
    )
    .sort(sortCountries);
  // console.log(allCountries); // 189 countries

  let tempObject = {};
  allCountries.forEach((element, index) => {
    tempObject[element.name.common.toLowerCase()] = index; // Country Name
    if (element.capital.length > 0) {
      tempObject[element.capital[0].toLowerCase()] = index; // Country Name
    }
  });
  /*
  console.log(tempObject);

This now contains a list of all countries' names and their capitals' names and their position within allCountries e.g.

Abu Dhabi: 177
Abuja: 117
Accra: 54
Adamstown: 130
Addis Ababa: 44
Afghanistan: 0
Albania: 1
Algeria: 2
Algiers: 2
Alofi: 118
American Samoa: 3
Amman: 75
Amsterdam: 113
ETC

console.log(Object.values(tempObject));
(371) [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10,  ...]

console.log(Object.keys(tempObject));
(371) ['Afghanistan', 'Kabul', 'Albania', 'Tirana', 'Algeria', 'Algiers', ...]

.toLowerCase()
(371) ['afghanistan', 'kabul', 'albania', 'tirana', 'algeria', 'algiers'
  */

  return tempObject;
}

function sortCountries(a, z) {
  return a.name.common < z.name.common
    ? -1
    : a.name.common > z.name.common
    ? 1
    : 0;
}

export default App;
