
import React from 'react';
import AsyncSelect from 'react-select/async';

const search = async (searchTerm) => {

    var searchResults = [];

    try {
        const url = `https://ontoserver.csiro.au/stu3-latest/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=ecl/%3C%3C64572001&filter=${searchTerm}&count=10`;
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
            snomedValue: {}
        }

        // this.backOff = null;

        // this.handleSearchChange = this.handleSearchChange.bind(this);
    }



    // handleSearchChange(e) {
    //     const searchTerm = e.target.value;

    //     if (this.backOff) clearTimeout(this.backOff);
    //     setTimeout(async () => this.setState({searchResults: await search(searchTerm, 5)}), 300);
        
    //     this.setState({searchTerm: searchTerm});
    // }

    render() {
        const options = this.state.searchResults.map(result => ({
            label: result.display,
            value: result.code
        }));

        return (
            <div>
                <AsyncSelect
                    placeholder="Type to search..."
                    cacheOptions
                    loadOptions={search}
                    className          
                />
                {/* <DropDown
                    options={options}
                    value={this.state.snomedValue.code}
                    onChange={(option) => this.setState({snomedValue: this.state.searchResults.find(result => result.code == option.value)})}
                    placeholder={<input 
                        value={this.state.searchTerm}
                        readOnly={false}
                        onChange={(e) => console.log(e) || this.handleSearchChange}
                    />}
                /> */}
            </div>
        );
    }

}