import React from 'react';
import AsyncSelect from 'react-select/async';
import { createRef } from 'react';

/**
 * Queries the SNOMED server to return correct SNOMED code and label for a
 * user inputted diagnosis search term
 * @param {*} searchTerm user-inputted diagnosis search term
 */
const search = async (searchTerm) => {

    var searchResults = [];

    try {
        const url = `https://r4.ontoserver.csiro.au/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/%3C%3C64572001&filter=*${searchTerm}*&count=10`;
        const res = await fetch(url);
        const json = await res.json();
        searchResults = json.expansion.contains;
    } catch(err) {
        console.log("Error while searching the ontology server");
    }

    const result =  searchResults.map(result => ({
        value: result.code,
        label: result.display
    }));

    return result;
}

/**
 *  The SnomedSearch is the text component present within a ListRow, upon gaining
 *  user focus it will expand in the middle of the screen and prompt for user
 *  input. After the user begins to type, SNOMED results are depicted in a
 *  dropdown.
 * 
 *  Upon selecting an option, the SNOMED label and code will be saved into the
 *  parent component
 */
export default class SnomedSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
            inputValue: "",
            closeButtonColour: "#808080"
        }

        this.asyncSelect = createRef(null);
        
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
        
        // if this is a brand new diagnoses then pop up the search bar
        if (!this.props.content?.code) this.asyncSelect.current.focus();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyPress);
    }

    handleKeyPress(e) {
        if (e.key === "Escape") {
            this.asyncSelect.current.blur();
            this.isClosing = false;
        }
    }

    render() {

        const customStyles = {
            input: (provided) => ({
                ...provided,
                /* <input> search */
                color: this.props.listColour
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
                transition: state.isFocused ? "0.3s ease" : "none",
                textTransform: "capitalize",
                minWidth: state.isFocused ? "20em" : 0,
                fontSize: "1.2em"
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
                    : "null",
            }),
            /* Library Things We Do Not Want*/
            loadingMessage: (provided, state) => ({
                /* "Loading..." on search wait */
                display: "none",
            }),
            noOptionsMessage: (provided, state) => ({
                /* "No options..." on empty search result */
                display: "none",
            }),
        };

        let containerStyle = {};
        if (this.state.isFocused) {
            containerStyle = {
                ...containerStyle,
                backgroundColor: "#101010B0",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
                cursor: "default"
            }
        }

        // So this is a bit messy, but bare with me.
        // If we are pre-populating the search (due to a list swap), don't provide
        // a value to the AsyncSelect so that it shows the placeholder text properly.
        const valueProp = {};
        if (this.props.content?.code) valueProp.value = {label: this.props.content.display, value: this.props.content.code};
        return (
            <>
                {this.state.isFocused &&
                    <div style={{position: "absolute", bottom: "1em", right: "1em", zIndex: 11, color: "grey", fontSize: "1.3em"}}>
                        Powered by <strong>SNOMED CT-AU</strong>
                    </div>
                }
                <div
                    style={containerStyle}
                    onMouseDown={() => {
                        // this closes the search popup if the user clicks the background
                        if (this.state.isFocused) {
                            this.asyncSelect.current.blur()
                            this.isClosing = true;
                        }
                    }}
                    onMouseUp={() => this.isClosing = false}
                >
                    <div
                        onMouseDown={(e) => { e.stopPropagation(); if(!this.state.isFocused) {this.asyncSelect.current.blur()}}}
                        onMouseUp={() => {if(!this.state.isFocused && !this.isClosing) {this.asyncSelect.current.focus()}}}
                    >
                        <AsyncSelect
                            {...valueProp}
                            ref={this.asyncSelect}
                            styles={customStyles}
                            listColour = {this.props.listColour}
                            components={{
                                DropdownIndicator: null,
                                LoadingIndicator: null,
                                IndicatorSeparator: null,
                            }}
                            onFocus={() => this.setState({isFocused: true})}
                            onBlur={() => this.setState({isFocused: false, inputValue: ""})}
                            placeholder= {"Search..."}
                            cacheOptions
                            loadOptions={search}
                            inputValue={this.state.inputValue}
                            onInputChange={(inputValue, {action}) => {
                                if (action === 'input-change') {
                                    this.setState({inputValue: inputValue});
                                }
                            }}
                            onChange={async (value, data) => {
                                this.props.callback({code: value.value, display: value.label});
                                this.asyncSelect.current.blur();
                            }}
                        />
                    </div>
                </div>
            </>
        );
    }

}