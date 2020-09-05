import React, {useState} from "react";
import TitleBar from "./TitleBar"
import List from "./List"
import "./Diagnoses.css";
import Popup from "./Popup";


export default function DifferentialDiagnosis(){
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
            <TitleBar title="Differential Diagnoses"/>
            <div class="listContainer">
                <List title="LIKELY DIAGNOSIS" colour="#5DAD89" rows={rows} addRow={addRow} deleteRow={deleteRow}/>
            </div>
        </div>
    )
}