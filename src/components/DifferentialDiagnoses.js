import React from "react";
import TitleBar from "./TitleBar";
import List from "./List";
import "./Diagnoses.css";
import Popup from "./Popup";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faSave,
    faEye,
} from '@fortawesome/free-solid-svg-icons';
import { DragDropContext } from "react-beautiful-dnd";


// TODO: get multiple lists working. Use this as a guide: https://codesandbox.io/s/ql08j35j3q?file=/index.js

class DifferentialDiagnosis extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            rows: [
                // Each row/diagnosis should look something like this.
                // We'll probably add more when we get FIHR resource integrated

                // {
                //     id: "129842",
                //     displayName: "Cancer",
                //     note: ""
                // }
            ],
            deletingRow: null
        }

        this.addRow = this.addRow.bind(this);
        this.deleteRow = this.deleteRow.bind(this);
        this.updateRowNumber = this.updateRowNumber.bind(this);
        this.reorder = this.reorder.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
    }

    addRow() {
        this.state.rows.push({
            id: new Date().getTime(),
            displayName: "Sample" + this.state.rows.length,
            note: ""
        });
        this.setState({
            rows: [...this.state.rows]
        });
    }

    deleteRow(index) {
        this.state.rows.splice(index, 1);
        this.setState({
            rows: [...this.state.rows],
            deletingRow: null
        });
    }

    updateRowNumber(from, to) {
        if (this.state.rows.length < 2) return;
        // Go to top of list
        if (to < 0) to = 0;
        // Go to bottom of list
        if (to >= this.state.rows.length) to = this.state.rows.length - 1;

        const result = this.reorder(this.state.rows, from, to);
        this.setState({
            rows: result
        });
    }

    // a little function to help us with reordering the result
    reorder(list, startIndex, endIndex) {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
    
        const items = this.reorder(
            this.state.rows,
            result.source.index,
            result.destination.index
        );
    
        this.setState({
            rows: items
        });
      }

    render() {

        const pageTitleButtons = [
            <FontAwesomeIcon icon={faSave} size="3x" style={{cursor: "pointer"}}/>,
            <FontAwesomeIcon icon={faEye} size="3x" style={{cursor: "pointer"}}/>,
        ]

        return (
            <>
                <TitleBar title="Differential Diagnoses" buttons={pageTitleButtons}/>
                <div className="listContainer">
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <List
                            title="Likely Diagnoses"
                            colour="#5DAD89"
                            rows={this.state.rows}
                            addRow={this.addRow}
                            deleteRow={(index) => this.setState({deletingRow: index})}
                            updateRowNumber={this.updateRowNumber}
                            />
                    </DragDropContext>
                </div>

                {(this.state.deletingRow || this.state.deletingRow == 0) &&
                    <Popup
                        title="Are you sure you want to delete this diagnosis?"
                        yesCallback={() => this.deleteRow(this.state.deletingRow)}
                        noCallback={() => this.setState({deletingRow: null})}
                    >
                        {this.state.rows[this.state.deletingRow].displayName}
                    </Popup>}
            </>
        );
    }   
}

export default DifferentialDiagnosis;