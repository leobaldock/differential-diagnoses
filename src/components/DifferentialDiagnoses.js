import React, {useState} from "react";
import TitleBar from "./TitleBar";
import List from "./List";
import "./Diagnoses.css";
import Popup from "./Popup";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faSave,
    faEye,
} from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


export default function DifferentialDiagnosis(){
    const pageTitleButtons = [
        <FontAwesomeIcon icon={faSave} size="3x" style={{cursor: "pointer"}}/>,
        <FontAwesomeIcon icon={faEye} size="3x" style={{cursor: "pointer"}}/>,
    ]

    const [rows, setRows] = useState([]);
    const [deletingRow, setDeletingRow] = useState(null);

    const addRow = () => {
        rows.push("Sample" + rows.length);
        setRows([...rows]);
    }

    const deleteRow = (index) => {
        rows.splice(index, 1);
        setRows([...rows]);
        setDeletingRow(null);
    }

    const updateRowNumber = (from, to) => {

        if (rows.length < 2) return;

        // Go to top of list
        if (to < 0) to = 0;

        // Go to bottom of list
        if (to >= rows.length) to = rows.length - 1;

        const result = reorder(rows, from, to);
        setRows(result);
    }

    // a little function to help us with reordering the result
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
    
        return result;
    };

    const onDragEnd = (result) => {
        // dropped outside the list
        if (!result.destination) {
          return;
        }
    
        const items = reorder(
          rows,
          result.source.index,
          result.destination.index
        );
    
        setRows(items);
      }

    return (
        <>
            <TitleBar title="Differential Diagnoses" buttons={pageTitleButtons}/>
            <div class="listContainer">
                <DragDropContext onDragEnd={onDragEnd}>
                    <List title="LIKELY DIAGNOSIS" colour="#5DAD89" rows={rows} addRow={addRow} deleteRow={setDeletingRow} updateRowNumber={updateRowNumber}/>
                </DragDropContext>
            </div>

            {(deletingRow || deletingRow == 0) &&
                <Popup
                    title="Are you sure you want to delete this diagnosis?"
                    yesCallback={() => deleteRow(deletingRow)}
                    noCallback={() => setDeletingRow(null)}
                >
                    {rows[deletingRow]}
                </Popup>}
        </>
    );
}