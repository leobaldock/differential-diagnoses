
import React from 'react';
import AsyncSelect from 'react-select/async';
import { createRef } from 'react';

const search = async (searchTerm) => {

    var searchResults = [];

    try {
        const url = `https://ontoserver.csiro.au/stu3-latest/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/%3C%3C64572001&filter=${searchTerm}&count=10`;
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

export default class SnomedSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isFocused: false,
            snomedValue: this.props.content,
            closeButtonColour: "#808080"
        }

        this.asyncSelect = createRef(null);
        
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyPress);
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
                minWidth: state.isFocused ? "20em" : 0
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
                backgroundColor: "#303030A0",
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
        if (this.props.content.code) valueProp.value = {label: this.state.snomedValue?.display, value: this.state.snomedValue?.code};

        return (
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
                    // hacks.. beware...
                    onMouseDown={(e) => {if(!this.state.isFocused) {this.asyncSelect.current.blur()}}}
                    onMouseUp={(e) => {if(!this.state.isFocused && !this.isClosing) {this.asyncSelect.current.focus()}}}
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
                        onBlur={() => this.setState({isFocused: false})}
                        placeholder= {"Search..."}
                        cacheOptions
                        loadOptions={search}
                        onInputChange={(inputValue, {action}) => {
                            if (action === 'input-change') {
                                this.setState({snomedValue: {code: inputValue.value, display: inputValue.label}});
                            }
                        }}
                        onChange={async (inputValue, data) => {
                            await this.setState({snomedValue: {code: inputValue.value, display: inputValue.label}});
                            this.props.callback({code: inputValue.value, display: inputValue.label});
                            this.asyncSelect.current.blur();
                        }}
                    />
                </div>
            </div>
        );
    }

}