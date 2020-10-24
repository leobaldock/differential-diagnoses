import {
  faGripfire, faJsSquare, faMarkdown
} from "@fortawesome/free-brands-svg-icons";
import {
  faComments as faCommentsRegular
} from "@fortawesome/free-regular-svg-icons";
import {
  faComments as faCommentsSolid,
  faCompressAlt,
  faDownload,
  faExpandAlt,
  faFilePdf,
  faPalette
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import equal from "deep-equal";
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import Sidebar from "react-sidebar";
import { CircleLoader } from "react-spinners";
import "../css/diagnoses.css";
import { withFHIR } from "../state/fhir";
import FAIButton from "./FAIButton";
import List from "./List";
import Popup from "./Popup";
import TitleBar from "./TitleBar";

/**
 * DifferentialDiagnosis is the top level component of the webapp (not
 * including FHIR wrappers). It handles most of the business logic, storing
 * lists in state.
 */
class DifferentialDiagnosis extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      listA: [
        // Each row/diagnosis should look something like this.
        // {
        //     id: "129842",
        //     snomed: {
        //        code: 1233,
        //        display: "cancer"
        //     },
        //     note: "",
        //     isNoteOpen: false
        // }
      ],
      listB: [],
      deletingRow: null, // [list, index]
      loading: this.props.FHIR.isEnabled,
      saving: false,
      showColourPalette: false,
      showSideBar: false,
    };

    // holds a snapshot of what the last saved state looked like
    this.lastSaveSnapshot = {
      listA: [],
      listB: []
    }

    // used for identifying each list
    this.id2List = {
      droppable1: "listA",
      droppable2: "listB",
    };

    // method bindings
    this.addRow = this.addRow.bind(this);
    this.deleteRow = this.deleteRow.bind(this);
    this.updateRowNumber = this.updateRowNumber.bind(this);
    this.reorder = this.reorder.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.getList = this.getList.bind(this);
    this.move = this.move.bind(this);
    this.manualMove = this.manualMove.bind(this);
    this.saveToFHIR = this.saveToFHIR.bind(this);
    this.getExportableObject = this.getExportableObject.bind(this);
    this.getMarkDown = this.getMarkDown.bind(this);
    this.getMarkDown2 = this.getMarkDown2.bind(this);
    this.getMenuContent = this.getMenuContent.bind(this);
    this.checkForDuplicates = this.checkForDuplicates.bind(this);
    this.requestSave = this.requestSave.bind(this);
    this.handleIncomingFHIR = this.handleIncomingFHIR.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    // we don't want to re-render if FHIR is enabled but there is no
    // episodeOfCare
    if (nextProps.FHIR.isEnabled && !nextProps.FHIR.episodeOfCare) return false;
    return true;
  }

  componentDidUpdate(prevProps) {

    // Handle incoming FHIR
    const { episodeOfCare } = this.props.FHIR;
    if (episodeOfCare && episodeOfCare.id !== prevProps.FHIR.episodeOfCare?.id) {
      if (episodeOfCare.diagnosis) {
        this.handleIncomingFHIR();
      } else {
        if (this.state.loading) this.setState({loading: false});
      }
    }

    // Handle auto-saving 
    const snapshot = {
      listA: this.state.listA,
      listB: this.state.listB
    }
    if (!this.state.saving && !equal(snapshot, this.lastSaveSnapshot)) {
      this.requestSave();
    }

    // Standalone mode
    if (prevProps.FHIR.isEnabled && !this.props.FHIR.isEnabled) {
      this.setState({ loading: false });
    }
  }

  /**
   * Takes incoming FHIR resources and maps them into a format that DiagnoSys
   * can use.
   */
  handleIncomingFHIR() {

    console.log("Loading Conditions from EP of care...")

    const { FHIR } = this.props;
    const { episodeOfCare } = FHIR;

    // Show loader
    this.setState({ loading: true });  

    // The episodeOfCare was updated and contains diagnoses, load the lists with
    // these diagnoses
    const newListA = [];
    const newListB = [];

    // To reduce queries, find all the conditions for this patient and then we
    // will filter them
    this.props.FHIR.searchResources("Condition", {
      patient: FHIR.makeRef(FHIR.patient),
    })
    .then((result) => {
      episodeOfCare.diagnosis.forEach((e, index) => {
        // Find the condition in the patient's list of conditions
        const condition = result.entry.find(
          (c) => c.fullUrl === `${FHIR.iss}/${e.condition.reference}`
        ).resource;

        let list = e.role.text === "Likely" ? newListA : newListB;
        list.splice(e.rank, 0, {
          id: index,
          note: "",
          snomed: {
            code: condition.code.coding[0].code,
            display: condition.code.coding[0].display,
          },
        });
      });

      this.lastSaveSnapshot = deepClone({listA: newListA, listB: newListB});
      this.setState({ listA: newListA, listB: newListB, loading: false });
    })
    .catch((err) => {
      console.error(err);
      this.setState({ loading: false });
    });
  }

  /**
   * Formats each list to support formatting them as student-interpretable notes
   */
  getExportableObject() {
    return {
      "Likely Diagnoses": this.state.listA.map((row) => ({
        Name: row.snomed && row.snomed.display ? row.snomed.display : "...",
        "SNOMED Code": row.snomed && row.snomed.code ? row.snomed.code : "...",
        "Note": row.note ? row.note : "..."
      })),
      "Critical Diagnoses": this.state.listB.map((row) => ({
        Name: row.snomed && row.snomed.display ? row.snomed.display : "...",
        "SNOMED Code": row.snomed && row.snomed.code ? row.snomed.code : "...",
        "Note": row.note ? row.note : "..."
      })),
      Metadata: {
        // bump this every time you change the format of the export.
        // that way we can handle imports properly.
        "Schema Version": 1,
      },
    };
  }

  /**
   * Creates a Markdown representation of the current DifferentialDiagnosis
   * lists.
   */
  getMarkDown() {
    const data = this.getExportableObject();

    let result = "";

    // title section
    result += "# DiagnoSys - *A Differential Diagnosis Tool*\n\n";
    result += "TODO: add logo image here\n\n\n";

    // critical
    result += "## Critical Diagnoses\n\n";
    result += "#| Diagnosis | SNOMED Code | Note\n";
    result += ":--- | :--- | :--- | :---\n";
    data["Critical Diagnoses"].forEach((diagnosis, index) => {
      result += `${index} | ${diagnosis.Name} | ${diagnosis["SNOMED Code"]} | ${diagnosis.Note}\n`;
    });
    result += "\n\n";

    // likely
    result += "## Likely Diagnoses\n\n";
    result += "#| Diagnosis | SNOMED Code | Note\n";
    result += ":--- | :--- | :--- | :---\n";
    data["Likely Diagnoses"].forEach((diagnosis, index) => {
      result += `${index} | ${diagnosis.Name} | ${diagnosis["SNOMED Code"]} | ${diagnosis.Note}\n`;
    });

    return result;
  }

  /**
   * Creates a Markdown representation of the current DifferentialDiagnosis
   * that is compatible with MD to PDF API.
   */
  getMarkDown2() {
    const data = this.getExportableObject();

    // fill blank rows if needed
    if (data["Critical Diagnoses"].length === 0) {
      data["Critical Diagnoses"].push({
        Name: "No Diagnoses Listed",
        "SNOMED Code": "",
        Note: "",
      });
    }
    if (data["Likely Diagnoses"].length === 0) {
      data["Likely Diagnoses"].push({
        Name: "No Diagnoses Listed",
        "SNOMED Code": "",
        Note: "",
      });
    }

    // construct JSON
    const json2md = require("json2md");
    const input = [
      { img: [{
        title: "DiagnoSys",
        source: "https://i.imgur.com/RCSYWAk.jpg"
      }]},
      { h1: "Likely Diagnoses".toUpperCase() },
      { table: {
        headers: [ "#", "Diagnosis", "SNOMED Code", "Note"],
        rows: data["Likely Diagnoses"].map((diagnosis, index) => ([
          index + 1, diagnosis.Name, diagnosis["SNOMED Code"], diagnosis.Note
        ]))
      }},
      { h1: "Critical Diagnoses".toUpperCase() },
      { table: {
        headers: [ "#", "Diagnosis", "SNOMED Code", "Note"],
        rows: data["Critical Diagnoses"].map((diagnosis, index) => ([
          index + 1, diagnosis.Name, diagnosis["SNOMED Code"], diagnosis.Note
        ]))
      }}
    ];

    return json2md(input);
  }

  componentWillUpdate() {
    this.checkForDuplicates();
  }

  /**
   * Checks both lists to see if there are any duplicate entries. Duplicate 
   * rows will have their isDuplicate property set to true, and all others 
   * will be set to false. Additionally, any rows without snomed data will also
   * have isDuplicate set to true.
   */
  checkForDuplicates() {
    const alreadyChecked = [];
    for(let list of [this.state.listA, this.state.listB]) {
      for(let row of list) {
        row.isDuplicate = false;
        const duplicate = alreadyChecked.find(otherRow => otherRow.snomed.code === row.snomed.code);
        if (!row.snomed.code || duplicate) {
          row.isDuplicate = true;
          if (duplicate) duplicate.isDuplicate = true;
        } 
        alreadyChecked.push(row);
      }
    }
  }

  /**
   * Adds a row, using the current time an arbitrary identifier, into a supplied
   * List. If the supplied list is not one of the two instantiated lists, the
   * function will print an error.
   *
   * @param {*} list an array representing a diagnosis list
   */
  addRow(list) {
    list.push({
      id: new Date().getTime(),
      snomed: {},
      note: "",
      isNotesOpen: false,
    });

    if (list === this.state.listA) this.setState({ listA: [...list] });
    else if (list === this.state.listB) this.setState({ listB: [...list] });
    else console.log("Unknown list");

  }

  /**
   *  Deletes the row at a specified index within a specified list array.
   *
   *  If the supplied list is not one of the two instantiated lists, the
   *  function will print an error.
   *
   * @param {*} list an array representing a diagnosis list.
   * @param {*} index the specified index in the list to remove
   */
  deleteRow(list, index) {
    list.splice(index, 1);

    let newState = {
      deletingRow: null,
    };

    if (list === this.state.listA) newState.listA = list;
    else if (list === this.state.listB) newState.listB = list;
    else console.log("Unknown list");

    this.setState(newState);
  }

  /**
   * Moves a list item into a specified index. If the specified index is
   * out-of-bounds, it will move into the minimum or maximum position. For
   * instance, calling the function to move an item to position -1 will instead
   * move it into the 0th index.
   * @param {*} startIndex the original index of the array item
   * @param {*} endIndex the desired index of the array item
   */
  updateRowNumber(startIndex, endIndex) {
    if (this.state.rows.length < 2) return;
    // Go to top of list
    if (endIndex < 0) endIndex = 0;
    // Go to bottom of list
    if (endIndex >= this.state.rows.length)
      endIndex = this.state.rows.length - 1;

    const result = this.reorder(this.state.rows, startIndex, endIndex);
    this.setState({
      rows: result,
    });
  }

  /**
   * Facilitates reordering the list when an item has its row number updated
   * @param {*} list an array representing a diagnosis list
   * @param {*} startIndex the original index of the array item
   * @param {*} endIndex the desired index of the array item
   */
  reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    if (list.length < 2) return result;
    // Go to top of list
    if (endIndex < 0) endIndex = 0;
    // Go to bottom of list
    if (endIndex >= list.length) endIndex = list.length - 1;

    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  }

  /**
   * Returns the name of the list tied to the supplied identifier
   * @param {*} id id of a 'droppable' container
   */
  getList(id) {
    return this.state[this.id2List[id]];
  }

  /**
   * Moves a list item into its opposing list as a specified index, used to
   * facilitate the existence of a manual 'transfer' button. Acts as a clickable
   * alternative to mouse drag-and-drop of list items.
   * @param {*} sourceList the current parent list of the list item
   * @param {*} destinationList the desired parent list of the list item
   * @param {*} sourceIndex the original index of the list item
   * @param {*} destinationIndex the desired index of the array item
   */
  manualMove(sourceList, destinationList, sourceIndex, destinationIndex) {
    const sourceClone = Array.from(sourceList);
    const destClone = Array.from(destinationList);
    const [removed] = sourceClone.splice(sourceIndex, 1);

    destClone.splice(destinationIndex, 0, removed);

    let newState = {};

    if (sourceList === this.state.listA) newState.listA = sourceClone;
    else if (sourceList === this.state.listB) newState.listB = sourceClone;
    else console.log("Unknown List");

    if (destinationList === this.state.listA) newState.listA = destClone;
    else if (destinationList === this.state.listB) newState.listB = destClone;
    else console.log("Unkown List");

    this.setState(newState);
  }

  /**
   * Facilitates  moving a list item to a different list once a drag-and-drop
   * interaction has occurred.
   *
   * @param {*} sourceList the current parent list of the list item
   * @param {*} destinationList the desired parent list of the list item
   * @param {*} droppableSource  react-beautiful-dnd <Droppable/>
   *                              sourcecontainer
   * @param {*} droppableDestination react-beautiful-dnd <Droppable/>
   *                                  destination container
   */
  move(sourceList, destinationList, droppableSource, droppableDestination) {
    const sourceClone = Array.from(sourceList);
    const destClone = Array.from(destinationList);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  }

  /**
   * Used by react-beautiful-dnd to facilitate the drag-and-drop interaction.
   * Prevents dropping an item out of a valid container, and calls appropriate
   * functions to rearrange list contents depending on the dropped location.
   *
   * @param {*} result representation of dragged items source container and
   * destination container
   */
  onDragEnd(result) {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const list = this.getList(source.droppableId);
      const items = this.reorder(list, source.index, destination.index);

      if (list === this.state.listA) this.setState({ listA: items });
      else if (list === this.state.listB) this.setState({ listB: items });
      else console.log("Unknown list");
    } else {
      const result = this.move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
      );

      this.setState({
        listA: result.droppable1,
        listB: result.droppable2,
      });
    }
  }

  /**
   * Makes a request to save the lists to the FHIR server. When called, a 5
   * second delay is kicked off before the save actually happens. If another
   * call to requestSave happens before the timeout, the delay is reset.
   */
  requestSave() {
    if (!this.state.isUnsaved) this.setState({isUnsaved: true});
    if (this.saveBackoff) {
      clearTimeout(this.saveBackoff);
    }
    this.saveBackoff = setTimeout(() => {
      this.saveToFHIR();
      this.setState({isUnsaved: false});
    }, 5 * 1000);
  }

  /**
   * An asynchronous function to create the appropriate FHIR resource
   * representation of the Differential Diagnosis lists.
   */
  async saveToFHIR() {
    console.log("Saving to FHIR...")

    const { FHIR } = this.props;

    const snapshot = {listA: this.state.listA, listB: this.state.listB}
    this.lastSaveSnapshot = deepClone(snapshot);
    this.setState({ saving: true });

    const likelyDiagnoses = await this.createDiagnosisList(
      this.state.listA,
      "Likely"
    );

    const criticalDiagnoses = await this.createDiagnosisList(
      this.state.listB,
      "Critical"
    );

    const diagnosis = likelyDiagnoses.concat(criticalDiagnoses);

    const episodeOfCare = await FHIR.updateResource(
      `EpisodeOfCare/${FHIR.episodeOfCare.id}`,
      {
        resourceType: "EpisodeOfCare",
        id: FHIR.episodeOfCare.id,
        status: "active",
        patient: { reference: FHIR.makeRef(FHIR.patient) },
        diagnosis,
      }
    );

    console.log("New EP of care");

    FHIR.setEpisodeOfCare(episodeOfCare);
    this.setState({ saving: false });
  }

  /**
   * Creates the appropriate FHIR Condition resources for each item in a
   * supplied list
   * @param {*} list an array representing a diagnosis list
   * @param {*} role used to identify the 'Likely' or 'Need to Rule Out'
   *                  diagnosis list
   */
  async createDiagnosisList(list, role) {
    const { FHIR } = this.props;
    return await Promise.all(
      list.map(async (e, index) => {
        // Create a condition for each item in the list
        const resource = await FHIR.createResource("Condition", {
          resourceType: "Condition",
          subject: { reference: FHIR.makeRef(FHIR.patient) },
          verificationStatus: "differential",
          code: {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: e.snomed.code,
                display: e.snomed.display,
              },
            ],
            text: e.snomed.display,
          },
        });

        return {
          condition: { reference: FHIR.makeRef(resource) },
          role: { text: role },
          rank: index + 1,
        };
      })
    );
  }

  /**
   * Defines an expandable sidebar to show export options for a student to save
   * their diagnosis list for future reference
   */
  getMenuContent() {
    let buttons = [];
    switch (this.state.showSideBar) {
      case "export":
        buttons = [
          {
            name: "Export as JSON",
            content: (
              <FontAwesomeIcon color="black" size="2x" icon={faJsSquare} />
            ),
            onClick: () => {
              downloadObjectAsJson(
                this.getExportableObject(),
                "DiagnoSys Export"
              );
              this.setState({ showSideBar: false });
            },
          },
          {
            name: "Export as Markdown",
            content: (
              <FontAwesomeIcon color="black" icon={faMarkdown} size="2x" />
            ),
            onClick: () => {
              downloadStringAsTextFile(
                this.getMarkDown(),
                "DiagnoSys Export.md"
              );
              this.setState({ showSideBar: false });
            },
          },
          {
            name: "Export as Pdf",
            content: (
              <FontAwesomeIcon color="black" icon={faFilePdf} size="2x" />
            ),
            onClick: () => {
              downloadMDAsPDF(this.getMarkDown2(), "DiagnoSys Export.pdf");
              this.setState({ showSideBar: false });
            },
          },
        ];
        break;
      default:
        buttons = [];
      // case "other menu type":
    }

    return (
      <div className="sidebar">
        {buttons.map((button) => (
          <div
            className="sidebarItem"
            key={button.name}
            onClick={button.onClick}
          >
            <div className="sidebarItemIcon">{button.content}</div>
            <p>{button.name}</p>
          </div>
        ))}
      </div>
    );
  }

  /**
   * Adds a loading spinner
   */
  renderLoading() {
    return (
      <div className="loading">
        <CircleLoader size={100} color="#FFFFFF" />
      </div>
    );
  }

  /**
   * Changes the FHIR symbol based on saved state. If the app is running in 
   * standalone mode (no FHIR), then null is returned. If there are unsaved
   * changes then a red flame is returned. If changes are currently being saved
   * to the server, a yellow flame is returned. And if everything is saved, then
   * a green flame is returned.
   */
  renderSave() {
    if (!this.props.FHIR.isEnabled) return null;

    const { saving, isUnsaved } = this.state;

    if (saving) return <FontAwesomeIcon key="save_icon" size="2x" icon={faGripfire} title="Saving to FHIR server" color="#ffce00" />;
    if (isUnsaved) return <FAIButton key="save_button" icon={faGripfire} title="Save changes FHIR server" color="#da7676" onClick={this.saveToFHIR}/>;
    return <FontAwesomeIcon key="save_icon" size="2x" icon={faGripfire} title="Changes are saved to the FHIR server" color="#5dad89" />;
  }

  render() {
    if (this.state.loading) {
      return this.renderLoading();
    }
    
    const isFullScreen = !!document.fullscreenElement;

    const areAllCommentsOpen =
      this.state.listA.every((row) => row.isNotesOpen) &&
      this.state.listB.every((row) => row.isNotesOpen);

    const pageTitleButtons = [
      this.renderSave(),
      <FAIButton
        key="toggle_comments_button"
        icon={areAllCommentsOpen ? faCommentsRegular : faCommentsSolid}
        title={areAllCommentsOpen ? "Hide all notes" : "Show all notes"}
        onClick={() =>
          this.setState((prevState) => ({
            listA: prevState.listA.map((row) => ({
              ...row,
              isNotesOpen: !areAllCommentsOpen,
            })),
            listB: prevState.listB.map((row) => ({
              ...row,
              isNotesOpen: !areAllCommentsOpen,
            })),
          }))
        }
      />,
      <FAIButton
        key="toggle_colour_palette_button"
        icon={faPalette}
        onClick={() =>
          this.setState({ showColourPalette: !this.state.showColourPalette })
        }
        title={this.state.showColourPalette
            ? "Hide colour editor"
            : "Show colour editor"
        }
      />,
      <FAIButton
        key="export_button"
        icon={faDownload}
        title="Export"
        onClick={() => this.setState({ showSideBar: "export" })}
      />,
      <FAIButton
        key="toggle_fullscreen_button"
        icon={isFullScreen ? faCompressAlt : faExpandAlt}
        onClick={() => {
          toggleFullScreen();
          setTimeout(() => this.forceUpdate(), 100);
        }}
        title={isFullScreen ? "Collapse" : "Expand"}
      />
    ];

    return (
      <Sidebar
        sidebar={this.getMenuContent()}
        open={!!this.state.showSideBar}
        onSetOpen={(open) => this.setState({ showSideBar: open })}
        styles={{ sidebar: { background: "white" } }}
        touch={false}
        pullRight={true}
      >
        <div
          onClick={() => {
            if (this.state.showColourPalette) {
              this.setState({ showColourPalette: false });
            }
          }}
          style={{
            height: "100vh",
            padding: 0,
            margin: 0,
            maxHeight: "100vh",
            width: "100w",
            maxWidth: "100vw",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#404040",
          }}
        >
          <TitleBar
            showLogo
            buttons={pageTitleButtons}
            backgroundColor="#343434"
          />

          <div className="listContainer">
            <DragDropContext onDragEnd={this.onDragEnd}>
              <List
                title="Likely Diagnoses"
                colour="#5DAD89"
                showColourPalette={this.state.showColourPalette}
                droppableId="droppable1"
                rows={this.state.listA}
                addRow={() => this.addRow(this.state.listA)}
                deleteRow={(index) => {
                  if (this.state.listA[index].snomed.code) {
                    this.setState({ deletingRow: [this.state.listA, index] });
                  } else {
                    this.deleteRow(this.state.listA, index);
                  }
                }}
                updateRowNumber={(from, to) =>
                  this.setState({
                    listA: this.reorder(this.state.listA, from, to),
                  })
                }
                transfer={(index) =>
                  this.manualMove(this.state.listA, this.state.listB, index, 0)
                }
                setSnomed={(row, newSnomed) => {
                  row.snomed = newSnomed;
                  this.setState({ listA: [...this.state.listA] });
                }}
                setNote={(row, newNote) => {
                  row.note = newNote;
                  this.setState({ listA: [...this.state.listA] });
                }}
                setNotesOpen={(row, isNotesOpen) => {
                  row.isNotesOpen = isNotesOpen;
                  this.setState({ listA: [...this.state.listA] });
                }}
                isLeft={true}
              />

              <List
                title="Critical"
                colour="#DA7676"
                showColourPalette={this.state.showColourPalette}
                droppableId="droppable2"
                rows={this.state.listB}
                addRow={() => this.addRow(this.state.listB)}
                deleteRow={(index) => {
                  if (this.state.listB[index].snomed.code) {
                    this.setState({ deletingRow: [this.state.listB, index] });
                  } else {
                    this.deleteRow(this.state.listB, index);
                  }
                }}
                updateRowNumber={(from, to) =>
                  this.setState({
                    listB: this.reorder(this.state.listB, from, to),
                  })
                }
                transfer={(index) =>
                  this.manualMove(this.state.listB, this.state.listA, index, 0)
                }
                setSnomed={(row, newSnomed) => {
                  row.snomed = newSnomed;
                  this.setState({ listB: [...this.state.listB] });
                }}
                setNote={(row, newNote) => {
                  row.note = newNote;
                  this.setState({ listB: [...this.state.listB] });
                }}
                setNotesOpen={(row, isNotesOpen) => {
                  row.isNotesOpen = isNotesOpen;
                  this.setState({ listB: [...this.state.listB] });
                }}
                isLeft={false}
              />
            </DragDropContext>
          </div>

          {this.state.deletingRow && (
            <Popup
              title="Are you sure you want to delete this diagnosis?"
              yesCallback={() => this.deleteRow(...this.state.deletingRow)}
              noCallback={() => this.setState({ deletingRow: null })}
            >
              {
                this.state.deletingRow[0][this.state.deletingRow[1]].snomed
                  .display
              }
            </Popup>
          )}
        </div>
      </Sidebar>
    );
  }
}

/**
 * Accepts markdown as input and uses an external API to convert it into a PDF
 * blob before opening the output in a new browser tab.
 * @param {*} markdown input
 */
async function downloadMDAsPDF(markdown) {
  // input markdown
  const mdBlob = new Blob([markdown], { type: "text/markdown" });
  const mdFile = new File([mdBlob], "input.md");

  // css styling
  const cssRes = await fetch("/pdf.css");
  const cssBlob = await cssRes.blob();
  const cssFile = new File([cssBlob], "stylesheet.css");

  const formData = new FormData();
  formData.append("input_files[]", mdFile);
  formData.append("from", "markdown");
  formData.append("to", "pdf");
  formData.append("css", "stylesheet.css");
  formData.append("other_files[]", cssFile);

  const res = await fetch(
    "https://cors-anywhere.herokuapp.com/http://c.docverter.com/convert",
    {
      // a bit of a hack to get around the cors issues for now...
      method: "POST",
      body: formData,
    }
  );

  // TODO: check response status code
  const outputBlob = await res.blob();
  window.open(URL.createObjectURL(outputBlob));
}

/**
 * Converts Differential Diagnosis Lists to exportable JSON representation
 * @param {*} exportObj exportable representation of lists
 * @param {*} exportName desired name of exported JSON file
 */
function downloadObjectAsJson(exportObj, exportName) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj, null, 2));
  doDownload(dataStr, exportName + ".json");
}

/**
 * Downloads a ‘.txt’ file containing the input string.
 * @param {*} string input
 * @param {*} fileName output filename
 */
function downloadStringAsTextFile(string, fileName) {
  var dataString =
    "data:text/plain;charset=utf-8," + encodeURIComponent(string);
  doDownload(dataString, fileName);
}

/**
 * A helper function for downloading files. 
 * @param {*} dataString base64 data string to be downloaded
 * @param {*} fileName the output filename
 */
function doDownload(dataString, fileName) {
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataString);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function toggleFullScreen() {

  const isFullScreen = !!document.fullscreenElement;
  const element = isFullScreen ? document : document.documentElement;

  let requestMethod = null;
  if (isFullScreen) {
    // collapse
    requestMethod = document.exitFullscreen || document.webkitExitFullscreen
      || document.mozCancelFullScreen || document.msExitFullscreen;
  } else {
    // go full screen
    requestMethod = element.requestFullScreen|| element.webkitRequestFullScreen
      || element.mozRequestFullScreen || element.msRequestFullScreen;
  }

  if (requestMethod) requestMethod.call(element);
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default withFHIR(DifferentialDiagnosis);