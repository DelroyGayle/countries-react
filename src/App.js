import "./App.css";
import React, { useState, useEffect } from "react";
/* Will use local-storage to keep a record of the stateful knowledge of the theme being used */
import useLocalStorage from "use-local-storage";

let allCountries;

let stateToBeginWith = {},
  allTheNames;
let filteredIndices = [];
let searchRegion = "all";
let countryIndex, countryCodeTable;

function App() {
  const [dataState, setDataState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateObject, setStateObject] = useState(null);
  const [detailsView, setDetailsView] = useState(0); // Main View

  /*
  First, check if the user has set a theme preference in their browser settings. 
  Then create a stateful theme variable that is tied to localStorage and the setTheme function to update theme. 
  
  useLocalStorage adds a key:value pair to localStorage if it doesn’t already exist, 
  which defaults to theme: "light", unless our matchMedia check comes back as true, 
  in which case it’s theme: "dark". 
  
  This method handles both possibilities of keeping the theme settings for a returning user, 
  or respecting their browser settings by default with regards to new users.
  For more details see
  https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/ 
  */

  const defaultDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useLocalStorage(
    "theme",
    defaultDark ? "dark" : "light"
  );

  const nightText = "Night Mode";
  const dayText = "Day Mode";

  const switchTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

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

  function clearSearch() {
    if (stateObject.textEntered !== "") {
      applyFilter("");

      // update State
      setStateObject({
        ...stateObject,
        textEntered: "", /* Cleared the Search String */
        displayedList: filteredIndices
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

  function sortArray(a, z) {
    return a.localeCompare(z);
  }

  function handleClick(event) {
    /*
       Determine the #ID of the clicked element which is either CYnn or CTnn
       nn being (1 +) its position in allCountries
    */

    countryIndex = handleCountryDetailsViews(
      event.target.parentElement.id,
      event.target
    );
    if (countryIndex)
      // Success, update State and decrement 'countryIndex' to true value
      setDetailsView(countryIndex--); // Country Detailed View
  }

  function handleGoBack(event) {
    setDetailsView(0); // Reset the State back to Main View
  }

  function handleBorderButton(event) {
    const regex = /^(CB)([0-9]+)/;
    let theId = event.target.id;
    let found = theId.match(regex);

    if (!found) {
      // Just in case the #ID cannot be determined, do nothing
      return;
    }

    // RESULT: found ==> (3) ['CB147', 'CB', '147', index: 0, input: 'CB147', groups: undefined
    // THE RELEVANT INDEX IS IN found[2]

    countryIndex = Number(found[2]);
    // Note it is (1 +) the actual position in allCountries
    // in order to update the State with a nonzero value
    setDetailsView(countryIndex--); // Update State for new country and decrement 'countryIndex' to true value
  }

  /*
    Give the outermost <div> element of the application a data-theme attribute 
    and toggling its value between light and dark. 
    When it’s dark, the CSS[data-theme='dark'] section overrides the variables we defined in the :root, 
    so any styling which relies on those variables is toggled as well.
    For more details see
    https://css-tricks.com/easy-dark-mode-and-multiple-color-themes-in-react/ 
  */
  function MainHeading() {
    return (
      <div>
        <div className="flexwrap-container mb1">
          <div className="left">
            <h1>Where in the world?</h1>
          </div>
          <div className="right">
            <div>
              <div class="toggle">
                <input
                  type="checkbox"
                  id="toggle"
                  checked={theme === "light"}
                  onClick={switchTheme}
                />
                <label htmlFor="toggle"></label>
              </div>
              <button
                id="theme-button"
                className={
                  "noborder " + (theme === "light" ? "day-mode" : "night-mode")
                }
                onClick={switchTheme}
              >
                {theme === "light" ? nightText : dayText}
              </button>
            </div>
          </div>
        </div>
        <hr></hr>
      </div>
    );
  }

  function BorderCountries(props) {
    if (!props.flag) return null; // There are no bordering countries so render nothing

    let countryInfo = props.theCountryInfo;

    /*
   For example, 
   Albania: borders: (4) ['MNE', 'GRC', 'MKD', 'UNK']
   Colombia":
        "borders": [
            "BRA",
            "ECU",
            "PAN",
            "PER",
            "VEN"
        ]

   Each of these 3 character codes as been given a number of 0 - 244 stored in countryCodeTable     
 */

    const listButtons = countryInfo.borders.map((aBorder, index) => {
      let numValue = countryCodeTable[aBorder];
      let theId = "CB" + (numValue + 1); // + 1 to ensure nonzero; so CB1 TO CB245

      return (
        <button
          key={index}
          className="button-38 border-item"
          id={theId}
          onClick={props.handleClick}
        >
          {allCountries[numValue].name.common}
        </button>
      );
    });

    return (
      <>
        <div className="theborder">
          <span className="title">Border Countries: </span>
        </div>
        <div className="neighbours">
          <div className="borders-flex-container">{listButtons}</div>
        </div>
      </>
    );
  }

  /* END OF FUNCTIONS, START OF CODE */

  // Error occurred whilst fetching data
  if (error) {
    return <div>{`There is a problem fetching the post data - ${error}`}</div>;
  }

  dataState && !detailsView && applyFilter();

  /*
      Level 4 - Country Detailed View
      Allow users to click on a country and view that country's full details, as shown in the frontendmentor challenge.
      Make sure to allow clicking on bordering countries to visit these neighbours
  */

  /******************** IF DETAILED VIEW  ********************/

  if (detailsView) {
    let countryInfo = allCountries[countryIndex];
    let theLanguages = "",
      theNativeName = "";
    let anyBorders = "borders" in countryInfo && countryInfo.borders.length > 0; // Are there any bordering countries?
    /*
    For population, .toLocaleString() adds the commas
    */

    let [firstKey] = Object.keys(countryInfo.currencies); // Destructuring
    let theCurrencies =
      "name" in countryInfo.currencies[firstKey]
        ? countryInfo.currencies[firstKey].name
        : "";

    if ("nativeName" in countryInfo.name) {
      [firstKey] = Object.keys(countryInfo.name.nativeName); // Destructuring
      theNativeName =
        "common" in countryInfo.name.nativeName[firstKey]
          ? countryInfo.name.nativeName[firstKey].common
          : "official" in countryInfo.name.nativeName[firstKey]
          ? countryInfo.name.nativeName[firstKey].official
          : "";
    }

    if ("languages" in countryInfo) {
      let array = Object.values(countryInfo.languages).sort(sortArray);
      theLanguages = array.join(", ");
    }

    return (
      <div className="App" data-theme={theme}>
        <MainHeading />
        <button className="button" onClick={handleGoBack}>
          <div className="button-arrow button-arrow-left"></div>
          Back
        </button>
        <div className="cview-flex-container">
          <img
            src={countryInfo.flags.svg}
            alt={`Flag for ${countryInfo.name.common}`}
          ></img>
          <div>
            <div>
              <div className="grid-container">
                <h2 className="countryname">{countryInfo.name.common}</h2>
                <div className="nativename">
                  <span className="title">Native Name: </span>
                  {theNativeName}
                </div>
                <div className="population">
                  <span className="title">Population: </span>
                  {countryInfo.population.toLocaleString() || ""}
                </div>
                <div className="capital">
                  <span className="title">Capital: </span>
                  {countryInfo.capital[0] || ""}
                </div>
                <div className="region">
                  <span className="title">Region: </span>
                  {countryInfo.region || ""}
                </div>
                <div className="subregion">
                  <span className="title">Sub Region: </span>
                  {countryInfo.subregion || ""}
                </div>
                <div className="tld">
                  <span className="title">Top Level Domain: </span>
                  {countryInfo.tld[0] || ""}
                </div>
                <div className="currencies">
                  <span className="title">Currencies: </span>
                  {theCurrencies}
                </div>
                <div className="languages">
                  <span className="title">Languages: </span>
                  {theLanguages}
                </div>
                <BorderCountries
                  theCountryInfo={countryInfo}
                  flag={anyBorders}
                  handleClick={handleBorderButton}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /******************** ELSE MAIN VIEW  ********************/

  // Otherwise the Main View

  return (
    <div className="App" data-theme={theme}>
      {loading && <div className="centre">A moment please...</div>}

      {error && <div className="centre">ERROR</div>}

      {dataState && (
        <div>
          <MainHeading />
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

                <div class="close-x" onClick={clearSearch}>
                  &#10006;
                </div>
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
        USING +1 BECAUSE OF const [detailsView, setDetailsView] = useState(0);
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
      if (!("capital" in element) && element.capital[0]) {
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

      /*
Discovered that
There is a problem fetching the post data - No. 4 - Martinique has no IOC code!
There is a problem fetching the post data - No. 22 - Réunion has no IOC code!
There is a problem fetching the post data - No. 23 - Montserrat has no IOC code!
There is a problem fetching the post data - No. 26 - Saint Pierre and Miquelon has no IOC code!
ETC

Some countries have no IOC
Instead use 'cca3'

      if (!(("cioc" in element) || ("cca3" in element))) {
        throw new Error(`No. ${index} - ${aname} has no IOC code!`);
      }
*/
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

  /* console.log(allCountries); // 245 countries
  
  You can have duplicates,
  that is Afghanistan has both
        "cca3": "AFG",
        "cioc": "AFG",
  */

  let tempObject = {};
  countryCodeTable = {}; // Global Variable

  allCountries.forEach((element, index) => {
    tempObject[element.name.common.toLowerCase()] = index; // Country Name
    if (element.capital.length > 0) {
      tempObject[element.capital[0].toLowerCase()] = index; // Capital Name
    }
    let found = false;
    if ("cioc" in element) {
      // Check for Duplicates
      if (element.cioc in countryCodeTable) {
        throw new Error(
          `Duplicate CIOC found ${element.cioc} found for ${element.name.common}`
        );
      }

      countryCodeTable[element.cioc] = index;
      found = true;
    }

    if (!(element.cca3 in countryCodeTable)) {
      countryCodeTable[element.cca3] = index;
      found = true;
    }

    if (!found) {
      throw new Error(`No Country Code found for ${element.name.common}`);
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
If the Image was clicked, the ID will be of the form CYnn
If the Text was clicked, the ID will be of the form CTnn
If the surrounding area was clicked use 'findParent() to determine the parent ID
If unsuccessful, ignore
*/

function findParent(element) {
  // Search the DOM tree
  const parent = element.parentNode;
  if (parent.classList.contains("countrycard")) {
    return parent.id;
  } else if (parent) {
    return findParent(parent);
  }

  return null; // Unsuccessful
}

function handleCountryDetailsViews(theId, element) {
  const regex = /^(C[TY])([0-9]+)/;
  let found = theId.match(regex);

  // Firstly check whether the current value of element is already pointing at the id using CLASS "countrycard"
  if (!found && element.classList.contains("countrycard")) {
    found = element.id.match(regex);
  }

  // Otherwise, try to determine the ID by searching among the Parent Element
  if (!found) {
    element = findParent(element);
    if (!(element && (found = element.match(regex)))) {
      return 0; // Unsuccessful
    }
  }

  // RESULT: found ==> 3) ['CY1', 'CY', '1', index: 0, input: 'CY1', groups: undefined]
  // THE RELEVANT INDEX IS IN found[2]

  let countryIndex = Number(found[2]);
  // Note it is (1 +) the actual position in allCountries
  // in order to update the State with a nonzero value
  return countryIndex;
}

export default App;
