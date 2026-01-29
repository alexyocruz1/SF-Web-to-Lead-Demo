/**
 * Cascading Country → Department (State) → City dropdowns
 * Uses country-state-city: https://www.npmjs.com/package/country-state-city
 */

const PLACEHOLDER = {
  country: '— Seleccione país —',
  state: '— Seleccione departamento —',
  stateNone: '— Sin departamentos —',
  city: '— Seleccione ciudad —',
};
const NO_STATES_VALUE = 'N/A';

function createOption(value, label) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  return opt;
}

function clearOptions(select, keepPlaceholder = true) {
  let placeholderText = null;
  if (keepPlaceholder) {
    const p = select.querySelector('option[value=""]');
    if (p) placeholderText = p.textContent;
  }
  select.innerHTML = '';
  if (placeholderText != null) {
    select.appendChild(createOption('', placeholderText));
  }
}

function setCountryOptions(select, countries) {
  clearOptions(select, true);
  countries.forEach((c) => {
    if (c.name) select.appendChild(createOption(c.name, c.name));
  });
}

function initCascading(countryEl, stateEl, cityEl, lib) {
  const { countries, State, City } = lib;
  if (!countryEl || !stateEl || !cityEl || !countries?.length) return;

  setCountryOptions(countryEl, countries);

  countryEl.addEventListener('change', () => {
    const countryName = countryEl.value;
    stateEl.value = '';
    cityEl.value = '';
    clearOptions(stateEl, true);
    clearOptions(cityEl, true);

    if (!countryName) return;

    const country = countries.find((c) => c.name === countryName);
    if (!country) return;

    const states = State.getStatesOfCountry(country.isoCode) || [];

    if (states.length) {
      states.forEach((s) => {
        stateEl.appendChild(createOption(s.name, s.name));
      });
    } else {
      stateEl.appendChild(createOption(NO_STATES_VALUE, PLACEHOLDER.stateNone));
      stateEl.value = NO_STATES_VALUE;
    }

    fillCities(countryEl, stateEl, cityEl, lib);
  });

  stateEl.addEventListener('change', () => {
    cityEl.value = '';
    fillCities(countryEl, stateEl, cityEl, lib);
  });
}

function fillCities(countryEl, stateEl, cityEl, lib) {
  const { countries, State, City } = lib;
  const countryName = countryEl.value;
  if (!countryName) return;

  const country = countries.find((c) => c.name === countryName);
  if (!country) return;

  const stateValue = stateEl.value;
  const noStates = stateValue === NO_STATES_VALUE || !stateValue;

  clearOptions(cityEl, true);

  let cities = [];
  if (noStates) {
    cities = City.getCitiesOfCountry(country.isoCode) || [];
  } else {
    const states = State.getStatesOfCountry(country.isoCode) || [];
    const state = states.find((s) => s.name === stateValue);
    if (state) {
      cities = City.getCitiesOfState(country.isoCode, state.isoCode) || [];
    }
  }

  cities.forEach((c) => {
    if (c.name) cityEl.appendChild(createOption(c.name, c.name));
  });
}

(async function () {
  const { Country, State, City } = await import(
    'https://esm.sh/country-state-city@3.2.1'
  );
  const countries = Country.getAllCountries();

  const lib = { countries, State, City };

  [
    { country: 'country', state: 'state', city: 'city' },
    { country: 'cat_country', state: 'cat_state', city: 'cat_city' },
  ].forEach(({ country, state, city }) => {
    initCascading(
      document.getElementById(country),
      document.getElementById(state),
      document.getElementById(city),
      lib
    );
  });
})().catch(console.error);
