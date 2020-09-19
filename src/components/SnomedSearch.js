
import React from 'react';
import AsyncSelect from 'react-select/async';


const search = async (searchTerm) => {

    var searchResults = [];

    try {
        const url = `https://ontoserver.csiro.au/stu3-latest/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/%3C%3C64572001&filter=${searchTerm}&count=5`;
        const res = await fetch(url);
        const json = await res.json();
        searchResults = json.expansion.contains;
        console.log(searchResults);
    } catch(err) {
        console.log("Error while searching the ontology server");
    }

    const result =  searchResults.map(result => ({
        value: result.code,
        label: result.display
    }));

    return result;
}

export default class SnomedSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            searchTerm: "",
            searchResults: [],
            snomedValue: {},
            customStyles: {
                input: (provided) => ({
                    ...provided,
                    /* <input> search */
                    color: this.props.listColour,
                }),
                singleValue: (provided) => ({
                    /* saved value */
                    ...provided,
                    color: this.props.listColour,
                }),
                control: (provided, state) => ({
                    /* default & :focused border */
                    ...provided,
                    border: "none",
                    boxShadow: "none",
                    transition: "0.5s ease",
                    textTransform: "capitalize",
                }),
                menuList: (provided, state) => ({
                    /* Search Results Container */
                    ...provided,
                    padding: 0,
                    margin: 0,
                    textTransform: "capitalize",
                }),
                option: (provided, {data, isFocused}) => ({
                    /*A Search Result */
                    ...provided,
                    backgroundColor: isFocused
                        ? this.props.listColour +"BA"
                        : null,
                    color: isFocused
                        ? "white"
                        : null,
                }),
                /* Library Things We Do Not Want*/
                dropdownIndicator: (provided, state) => ({
                    /* Down Chevron Arrow */
                    display: "none",
                }),
                loadingIndicator: (provided, state) => ({
                    /* Animated 3 Dot Loader */
                    display: "none",
                }),
                indicatorSeparator: (provided, state) => ({
                    /* | betweem input & chevron */
                    display: "none",
                }),
                loadingMessage: (provided, state) => ({
                    /* "Loading..." on search wait */
                    display: "none",
                }),
                noOptionsMessage: (provided, state) => ({
                    /* "No options..." on empty search result */
                    display: "none",
                }),
              }
        }

    }


    render() {
        const options = this.state.searchResults.map(result => ({
            label: result.display,
            value: result.code
        }));

        return (
            <div>
                <AsyncSelect
                    styles={this.state.customStyles}
                    listColour = {this.props.listColour}
                    placeholder="Type to search..."
                    cacheOptions
                    loadOptions={search}
                    className          
                />
            </div>
        );
    }

}