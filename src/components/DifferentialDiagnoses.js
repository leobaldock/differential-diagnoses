import React, {useState} from "react";
import TitleBar from "./TitleBar"
import List from "./List"
import "./Diagnoses.css";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faSave,
    faEye,
} from '@fortawesome/free-solid-svg-icons'




export default function DifferentialDiagnosis(){
    const pageTitleButtons = [
        <FontAwesomeIcon icon={faSave} size="3x" style={{cursor: "pointer"}}/>,
        <FontAwesomeIcon icon={faEye} size="3x" style={{cursor: "pointer"}}/>,
    ]

    const [rows, setRows] = useState([]);

    const addRow = () => {
        rows.push("Sample" + rows.length);
        setRows([...rows]);
    }

    const deleteRow = (index) => {
        rows.splice(index, 1);
        setRows([...rows]);
    }

    return (
        <div>
            <TitleBar title="Differential Diagnoses" buttons={pageTitleButtons}/>
            <div class="listContainer">
                <List title="LIKELY DIAGNOSIS" colour="#5DAD89" rows={rows} addRow={addRow} deleteRow={deleteRow}/>
            </div>
        </div>
    )
}