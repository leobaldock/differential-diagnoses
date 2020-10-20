import React, {useState, useEffect} from "react";
import TitleBar from "./TitleBar"
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import { Droppable, Draggable } from "react-beautiful-dnd";
import { SliderPicker } from "react-color";
import SnomedSearch from './SnomedSearch';
import TextareaAutosize from 'react-textarea-autosize';
import useLocalStorage from '../hooks/useLocalStorage';
import {
    faBars,
    faMinusCircle,
    faAngleDoubleRight,
    faAngleDoubleLeft,
    faComment,
    faCommentMedical,
    faTintSlash,
    faPlusSquare
} from '@fortawesome/free-solid-svg-icons'
import FAIButton from "./FAIButton";

/**
 * Represents the array structure of a differential diagnosis list as an easy
 * to use visual component.
 * 
 * Each list supports the user changing its background colour, adding rows,
 * deleting rows, rearranging list items (through drag-and-drop, editing the
 * list number, or using a 'transfer' button) and writing row-specific notes
 * that persist between rearranges
 * 
 * 
 * @param {*} title the title of the list
 * @param {*} colour the background colour of the list
 * @param {*} rows the array of list items
 * @param {*} addRow callback function to add a row to this list
 * @param {*} deleteRow callback function to delete a row from this list
 * @param {*} updateRowNumber callback function to update row number on rearrange
 * @param {*} droppableId react-beautiful-dnd identifier for this list container
 * @param {*} transfer callback function to transfer items between lists
 * @param {*} isLeft boolean to change button positions between left/right lists
 * @param {*} setSnomed callback function to create a new snomed object for a row
 * @param {*} setNote callback function to create a new note  for a row
 * @param {*} setNotesOpen boolean toggle to expand/collapse a user row note
 */
export default function List({title, colour, showColourPalette, rows, addRow, deleteRow, updateRowNumber, droppableId, transfer, isLeft, setSnomed, setNote, setNotesOpen}){

    //Use local storage to maintain list colour on page refresh
    const [listColour, setListColour] = useLocalStorage(`${isLeft ? "left" : "right"}_list_colour`, colour);
    //set custom list styling for react-beautiful-dnd
    const getListStyle = (snapshot) => {
        return {
            backgroundColor: snapshot.isDraggingOver ? "#00000020" : "",
            transition: "background-color 0.2s ease",
            padding: "0.5em",
            height: "calc(100% - 1em)" // account for padding
        }
    };
    //set custom list item styling for react-beautiful-dnd
    const getItemStyle = (draggableStyle, snapshot) => {
        // console.log(snapshot);
        return {
            userSelect: "none",
            padding: "0.5em",
            outline: "none",
            ...draggableStyle
        }
    };

    //define buttons to appear in TitleBar
    const listButtons = [
        <FAIButton
            key="add_new_diag_button"
            icon={faPlusSquare}
            title="Add New Diagnosis"
            onClick={addRow}
        />
    ];
    if (showColourPalette && listColour !== colour) {
        listButtons.unshift((
            <FAIButton
                key="reset_colour_button"
                icon={faTintSlash}
                title="Reset Colour"
                onClick={() => setListColour(colour)}
            />
        ));
    }

    return (
        <div className="list" style={{backgroundColor: listColour, color: listColour}}>
            <div onClick={(e) => e.stopPropagation()}>
                <TitleBar title={title} buttons={listButtons}/>
                {showColourPalette &&
                (
                    <div style={{background: "#00000060"}}>
                    <SliderPicker
                        color = {listColour}
                        onChange={(e) => setListColour(e.hex)}
                        styles = {{
                            default: {
                                hue: {
                                    height: '10px',
                                    width: '90%',
                                    margin: 'auto',
                                },
                            }
                        }}
                    />
                </div>
                )}
            </div>

            <div className="listRowContainer">
                <div className="listRowScroll">
                    <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                        <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        style={getListStyle(snapshot)}
                        >
                            {rows.map((row, index) => (
                                <Draggable key={row.id} draggableId={row.id.toString(10)} index={index}>   
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(provided.draggableProps.style, snapshot)}
                                        >
                                            <span>
                                                <ListRow
                                                    setSnomed={newSnomed => setSnomed(row, newSnomed)}
                                                    setNote={newNote => setNote(row, newNote)}
                                                    setNotesOpen={newIsNotesOpen => setNotesOpen(row, newIsNotesOpen)}
                                                    isNotesOpen={row.isNotesOpen}
                                                    content={row.snomed}
                                                    note={row.note}
                                                    rowNumber={index + 1}
                                                    listColour={listColour}
                                                    deleteRow={deleteRow}
                                                    updateRowNumber={updateRowNumber}
                                                    transfer={transfer}
                                                    isDuplicate={row.isDuplicate}
                                                    isLeft={snapshot.draggingOver == null ? isLeft : snapshot.draggingOver === "droppable1"}
                                                />
                                            </span>
                                        </div>
                                    )}
                                </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>    
            </div>
        </div>
    )
}

/**
 * Represents a list item (single diagnosis) from the array structure as a
 * row in the List parent component
 * 
 * Each listRow supports the user changing its deletion, rearranging list items
 * (through drag-and-drop, editing the list number, or using a 'transfer'
 * button) and writing row-specific notes that persist between rearranges.
 * 
 * @param {*} listColour the background colour of the list
 * @param {*} note the user inputted note
 * @param {*} content the user inputted diagnosis
 * @param {*} rowNumber the index of this row in the parent list
 * @param {*} deleteRow callback function to delete a row from this list
 * @param {*} updateRowNumber callback function to update row number on rearrange
 * @param {*} transfer callback function to transfer items between lists
 * @param {*} isLeft boolean to change button positions between left/right lists
 * @param {*} setSnomed callback function to create a new snomed object for a row
 * @param {*} setNote callback function to create a new note  for a row
 * @param {*} isNotesOpen boolean state of comment visibility
 * @param {*} setNotesOpen boolean toggle to expand/collapse a user row note
 */
function ListRow({listColour, note, content, rowNumber, deleteRow, updateRowNumber, transfer, isLeft, setSnomed, setNote, isNotesOpen, setNotesOpen, isDuplicate}) {
    // alert('' + isDuplicate)
    
    //state hook for user changing row number via editing the rows number
    const [inputNum, setInputNum] = useState(rowNumber);
    //event handlers for updating row number on input on an 'Enter' key
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            updateRowNumber(rowNumber - 1, inputNum - 1);
        }
    }
    //event handlers for updating row number on input on losing user focus
    const handleBlur = () => {
        updateRowNumber(rowNumber - 1, inputNum - 1);
    }
    useEffect(() => setInputNum(rowNumber), [rowNumber]);

    return (
        <div className="listRow">
            {!isLeft &&
                <div style={{marginRight: "1em"}} className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleLeft} />
                </div>
            }

            <div className="listNumber">
                <input
                    style={{color: "white", background: "#00000060"}}
                    value={inputNum} onChange={(e) => setInputNum(e.target.value.replace(/[^0-9]+/g, ''))}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    type="text"
                />
            </div>
            <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
                <div className="listEntry" style={{border: isDuplicate ? "solid 4px #ffce00" : "none"}}>
                    <FontAwesomeIcon style={{cursor: "grab"}} icon={faBars}/>
                    <span style={{flexGrow: 1, marginLeft: "1em", marginRight: "1em"}}>
                        <SnomedSearch content={content} callback={setSnomed} listColour={listColour} />
                    </span>
                    <div>
                        <FAIButton
                            color="grey"
                            hoverColor={listColour}
                            size="1x"
                            title={isNotesOpen ? "Hide Note" : "Show note"}
                            icon={note ? faComment : faCommentMedical}
                            onClick={() => setNotesOpen(!isNotesOpen)}
                        />
                        <FAIButton
                            color="grey"
                            hoverColor={listColour}
                            size="1x"
                            title="Delete Diagnosis"
                            style={{cursor: "pointer", paddingLeft:"0.5em"}}
                            icon={faMinusCircle}
                            onClick={() => deleteRow(rowNumber - 1)}
                        />
                    </div>
                </div>
                {isNotesOpen && <div className="note">
                    <TextareaAutosize onChange={e => setNote(e.target.value)} value={note} />
                </div>}
            </div>

            {isLeft &&
                <div className="transferButton" onClick={() => transfer(rowNumber - 1)}>
                    <FontAwesomeIcon icon={faAngleDoubleRight} />
                </div>
            }
        </div>
    )
}
