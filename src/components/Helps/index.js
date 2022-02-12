import React from 'react';
import {
  Tab, Tabs, TabList, TabPanel,
} from 'react-tabs';
import { ReactComponent as CloseSvg } from '../../assets/images/icons/close.svg';
import Button from '../form/Button';
import 'react-tabs/style/react-tabs.css';
import HelpLeftSvg from '../../assets/images/helpleft.svg';
import Mapsgoogle from '../../assets/images/help/Map.png';
import Wiki from '../../assets/images/help/Wiki.png';
import Linkedin from '../../assets/images/help/Linkdin.png';
import MinScince from '../../assets/images/help/Mind.png';
import FindNode from '../../assets/images/help/Find.png';
import LinkNode from '../../assets/images/help/Linknode.png';
import Label from '../../assets/images/help/Label.png';
import Folder from '../../assets/images/help/Folder.png';
import Export from '../../assets/images/help/Export.png';
import Import from '../../assets/images/help/ImportData.png';
import Compare from '../../assets/images/help/Compare.png';
import CompareNode from '../../assets/images/help/CompareNodes.png';
import ShareGraph from '../../assets/images/help/ShareGraph.png';
import Search from '../../assets/images/help/Search.png';
import Filter from '../../assets/images/help/Filter.png';
import Media from '../../assets/images/help/Media.png';
import Analyses from '../../assets/images/help/Analyses.png';
import Explore from '../../assets/images/help/Explore.png';
import Crop from '../../assets/images/help/Crop.png';
import GraphEdit from '../../assets/images/help/GraphEdit.png';
import { useHistory } from 'react-router-dom';

import Outside from '../Outside';
import Modal from 'react-modal';
import Utils from '../../helpers/Utils';

export default (props) => {
  const history = useHistory();
  const path = history.location.pathname;
  // const graphIdParam = Utils.getGraphIdFormUrl();
  const homeHelp = !(path === '/graphs/update/');
  React.useEffect(() => {
  }, []);
  const handleClose = () => {
    props.closeModal();
  };
  return (
    <Outside
      exclude=".help"
      onClick={handleClose}
    >
      <Modal
        className={homeHelp ? 'helpHomePages' : 'ghModalHelps'}
        overlayClassName="ghModalOverlay"
        isOpen
      >
        <div className="help">
          <Tabs>
            <div className="triangle-right" />
            <div className="helpName">
              <TabList style={{ zIndex: 9999 }}>
                <h1>Help</h1>
                <Tab>
                  <h4 className="helpTitlePages">Video tutorial</h4>
                </Tab>
                <h3 className="helpTitle">Graphs</h3>
                <Tab>Create and edit a graph</Tab>
                <Tab>Import a Graph</Tab>
                <Tab>Export a Graph</Tab>
                <Tab>Compare Graphs </Tab>
                <Tab>Compare Labels/Folders of different graphs</Tab>
                <Tab>Share a Graph </Tab>
                <Tab>Select and Crop a Graph</Tab>
                <h3 className="helpTitle">Create Node</h3>
                <Tab>
                  <li>New node</li>
                </Tab>
                <Tab>Create Node via Google Map</Tab>
                <Tab>Create Node via Wikipedia</Tab>
                <Tab>Create Node by Linkedin </Tab>
                <Tab>Create Node by Science Mind </Tab>
                <Tab>Find Node</Tab>
                <h3 className="helpTitle">Lables and Folders</h3>
                <Tab> Create Label</Tab>
                <Tab> Craete Folder</Tab>
                <Tab>
                  <h4 className="helpTitlePages">link the Nodes</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Explore</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Search</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Filter</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Media</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Analysis</h4>
                </Tab>
                <Tab>
                  <h4 className="helpTitlePages">Hotkeys</h4>
                </Tab>
              </TabList>
            </div>
            <div>
              <Button
                color="transparent"
                className="btn-close "
                icon={<CloseSvg />}
                onClick={handleClose}
              />
            </div>
            <div className="color-border" />
            <TabPanel>
              <div>
                <iframe
                  width="1280"
                  height="720"
                  className="help_img"
                  src="https://www.youtube.com/embed/goi8Hbn6hfU"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={GraphEdit} className="help_img" alt="" />
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="marg_graph_text">• Create a Graph</p>
                  <ol>
                    <li>
                      •	Go to

                      <span>Home</span>

                      page of your account
                    </li>
                    <li>
                      •	Click

                      <span>+ Create a Graph</span>

                      or click

                      <span>Create a Graph</span>

                      at the top of the page
                    </li>
                    <li>
                      •	Type the

                      <span>Name</span>

                      of the graph
                    </li>
                    <li>
                      •	Type a short

                      <span>Description</span>

                    </li>
                    <li>
                      •	Click

                      <span>Create</span>

                      This large field is your canvas.

                    </li>

                  </ol>
                  <p className="help_node_text">
                    Create a graph by

                    <span> Select </span>

                    tool.
                    See

                    <span> Select and Crop a graph </span>

                    (active link)
                  </p>
                </div>
                <div className="help_text">
                  <p className="marg_graph_text">• Edit a graph </p>
                  <ol>
                    <li>
                      •	At the top of the canvas click the

                      <span>Name</span>

                      of the opened graph and see the last 3 graphs you worked on. For quick access click one of them

                    </li>
                    <li>
                      <span>•	Search</span>

                      a graph by the name
                    </li>
                    <li>
                      •	Create a

                      <span>New Graph</span>
                    </li>
                    <li>
                      •	Save existing graph as a

                      <span>Template</span>
                    </li>
                    <li>
                      •	Click
                      <span>(Edit)</span>

                      the current graph

                    </li>
                    <li>•	Upload a cover photo from your PC</li>
                    <li>
                      •	View the

                      <span>Owner</span>

                      name,
                      the creation and the last modification dates

                    </li>
                    <li>
                      •	Edit or add a

                      <span>Description</span>
                    </li>
                    <li>
                      •	Click

                      <span>Save</span>

                      modifications
                    </li>
                    <li>
                      •	Click

                      <span>Delete </span>
                      the graph

                    </li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Import} className="help_img" alt="" />
              </div>
              <div>
                <p>Import a graph</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>

                    <li>
                      • Go to

                      <span>Home</span>

                      page of your account
                    </li>
                    <li>
                      •	Click

                      <span>+ Create a graph</span>

                      or click

                      <span>Create a graph</span>

                      at the top of the page
                    </li>
                    <li>
                      •	Type the

                      <span>Name </span>
                      of the graph
                    </li>
                    <li>
                      •	Type a short

                      <span>Description</span>

                    </li>
                    <li>
                      •	Click

                      <span>Create</span>
                    </li>
                    <li>
                      •	Click

                      <span>Import Data</span>

                      in the main menu
                    </li>
                    <li>
                      •	Choose Import Data

                      <span>file type.</span>

                      Use the Template to import data
                    </li>
                    <li>
                      •
                      <span> Select</span>

                      a file from your PC
                    </li>
                    <li>
                      •	Click

                      <span>Next</span>
                    </li>
                    <li>
                      •	Click

                      <span>Import</span>
                    </li>
                    <p className="exploreTitle">	The program automatically creates a graph. </p>

                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Export} className="help_img" alt="" />
              </div>
              <div>
                <p>Export a graph</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="marg_graph_text">
                    The Data sheet is the detailed
                    summary of your graph.
                    Here you can find all
                    listed information about:
                  </p>
                  <li> Types and quantity of nodes</li>
                  <li> Types and quantity of links</li>
                </div>
                <div className="help_text">
                  <p className="marg_graph_text">
                    You  can
                    <span> Export </span>
                    the graph in the following forms:
                  </p>
                  <ol>
                    <li>•	ZIP (use this format to fully backup the graph) </li>
                    <li>•	PNG</li>
                    <li>•	PDF</li>
                    <li>•	Excel </li>

                    <p className="exploreTitle">
                      Export a part of a graph using the
                      <span> Crop </span>
                      tool. See
                      <span> Select and Crop a graph (active link)</span>
                    </p>
                  </ol>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <div>
                <img src={Compare} className="help_img" alt="" />
              </div>
              <div>
                <p>Compare graphs</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="marg_graph_text">
                    You can compare two graphs and find similar nodes:
                  </p>
                  <ol>
                    <li>
                      •	On the Homepage click
                      {' '}
                      <span>Compare graphs</span>
                      {' '}
                    </li>
                    <li>•	Select the 1st graph</li>
                    <li>
                      •	Select the 2nd graph

                    </li>
                  </ol>
                  <p className="help_node_text">
                    * The system will automatically compare the graphs and show all similar and different nodes.
                  </p>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={CompareNode} className="help_img" alt="" />
              </div>
              <div>
                <p>
                  Compare Labels/Folders of different graphs
                </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>•	Right-click the Label/Folder of the 1st graph</li>
                    <li>•	Click Copy</li>
                    <li>•	Open the 2nd graph</li>
                    <li>•	Right-click anywhere on the canvas</li>
                    <li>•	Choose Paste Embedded to paste the Label/Folder as a photo in this graph</li>
                    <li>•	Choose Paste Append to paste the Label/Folder as a Label/Folder with all nodes and functions in this graph</li>

                  </ol>
                  <p className="help_node_text">
                    The program automatically compares the nodes
                    of the Label/Folder with the nodes of the
                    2nd graph and finds similar nodes.
                    Then, you should choose one of the
                    following options:
                  </p>
                </div>
                <div className="help_text">
                  <ol>
                    <li><span>•	Compare nodes</span></li>
                    <li><span>•	Merge nodes</span></li>
                    <li><span>•	Skip these nodes</span></li>
                    <li><span>•	Replace the nodes in the destination</span></li>
                    <li><span>•	Keep both</span></li>

                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>

              <div>
                <img src={ShareGraph} className="help_img" alt="" />
              </div>
              <div>
                <p>Share a graph </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>

                    <p className="exploreTitle">Share a graph with Collaborators having Araks profiles. Search collaborators by username or email and work with them simultaneously on graphs.</p>
                    <li>
                      •	On the

                      <span>Homepage,</span>

                      in

                      <span>My graphs</span>

                      click …  in the right corner of a graph window

                      <span>➜ Share </span>
                      OR

                      <span>Open a graph</span>
                    </li>
                    <li>
                      •	Choose

                      <span>Share</span>

                      from the main menu

                    </li>
                    <li>
                      •
                      <span>Search </span>
                      a user

                    </li>
                    <li>•	Give access to the graph</li>
                    <li>
                      • Collaborators with

                      <span>«View»</span>

                      access can:
                    </li>
                    <li>•	view the graph,</li>
                    <li>•	write comments.</li>
                    <li>
                      •	Collaborators with

                      <span>«Edit»</span>

                      access can:
                    </li>
                    <li>•	create nodes, links, labels, etc.</li>
                    <li>•	comment on the graphs and nodes</li>
                    <li>•	delete the shared graph only from their account, but not the main graph</li>
                    <li>
                      •	Collaborators with

                      <span>«Admin»</span>

                      access can
                    </li>
                    <li>•	create nodes, links, labels, etc.</li>
                    <li>•	comment on the graphs and nodes</li>
                    <li>•	delete the graph </li>
                    <li>•	share the graph</li>
                    <li>•	Click Save</li>

                  </ol>
                </div>
                <div className="help_label-text">
                  <p>Collaborators with «View» access can</p>
                  <li>View the graph</li>
                  <li>Write comments</li>

                  <p>Collaborators with «Edit» access can</p>
                  <li>create nodes, links, labels, etc.</li>
                  <li>comment on the graphs and nodes</li>
                  <li>
                    delete the shared graph only from their account, but not the main
                    graph
                  </li>
                  <p>Collaborators with «Admin» access can</p>
                  <li>Create nodes, links, labels, etc.</li>
                  <li>Comment on the graphs and nodes</li>
                  <li>Delete the graph</li>
                  <li>Share the graph</li>
                  <li>Click Save</li>
                  <li>View the collaborators you are sharing the graph with.</li>
                  <li>
                    Press on the blue cursor to see the cursors of collaborators,
                    who is working on which part of the graph
                  </li>
                </div>
                {/* <div className="help_text"> */}

                {/* </div> */}
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Crop} className="help_img" alt="" />
              </div>
              <div>
                <p>Select</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>
                      •	Hold the button

                      <span>“Shift”</span>

                      and mark a part of the graph with the mouse.
                    </li>
                    <li>
                      •
                      <span> Right-click </span>
                      the selected area and choose one of the options below:
                    </li>
                    <li>
                      •
                      <span> Copy</span>

                      and

                      <span>Paste append </span>
                      in the current graph of in another graph
                    </li>
                    <li>
                      •	Create a

                      <span>New Graph</span>

                      by leaving the current graph

                    </li>
                    <li>
                      •
                      <span> Create a Folder</span>

                      with selected nodes and links
                    </li>
                    <li>
                      •
                      <span> Delete</span>

                      the selected area
                    </li>

                  </ol>
                  <p className="help_node_text">Crop</p>
                </div>
                <div className="help_text">
                  <ol>
                    <li>
                      <span>•	Right-click</span>

                      on the canvas,

                    </li>
                    <li>
                      •	Click

                      <span>Crop</span>
                    </li>
                    <li>•	Select a part of the graph </li>
                    <li>
                      •	Choose the

                      <span>Export Data</span>

                      file type (ZIP,  PNG, PDF, EXCEL)
                    </li>
                    <li>
                      •	Click

                      <span>Export</span>
                    </li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <iframe
                  width="1280"
                  height="720"
                  className="help_img"
                  src="https://www.youtube.com/embed/8aJt88yJ8eY"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div>
                <p>Create New node </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>
                      1. Right-click anywhere on canvas

                      <span> ➜ Create node</span>

                      OR choose from the main menu

                      <span>Create ➜ Node ➜ New</span>
                    </li>
                    <li>2.	Click anywhere on canvas </li>
                    <li>
                      3.	Enter the

                      <span>Node type</span>

                    </li>
                    <li>
                      4.	Enter the

                      <span>Node Name</span>

                    </li>
                    <li>
                      5.	Open

                      <span>Show More</span>

                      options
                    </li>
                    <li>
                      6.	Insert any

                      <span>Link</span>

                      related to this node (website, article link etc. )
                    </li>
                    <li>
                      7.	Choose a

                      <span>Status</span>

                    </li>
                    <li>
                      8.	Choose the type of the

                      <span>Shape</span>
                    </li>
                    <li>
                      9.	Adjust

                      <span>Color</span>

                    </li>
                    <li>
                      10.	Paste an

                      <span>icon</span>

                      link or select from your PC
                    </li>
                    <li>
                      11.	Type some descriptive

                      <span>keywords</span>

                    </li>
                    <li>12.	Set the visual size of the node </li>
                    <li>
                      13.	Select a location on

                      <span>Google map</span>
                    </li>
                    <li>
                      14.	Click

                      <span>Add</span>
                    </li>
                    <li>15.	Double-click the node</li>
                    <li className="helpsSubTitle">
                      •	View

                      <span>General</span>

                      information of the node,

                    </li>
                    <li className="helpsSubTitle">
                      •	Add more information in

                      <span>Tabs</span>

                    </li>
                    <li className="helpsSubTitle">
                      •	Type your

                      <span>Comments</span>

                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Expand </span>

                      the window for working more comfortable

                    </li>
                    <li className="helpsSubTitle">
                      •	View the history of changes
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Export </span>

                      the node in PDF form
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Edit </span>

                      the node

                    </li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <img src={Mapsgoogle} className="help_img" alt="" />
              <div>
                <p>Create node using Google Map </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>
                      Click

                      <span>Create ➜ Node ➜ Use Google map</span>
                    </li>
                    <li>1.	Search any place </li>
                    <li>2.	Click Google map location icon</li>
                    <li>
                      3.	Open

                      <span>Show More</span>

                      options
                    </li>
                    <li>
                      4.	Insert any

                      <span> Link</span>

                      related to this node (website, article link etc.)

                    </li>
                    <li>
                      5.	Choose a

                      <span>Status</span>

                    </li>
                    <li>
                      6.	Choose the type of the

                      <span> Shape</span>
                    </li>
                    <li>
                      7.	Adjust

                      <span> Color</span>

                    </li>
                    <li>
                      8.	Paste an

                      <span>icon</span>

                      link or select from PC
                    </li>
                    <li>
                      9.	Type some descriptive

                      <span>keywords</span>

                    </li>
                    <li>
                      10.	Set the visual

                      <span>Size</span>

                      of the node

                    </li>
                    <li>
                      11.	Location on the

                      <span>Google map</span>

                      is automatically mentioned
                    </li>
                    <li>
                      12.	Click

                      <span>Add</span>
                    </li>
                    <li>13.	Double-click the node</li>
                    <li className="helpsSubTitle">
                      •	View

                      <span>General</span>

                      information of the node

                    </li>
                    <li className="helpsSubTitle">
                      •	Add more information in

                      <span>Tabs</span>

                    </li>
                    <li className="helpsSubTitle">
                      •	Type your

                      <span>Comments</span>

                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Expand </span>

                      the window for working more comfortable

                    </li>
                    <li className="helpsSubTitle">
                      •	View the history of changes
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Export </span>

                      the node in PDF form
                    </li>
                    <li className="helpsSubTitle">
                      • Edit  the node

                    </li>

                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Wiki} className="help_img" alt="" />
              </div>
              <div>
                <p>Create node using Wikipedia</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>

                    <li>
                      1.	Click

                      <spn> Create ➜ Node ➜ Use Wikipedia</spn>

                    </li>
                    <li>2.	Search any information</li>
                    <li>3.	Choose an article from the list </li>
                    <li>
                      4.	Click

                      <span>Create Node</span>
                    </li>
                    <li>
                      5.	Open

                      <span>Show More</span>

                      options
                    </li>
                    <li>
                      6.	Insert any

                      <span>Link</span>

                      related to this node (website, article link etc.)
                    </li>
                    <li>
                      7.	Choose a

                      <span>Status</span>

                    </li>
                    <li>
                      8.	Choose the type of the

                      <span>Shape</span>
                    </li>
                    <li>
                      9.	Adjust

                      <span>Color</span>

                    </li>
                    <li>
                      10.	Paste an

                      <span>icon</span>

                      link or select from PC
                    </li>
                    <li>
                      11.	Type some descriptive

                      <span>keywords</span>

                    </li>
                    <li>12.	Set the visual size of the node </li>
                    <li>
                      13.	Select a location on

                      <span>Google map</span>
                    </li>
                    <li>
                      14.	Click

                      <span>Add</span>
                    </li>
                    <li>15.	Double-click the node</li>
                    <li className="helpsSubTitle">
                      •	View

                      <span>General</span>

                      information of the node

                    </li>
                    <li className="helpsSubTitle">
                      •	Add more information in

                      <span>Tabs</span>

                    </li>
                    <li className="helpsSubTitle">
                      •	Type your

                      <span>Comments</span>

                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Expand </span>

                      the window for working more comfortable

                    </li>
                    <li className="helpsSubTitle">
                      •	View the history of changes
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Export</span>

                      the node in PDF form
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Edit </span>

                      the node

                    </li>

                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Linkedin} className="help_img" alt="" />
              </div>
              <div>
                <p>Create node using LinkedIn</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>

                    <li>
                      1.	Click

                      <span />
                    </li>
                    <li>2.	Select the LinkedIn profile file (PDF) from your PC</li>
                    <li>3.	Press Import</li>
                    <li>
                      4.	Open

                      <span>Show More</span>

                      options
                    </li>
                    <li>
                      5.	Insert any
                      <span>Link</span>

                      related to this node (website, article link etc. )
                    </li>
                    <li>
                      6.	Choose a

                      <span>Status</span>

                    </li>
                    <li>
                      7.	Choose the type of the

                      <span>Shape</span>
                    </li>
                    <li>
                      8.	Adjust

                      <span>Color</span>

                    </li>
                    <li>
                      9.	Paste an

                      <span>icon</span>

                      link or select from PC
                    </li>
                    <li>
                      10.	Type some descriptive

                      <span>keywords</span>

                    </li>
                    <li>11.	Set the visual size of the node </li>
                    <li>
                      12.	Select a location on

                      <span>Google map</span>
                    </li>
                    <li>
                      13.	Click

                      <span>Add</span>
                    </li>
                    <li>14.	Double-click the node</li>
                    <li className="helpsSubTitle">
                      •	View

                      <span>General</span>

                      information of the node

                    </li>
                    <li className="helpsSubTitle">
                      •	Add more information in

                      <span>Tabs</span>

                    </li>
                    <li className="helpsSubTitle">
                      •	Type your

                      <span>Comments</span>

                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Expand </span>

                      the window for working more comfortable

                    </li>
                    <li className="helpsSubTitle">
                      •	View the history of changes
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Export</span>

                      the node in PDF form
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Edit </span>

                      the node

                    </li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={MinScince} className="help_img" alt="" />
              </div>
              <div>
                <p>Create node using Mind Science  </p>
              </div>
              <div className="helpResultText">
                <div className="helpMindText">
                  <p>What is Mind Science? </p>
                  <span>
                    Science Mind Science is a huge base of three famous scientific sites:
                  </span>
                  <a href="https://core.ac.uk/" rel="noreferrer" target="_blank">
                    <img src={HelpLeftSvg} alt="" />
                    www.core.ac.uk
                  </a>
                  <a href="https://www.semanticscholar.org/" rel="noreferrer" target="_blank">
                    <img src={HelpLeftSvg} alt="" />
                    www.semanticscholar.org
                  </a>
                  <a href="https://arxiv.org/" rel="noreferrer" target="_blank">
                    <img src={HelpLeftSvg} alt="" />
                    www.arxiv.org
                  </a>
                </div>
                <div className="help_text">
                  <ol>
                    <li className="helpMaind">
                      1.	Click

                      <span> Create ➜  Node ➜ Use Mind Science</span>

                    </li>
                    <li>
                      2.	Search

                      <span>Authors or Articles</span>

                    </li>
                    <li>3. Choose one or more articles from the list</li>
                    <li>
                      4.	Click

                      <span>Create Sub Graph</span>
                      The program automatically creates nodes and connects them with links
                    </li>
                    <li>5.	Double-click the node</li>
                    <li className="helpsSubTitle">
                      •	View

                      <span>General</span>

                      information of the node

                    </li>
                    <li className="helpsSubTitle">
                      •	Add more information in

                      <span>Tabs</span>

                    </li>
                    <li className="helpsSubTitle">
                      •	Type your

                      <span>Comments</span>

                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Expand </span>

                      the window for working more comfortable

                    </li>
                    <li className="helpsSubTitle">
                      •	View the history of changes
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Export</span>

                      the node in PDF form
                    </li>
                    <li className="helpsSubTitle">
                      •
                      <span> Edit </span>

                      the node

                    </li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={FindNode} className="help_img" alt="" />
              </div>
              <div>
                <p>Find Node: </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>•	Open the graph where you want to add nodes</li>
                    <li>•	Click Find Node</li>
                    <li>•	Type the title of node. The program will search nodes with this title in all your graphs and in shared with you graphs</li>
                    <li>•	Choose a node from the list</li>
                    <li>•	Move into your graph </li>

                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Label} className="help_img" alt="" />
              </div>
              <div>
                <div>
                  <p>Create a Label </p>
                </div>
                <div className="helpResultText">
                  <div className="help_text">
                    <ol>

                      <li>
                        Click

                        <span>Create ➜ Label ➜ Free form</span>

                        or choose

                        <span>Square</span>

                        or

                        <span>Ellipse</span>

                        form
                      </li>
                      <li>	Draw a Label on existing nodes or anywhere on the canvas </li>
                      <li>	Type the Name of the Label</li>
                      <li>
                        Click

                        <span>Save</span>
                      </li>
                      <li>•	Move into the Label existing nodes or create the new ones in.</li>
                      <span>Right-click a Label</span>
                      <li>

                        <span>• Edit</span>

                        the name of Label
                      </li>
                      <li>

                        <span>• Copy</span>

                        and

                        <span>Paste</span>

                        the Label anywhere on the canvas
                      </li>
                      <li>

                        <span>• Lock/unlock</span>

                        the Label: Locked Labels are not shown to the persons with shared access
                      </li>
                      <li>

                        <span>• Share</span>

                        Label with collaborators having Araks profile. Search collaborators by user name and work with them simultaneously on the shared Label.
                      </li>
                    </ol>
                  </div>
                  <div className="help_label-text">
                    <p>
                      Collaborators with

                      <span>«View»</span>

                      access can
                    </p>
                    <li>	view only shared Label</li>
                    <li>	write comments</li>
                    <p>
                      Collaborators with

                      <span>«Edit»</span>

                      access can
                    </p>
                    <li>	view only shared Label </li>
                    <li>	create/edit nodes and links only in shared Label</li>
                    <li>	move nodes outside the Label</li>
                    <p>
                      Collaborators with

                      <span>«Edit inside»</span>

                      access can
                    </p>
                    <li>	view shared Label</li>
                    <li>	create/edit nodes and links only in shared Label</li>
                    <p>
                      Collaborators with

                      <span>«Audit»</span>

                      access can
                    </p>
                    <li>	view the shared Label, change the status of nodes and write comments</li>
                    <li>

                      <span>Create Node</span>

                      in this Label
                    </li>
                    <li>

                      <span>Delete</span>

                      the Label
                    </li>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Folder} className="help_img" alt="" />
              </div>
              <div>
                <p>Create a Folder</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>
                      •	Click

                      <span> Create ➜Folder </span>
                    </li>
                    <li>•	Click anywhere on the canvas</li>
                    <li>
                      •	Type the
                      <span> Name </span>
                      of the Folder

                    </li>
                    <li>
                      •	Press

                      <span> Save </span>
                    </li>
                    <li>•	Open your Folder by double-click</li>
                    <li>•	Move into the Folder existing nodes or create the new ones in</li>

                  </ol>
                </div>

                <div className="help_label-text">
                  <p>

                    <span> Right-click an opened Folder </span>
                  </p>
                  <li>

                    <span> Edit </span>
                    the name of Folder
                  </li>
                  <li>
                    <span>Copy</span>
                    {' '}
                    and
                    {' '}
                    <span>Paste</span>
                    {' '}
                    the Folder anywhere on the canvas
                  </li>
                  <li>

                    <span>Lock/Unlock</span>
                    {' '}
                    the Folder: Locked Folder is not shown to the
                    Collaborators with shared access
                  </li>
                  <li>

                    <span>Share</span>
                    {' '}
                    Folder with Collaborators having Araks profile.
                    Search collaborators by user name and work with them
                    simultaneously on shared Folder.
                  </li>
                  <p>
                    Collaborators with

                    <span>«View» </span>
                    {' '}
                    access can
                  </p>
                  <li>view only shared Folder</li>
                  <p>
                    Collaborators with

                    <span>«Edit»</span>
                    {' '}
                    access can
                  </p>
                  <li>	view only shared Folders</li>
                  <li>	create/edit nodes, links, labels only in shared Folder</li>
                  <li>	move nodes outside the Folder</li>

                  <p>
                    Collaborators with

                    <span>«Edit inside»</span>
                    {' '}
                    access can
                  </p>
                  <li>	view shared Folders</li>
                  <li>	create/edit nodes, links, labels only in shared Folder</li>

                  <p>
                    Collaborators with

                    <span>«Audit»</span>
                    {' '}
                    access can

                  </p>
                  <li>
                    view shared Folder, change the status of nodes and write comments
                  </li>
                  <li>

                    <span>Create nodes</span>
                    {' '}
                    Create nodes in this Folder
                  </li>
                  <li>

                    <span>Delete</span>
                    {' '}
                    the Folder
                  </li>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={LinkNode} className="help_img" alt="" />
              </div>
              <div>
                <p>Link the nodes</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>1.	Click one of the nodes</li>
                    <li>2.	Move the line to another node and click</li>
                    <li>3.	Type or choose from the list the Relation type</li>
                    <li>4.	Choose the Link type</li>
                    <li>5.	Give Value to the link</li>
                    <li>6.	Select the Status </li>
                    <li>
                      7.	Select Show Direction to indicate the dependence of a node from the other node
                    </li>
                    <li>8.	Click Add</li>
                    <p>*You can have multiple links between two nodes (up to 200 links)</p>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Explore} className="help_img" alt="" />
              </div>
              <div>
                <div>
                  <p>Explore </p>
                </div>

                <div className="helpResultText">
                  <div className="help_text">
                    <p>To work separately on a special node of the graph we use Explore. </p>

                    <ol>
                      <li>•	Choose a node that you want to work on. </li>
                      <li>
                        •	Click

                        <span>More</span>

                        to view the full data of the node

                      </li>
                      <li>
                        <span>•	Right-click</span>

                        the chosen node
                      </li>
                      <li>
                        <span>• Expand ➜ All</span>

                        nodes on the canvas
                      </li>
                      <li>
                        <span>• Find path:</span>

                        the program uses Dijkstra's algorithm to find the shortest way to
                        another node (Dijkstra's algorithm is an algorithm for finding the shortest paths
                        between nodes in a graph, which may represent, for example, road networks. It was
                        conceived by computer scientist Edsger W. Dijkstra in 1956 and published
                        three years later)

                      </li>
                      <li>
                        <span>• Dismiss all</span>

                        the graph
                      </li>
                      <li>
                        <span>• Dismiss other nodes</span>
                      </li>
                      <li>
                        <span>• Match</span>

                        the selected node to find common keywords with other nodes

                      </li>
                      <p className="exploreTitle">After working on a special node, you can save the results as a query  :</p>
                      <li>
                        •	Type the

                        <span>Title</span>

                        of the query

                      </li>
                      <li>
                        •	Type a short

                        <span>Description</span>

                      </li>
                      <li>
                        •	Click

                        <span>Save</span>

                      </li>
                      <li>
                        •	View the

                        <span>Query list</span>

                      </li>
                      <p className="exploreTitle">
                        <span>Export</span>

                        the Query in .xlsx form
                      </p>
                    </ol>
                  </div>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Search} className="help_img" alt="" />
              </div>
              <div>
                <p>Search</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="export_graph_text">
                    Search any information in the current graph using filters.
                  </p>
                  <p className="export_graph_text"> More filters.</p>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Filter} className="help_img" alt="" />
              </div>
              <div>
                <p>Filter </p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <ol>
                    <li>
                      •	Open a graph and click

                      <span> Filter </span>

                      in the main menu
                    </li>
                    <li>•	Filter the data by:</li>
                  </ol>
                </div>
                <div className="helpMindText">
                  <a>•	Node Types</a>
                  <a>•	Node Status</a>
                  <a>•	Link Types</a>
                  <a>•	Labels</a>
                  <a>•	Label Status,</a>
                  <a>•	Link Value  </a>
                  <a>•	Node Keywords</a>
                  <a>•	Node Connections</a>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Media} className="help_img" alt="" />
              </div>
              <div>
                <p>Media</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="marg_graph_text">
                    All media information (photos, videos, etc.) that you have in nodes,
                    appears in the Media gallery.
                  </p>
                  <ol>
                    <li>
                      •	Click

                      <span>Media</span>

                      in the main menu
                    </li>
                    <li>•	View the media information by</li>
                  </ol>
                </div>
                <div className="helpMindText">
                  <a>•	Node icon</a>
                  <a>•	Documents of tabs</a>
                  <a>•	Image of tabs</a>
                  <a>•	Videos</a>
                </div>
              </div>
            </TabPanel>
            <TabPanel>
              <div>
                <img src={Analyses} className="help_img" alt="" />
              </div>
              <div>
                <p>Analysis</p>
              </div>
              <div className="helpResultText">
                <div className="help_text">
                  <p className="marg_graph_text">
                    In the analysis section, we calculate the parameters listed below:
                  </p>
                  <ol>
                    <li>Components of the graph</li>
                    <li>Analytics of the node:</li>
                  </ol>
                </div>
                <div className="helpMindText">
                  <a>
                    <img src={HelpLeftSvg} alt="" />
                    Node icon
                  </a>
                  <a>
                    <img src={HelpLeftSvg} alt="" />
                    Show documents of tabs
                  </a>
                  <a>
                    <img src={HelpLeftSvg} alt="" />
                    Show image of tabs
                  </a>
                  <a>
                    <img src={HelpLeftSvg} alt="" />
                    Videos
                  </a>
                </div>
                <div className="help_text">
                  <ol>
                    <li className="helpMaind">
                      • Multiplicity of edges (number of multiple edges between each
                      pair of nodes)
                    </li>
                    <li>• Number of connected components</li>
                    <li>• Sizes of connected components</li>
                    <li>• Min and max degrees</li>
                    <li>• Mean degree</li>
                    <li>• Degree distribution of the network</li>
                    <li>• Clustering coefficient</li>
                    <li>• Adjacent nodes</li>
                    <li>• Incident edges</li>
                    <li>• Degree of a node</li>
                    <li>• In- and out-degrees of nodes</li>
                    <li>• Local clustering coefficients of nodes</li>
                  </ol>
                </div>
              </div>
            </TabPanel>
            <TabPanel>

              <div className="helpResultText shotcouts">
                <div className="help-text ">
                  <ul>
                    <li>
                      <span className="HelpCommand">Analysis</span>
                      <div>
                        <span>Ctrl</span>
                        <span>A</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Import</span>
                      <div>
                        <span>Ctrl</span>
                        <span>I</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Data</span>
                      <div>
                        <span>Ctrl</span>
                        <span>D</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Search</span>
                      <div>
                        <span>Ctrl</span>
                        <span>F</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Media</span>
                      <div>
                        <span>Ctrl</span>
                        <span>M</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Science Graph</span>
                      <div>
                        <span>Ctrl</span>
                        <span>G</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Pencil</span>
                      <div>
                        <span>Ctrl</span>
                        <span>P</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Pencil Label</span>
                      <div>
                        <span>Ctrl</span>
                        <span>L</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Pencil Ellipse label</span>
                      <div>
                        <span>Ctrl</span>
                        <span>E</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Pencil Square label</span>
                      <div>
                        <span>Shift </span>
                        <span>E</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Edit Node</span>
                      <div>
                        <span>Ctrl</span>
                        <span>E</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">To open selected node</span>
                      <div>
                        <div />
                        <span>Enter</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">To escape selected item</span>
                      <div>
                        <div />
                        <span>Esc</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Select Dashboard</span>
                      <div>
                        <span>Shift</span>
                        <span>D</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Copy</span>
                      <div>
                        <span>Ctrl</span>
                        <span>C</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Paste</span>
                      <div>
                        <span>Ctrl</span>
                        <span>V</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Undo</span>
                      <div>
                        <span>Ctrl</span>
                        <span>Z</span>
                      </div>
                    </li>
                    <li>
                      <span className="HelpCommand">Redo</span>
                      <div>
                        <span>Ctrl</span>
                        <span>Y</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </div>
      </Modal>
    </Outside>

  );
};
