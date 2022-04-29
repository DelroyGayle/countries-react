import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

let allCountries;

let stateToBeginWith = {},
  allTheNames;
let filteredList = [];
let searchRegion = "all";

function App() {
  const [dataState, setDataState] = useState(null);
  //const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateObject, setStateObject] = useState(null);

  useEffect(() => {
    fetch(`https://restcountries.com/v3.1/all`)
      .then((result) => {
        if (result.status !== 200) {
          throw new Error(`Server responds with error: ${result.status}`);
        }
        // console.log(result.status);
        return result.json();
      })
      .then((data) => {
        allCountries = data;
        // console.log(data);

        setUp();
        setDataState(true);
        setError(null);
        // Very first Iteration
        // update State
        setStateObject((state) => Object.assign({}, stateToBeginWith)); // shallow copy
      })
      .catch((err) => {
        console.log(err.message);
        setError(err.message);
        setDataState(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /*
  //const [stateObject, setStateObject] = useState({ ...stateToBeginWith }); // shallow copy
  const [stateObject, setStateObject] = useState(null); // shallow copy
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  console.log(stateObject);
  console.log(stateToBeginWith);
*/

  function handleChange(event) {
    let enteredString = event.target.value;

    // console.log(stateObject.textEntered);

    applyFilter(enteredString);

    // update State
    setStateObject({
      ...stateObject,
      textEntered: enteredString,
      displayedList: filteredList,
    });
  }

  function applyFilter(enteredString = stateObject.textEntered) {
    if (enteredString !== "") {
      if (searchRegion === "all") {
        filteredList = allTheNames.filter((element) =>
          element[0].includes(enteredString.toLowerCase())
        );
      } else {
        filteredList = allTheNames.filter(
          (element) =>
            allCountries[element[1]].region === searchRegion &&
            element[0].includes(enteredString.toLowerCase())
        );
      }
    } else {
      // enteredString === ""

      filteredList =
        searchRegion === "all"
          ? allTheNames
          : allTheNames.filter(
              (element) => allCountries[element[1]].region === searchRegion
            );
    }

    let noDuplicates = new Set(filteredList.map((element) => element[1]));
    filteredList = [...noDuplicates];
    // filteredList now contains all the relevant indices to allCountries that match the Criteria
  }

  function handleClick(event) {}

  dataState && applyFilter("");
  return (
    <div className="App">
      {loading && <div>A moment please...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}

      {dataState && (
        <DisplayCountries
          theCountries={[...stateObject.displayedList]}
          handleClick={handleClick}
        />
      )}
    </div>
  );
}

function setUp() {
  allTheNames = verifyJson();
  console.log(allTheNames); // 482 entries

  let consecNums = [...Array(allCountries.length).keys()]; // 0,1,2,3,... to the length of allCountries-1 i.e. 0-188

  // The state has 4 elements: countryNameList, displayedList, textEntered, region
  stateToBeginWith = {
    countryNameList: consecNums,
    displayedList: consecNums,
    textEntered: "",
    region: "all",
  };
}

const DisplayCountries = (props) => {
  let listOfCountriesIndices = props.theCountries;
  return (
    <div>
      <div className="flexwrap-container">
        <div className="left">one</div>
        <div className="right">two</div>
      </div>
      <div className="flex-container">
        {listOfCountriesIndices.map((countryIndex) => {
          // let theClassName = child.gender === "m" ? "malename" : "femalename";
          let theEntry = { ...allCountries[countryIndex] }; // Shallow Copy

          if (theEntry.region.endsWith("s")) {
            theEntry.region = theEntry.region.slice(0, -1); // Change Americas to America
          }

          theEntry.capital =
            theEntry.capital.length > 0 ? theEntry.capital[0] : "";

          return (
            <DisplayACountry
              key={countryIndex}
              countryName={theEntry.name.common}
              capitalName={theEntry.capital}
              flag={theEntry.flags.svg}
              alt={theEntry.flags.svg}
              region={theEntry.region}
              population={theEntry.population.toLocaleString()} // .toLocaleString() adds the commas
              //theClassName={theClassName}
              theIndex={countryIndex}
              handleClick={props.handleClick}
            />
          );
        })}
      </div>
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
          <b>Capital:</b> {props.capitalName}
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
America - NOTE: Use Americas
Asia
Europe
Oceania

This resulted with allCountries having 245 entries
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
        element.region === "Americas" ||
        element.region === "Asia" ||
        element.region === "Europe" ||
        element.region === "Oceania"
    )
    .sort(sortCountries);
  // console.log(allCountries); // 245 countries

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

  console.log(Object.entries(tempObject));

Object.entries(tempObject) - 482 ENTRIES
EG

0: (2) ['afghanistan', 0]
1: (2) ['kabul', 0]
2: (2) ['åland islands', 1]
3: (2) ['mariehamn', 1]
4: (2) ['albania', 2]
5: (2) ['tirana', 2]
6: (2) ['algeria', 3]
7: (2) ['algiers', 3]
ETC

*/

  return Object.entries(tempObject);
}

/*
USE localeCompare TO SORT NAMES SUCH AS 'Aland Islands' ACCORDINGLY

function sortCountries(a, z) {
  return a.name.common < z.name.common
    ? -1
    : a.name.common > z.name.common
    ? 1
    : 0;
}
*/

function sortCountries(a, z) {
  return a.name.common.localeCompare(z.name.common);
}

export default App;
