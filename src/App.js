import logo from "./logo.svg";
import "./App.css";
import React, { useState, useEffect } from "react";

let allCountries;

let stateToBeginWith = {},
  allTheNames;
let filteredIndices = [];
let searchRegion = "all";

function App() {
  const [dataState, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateObject, setStateObject] = useState(null);
  const [detailsView, setDetailsView] = useState(false);

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

  function handleChange(event) {
    let enteredString = event.target.value;

    // console.log(stateObject.textEntered);

    applyFilter(enteredString);

    // update State
    setStateObject({
      ...stateObject,
      textEntered: enteredString,
      displayedList: filteredIndices,
    });
  }

  function handleMenuChange(event) {
    let theValue = event.target.value;

    if (theValue !== searchRegion) {
      // Change of Region
      searchRegion = theValue;
      // Apply Change
      applyFilter();

      // update State
      setStateObject({
        ...stateObject,
        displayedList: filteredIndices,
        region: searchRegion,
      });
    }
  }

  function applyFilter(enteredString = stateObject.textEntered) {
    if (enteredString !== "") {
      if (searchRegion === "all") {
        filteredIndices = allTheNames.filter((element) =>
          element[0].includes(enteredString.toLowerCase())
        );
      } else {
        filteredIndices = allTheNames.filter(
          (element) =>
            allCountries[element[1]].region === searchRegion &&
            element[0].includes(enteredString.toLowerCase())
        );
      }
    } else {
      // enteredString === ""

      filteredIndices =
        searchRegion === "all"
          ? allTheNames
          : allTheNames.filter(
              (element) => allCountries[element[1]].region === searchRegion
            );
    }

    let noDuplicates = new Set(filteredIndices.map((element) => element[1]));
    filteredIndices = [...noDuplicates];
    // filteredIndices now contains all the relevant indices to allCountries that match the Criteria
  }

  function findParent(element) {
    if (element.classList.contains("countrycard")) {
      console.log("YES",element.id);
      return
    }
    const parent = element.parentNode;
    console.log(element);
    console.log(parent);
    if (parent.classList.contains("countrycard")) {
      console.log(parent.id);
    } else if (parent) {
      findParent(parent);
    }
  }

  function handleClick(event) {
    // event.target.parentElement.id will have the value CYnn
    // nn being (1 +) its position in allCountries
    let element = event.target;

    findParent(element);
    //console.log(event.target.parentNode.id);
    return;
    console.log(event);
    console.log(event.target);
    console.log(event.target.parentElement.id);
    console.log(event.target.children);
    console.log(event.target.childNodes);
    handleCountryDetailsViews(
      event.target.parentElement.id,
      event.target.childNodes,
      event
    );
  }

  // Error occurred whilst fetching data
  if (error) {
    return <div>{`There is a problem fetching the post data - ${error}`}</div>;
  }

  dataState && applyFilter();

  /*
      Level 4 :-
      Allow users to click on a country and view that country's full details, as shown in the frontendmentor challenge.
      Make sure to allow clicking on bordering countries to visit these neighbours
  */

  if (detailsView) {
    return (
      <div className="cview-flex-container">
        <img src="https://flagcdn.com/ag.svg" alt="" />
        <div>
          <div>
            <div className="grid-container">
              <div className="countryname">Belgium</div>
              <div className="nativename">Native Name: Belgie</div>
              <div className="population">Population: 100</div>
              <div className="capital">Capital: Brussels</div>
              <div className="region">Region: Europe</div>
              <div className="subregion">Sub Region: Western Europe</div>
              <div className="tld">Top Level Domain: .be</div>
              <div className="currencies">Currencies: Euro</div>
              <div className="languages">Languages: Dutch, French, German</div>
              <div className="theborder">Border Countries</div>
              <div className="neighbours">
                <div className="flex">
                  <div className="border-item">Navigation1</div>
                  <div className="line-break"></div>
                  <div className="border-item">Navigation2</div>
                  <div className="border-item">Navigation3</div>
                  <div className="line-break"></div>
                  <div className="border-item">Navigation4</div>
                  <div className="border-item">Navigation5</div>
                  <div className="border-item">Navigation6</div>
                  <div className="border-item">Navigation7</div>
                  <div className="line-break"></div>
                  <div className="border-item">Navigation8</div>
                  <div className="border-item">Navigation9</div>
                  <div className="border-item">Navigation10</div>
                  <div className="border-item">Navigation11</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {loading && <div>A moment please...</div>}

      {detailsView && <div>ERROR</div>}

      {dataState && (
        <div>
          <div className="flexwrap-container">
            <div className="left">
              <input
                className="searchbar"
                type="text"
                autoComplete="off"
                id="country-query"
                name="q"
                placeholder="Search for a country..."
                value={stateObject.textEntered}
                onChange={handleChange}
              />
            </div>
            <div className="right">
              <select
                name="regions-menu"
                className="select-class"
                onChange={handleMenuChange}
                defaultValue="all"
              >
                <option value="all">Filter by Region</option>
                <option value="Africa">Africa</option>
                <option value="Americas">America</option>
                <option value="Asia">Asia</option>
                <option value="Europe">Europe</option>
                <option value="Oceania">Oceania</option>
              </select>
            </div>
          </div>
          <div className="blankspace"></div>
          <DisplayCountries
            theCountries={[...stateObject.displayedList]}
            handleClick={handleClick}
          />
        </div>
      )}
    </div>
  );
}

/*
To fix the “Warning: Use the ‘defaultValue’ or ‘value’ props on <select> instead of setting ‘selected’ on <option>” error message 
we should set the defaultValue prop to the value attribute value of the default option.

So instead of the above

                <option value="all" selected>
                  Filter by Region
                </option>

Remove 'selected' and add defaultValue="all" to <select>

              <select
                name="regions-menu"
                className="select-class"
                onChange={handleMenuChange}
                defaultValue="all"
              >
                <option value="all">
                  Filter by Region
                </option>
                ...
*/

function setUp() {
  allTheNames = verifyJson();
  // console.log(allTheNames); // 482 entries

  let consecNums = [...Array(allCountries.length).keys()]; // 0,1,2,3,... to the length of allCountries-1 i.e. 0-188

  // The state has four elements: countryNameList, displayedList, textEntered, region
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
      <div className="flex-container">
        {listOfCountriesIndices.map((countryIndex) => {
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
      key={props.theIndex}
      className="countrycard"
      /*

        id={props.countryName}
        
        eg CY1 CY100 THEREFORE CY1 TO CY245 
        USING +1 BECAUSE OF const [detailsView, setDetailsView] = useState(false);
        0 WOULD BE CONSIDERED FALSE

        Also I need an #ID with the same unique number for the corresponding text just in case the text is clicked
        So I use CTnn

    */

      id={"CY" + (props.theIndex + 1)}
      onClick={props.handleClick}
    >
      <img src={props.flag} alt={`Flag for ${props.countryName}`}></img>
      <span className="cardtext" id={"CT" + (props.theIndex + 1)}>
        <h2>{props.countryName}</h2>
        <span>
          <b>Population: </b>
          {props.population}
        </span>

        <span>
          <b>Region: </b>
          {props.region}
        </span>

        <span>
          <b>Capital: </b>
          {props.capitalName}
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
    // altSpellings: (4) ['AX', 'Aaland', 'Aland', 'Ahvenanmaa']
    if (element.altSpellings.includes("Aland")) {
      allCountries[index].name.common = "Aland Islands"; // I have chosen to this instead
    } else if (aname === "Macau") {
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

/* ROUTINES FOR Level 4: DISPLAY THE DETAILS OF A COUNTRY 

Depending on what was click
If the Image the ID will be of the form CYnn
If the Text  the ID will be of the form CTnn
If the surrounding area it will return a childNodes with a string of the form 
'span#CT4.cardtext'

Anything else ignore
*/

function handleCountryDetailsViews(theId, theChildNodes, theTarget) {
  const regex = /^(C[TY]|target: span#CY)([0-9]+)/;
  const found = theId.match(regex);
  let theParent = theTarget;
  console.log(theTarget, typeof theTarget);
  console.log(theTarget.target, theTarget.parentElement);
  if (!found) {
    /* TRY TO DETERMINE THE ID BY GOING UP THE parentElement */

    let ok = false;
    let num = 0;
    while (true) {
      console.log(theParent, typeof theParent);
      console.log(theParent);
      if ("id" in theParent) {
        alert("FOUND" + theParent.id);
        ok = true;
        break;
      }

      if (++num > 4) {
        // Definitely not found!
        return;
      }
      console.log(theParent);
      theParent = theParent.target.parentNode;
    }
    console.log(theParent);
    return;

    let array = [...theChildNodes]; // convert nodes to an array
    //alert("OK" + array[1]);
    for (let i in array) console.log(i, array[i]);
    return;
  }
  console.log(found);
}

export default App;
