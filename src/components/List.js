import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
    faPalette,
} from '@fortawesome/free-solid-svg-icons'
import { Droppable, Draggable } from "react-beautiful-dnd";


export default function List({title, colour, rows, addRow, deleteRow, updateRowNumber}){
    
    const listButtons = [
        <FontAwesomeIcon icon={faPalette} size="3x" style={{cursor: "pointer"}}/>
    ]

    const getListStyle = isDraggingOver => ({
        //background: isDraggingOver ? "lightblue" : "lightgrey",
        padding: "0.5em",
      });

    const getItemStyle = (isDragging, draggableStyle) => ({
        userSelect: "none",
        padding: "0.5em",
        //background: isDragging ? "lightgreen" : "grey",
        
        // styles we need to apply on draggables
        ...draggableStyle
    });

    return (
        <div class="list" style={{backgroundColor: colour, color: colour}}>
            <TitleBar title={title} buttons={listButtons}/>

            <div class="listRowContainer">
                <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    >
                        {rows.map((row, index) => (
                            <Draggable key={row.id} draggableId={row.id.toString(10)} index={index}>   
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}
                                    >
                                        <span>
                                            <ListRow content={row.displayName} rowNumber={index + 1} colour={colour} deleteRow={deleteRow} updateRowNumber={updateRowNumber}/>
                                        </span>
                                    </div>
                                )}
                            </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                <div class="addRowButton">
                    <span onClick={addRow}> + ADD NEW DIAGNOSIS </span>
                </div>
            
            </div>
        </div>
    )
}


function ListRow({colour, content, rowNumber, deleteRow, updateRowNumber}) {

    const [inputNum, setInputNum] = useState(rowNumber);

    const handleKeyDown = (e) => {
        if (e.key == "Enter") {
            updateRowNumber(rowNumber - 1, inputNum - 1);
        }
    }

    const handleBlur = () => {
        updateRowNumber(rowNumber - 1, inputNum - 1);
    }

    useEffect(() => setInputNum(rowNumber), [rowNumber]);

    return (
        <div class="listRow">
            <div class="listNumber">
                <input style={{color: colour}} value={inputNum} onChange={(e) => setInputNum(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleBlur} type="text"/>
            </div>
            <div class="listEntry">
                <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                <span style={{flexGrow: 1, marginLeft: "1em"}}> {content} </span>
                <FontAwesomeIcon onClick={() => deleteRow(rowNumber - 1)} style={{cursor: "pointer"}} color="grey" icon={faMinusCircle}/>
            </div>
            <div class="transferButton">
                <FontAwesomeIcon icon={faAngleDoubleRight} />
            </div>
        </div>
    )
}