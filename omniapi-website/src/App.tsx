import React, { useState, createContext, Dispatch, SetStateAction, useEffect } from 'react';
import './App.css';
import HomePage from './HomePage/homePage.tsx';
import ShareFilePage from './ShareFile/ShareFile.tsx';
import DownloadPage from './DownloadPage/DownloadPage.tsx';
import CropVideoPage from './CropVideoPage/CropVideoPage.tsx';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Typography } from '@mui/material';
import FilesPage from './FilesPage/FilesPage.tsx';
type ItemPortalContextTypeJob = {
  taskIDs: string[];
  setTaskIDs: Dispatch<SetStateAction<string[]>>;
};
type ItemPortalContextTypeFile = {
  fileIDs: string[];
  setFileIDs: Dispatch<SetStateAction<string[]>>;
};
type ItemPortalContextTypeFileNames = {
  fileNames: string[];
  setFileNames: Dispatch<SetStateAction<string[]>>;
};
type showTableType ={
  showTable: boolean
  setShowTable:Dispatch<SetStateAction<boolean>>
}
type stepsProp = {
  steps: string[]
  setSteps:Dispatch<SetStateAction<string[]>>
}
type fileProps = {
  files: File[]
  setFiles:Dispatch<SetStateAction<File[]>>
}
export const itemPortalJob = createContext<ItemPortalContextTypeJob>({
  taskIDs: [],
  setTaskIDs: () => {},
});
export const itemPortalFileName = createContext<ItemPortalContextTypeFileNames>({
  fileNames: [],
  setFileNames: () => {},
});
export const itemPortalFile = createContext<ItemPortalContextTypeFile>({
  fileIDs: [],
  setFileIDs: () => {},
});

export const itemPortalSetFiles = createContext<fileProps>({
  files: [],
  setFiles:()=>{}
})
export const createDownloadTable = createContext<showTableType>({showTable:false, setShowTable: ()=>{}})
export const stepsPortal = createContext<stepsProp>({steps: [], setSteps: ()=>{}})
function App() { 
  const [taskIDs, setTaskIDs] = useState<string[]>([])
  const [fileIDs, setFileIDs] = useState<string[]>([])
  const [fileNames, setFileNames] = useState<string[]>([])
  const [showTable, setShowTable] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const [files, setFiles] = useState<File[]>([]);
  useEffect(() => {
  const handlePopState = () => {
    console.log(window.location.pathname)
    if (window.location.pathname === "/download") {

    } else {
      console.log("User navigated away from /download with back button");
      // clear all context
      setTaskIDs([]);
      setFileIDs([]);
      setFileNames([]);
    }
  };

  window.addEventListener("popstate", handlePopState);
  return () => window.removeEventListener("popstate", handlePopState);
}, []);
  return (
    <stepsPortal.Provider value = {{steps, setSteps}}>
      <createDownloadTable.Provider value = {{showTable,setShowTable}}>
        <itemPortalFileName.Provider value = {{fileNames, setFileNames}}>
          <itemPortalFile.Provider value={{fileIDs, setFileIDs}}>
            <itemPortalJob.Provider value={{taskIDs,setTaskIDs}}>
              <itemPortalSetFiles.Provider value = {{files, setFiles}}>
                <Router>
                  <Routes>
                    <Route
                      path="/"  // optional dynamic param
                      element={
                        <div className="App">
                          <HomePage/>
                        </div>
                      }
                    />
                    <Route
                      path="/download"
                      element={
                        <div className='downloadPage'>
                          <DownloadPage steps = {["uploading", "converting"]}/>
                        </div>
                      }
                    />
                    <Route
                      path="/crop-video"
                      element={
                        <div style={{display:'flex', alignItems: 'center',flexDirection:'column',justifyContent:'center', width:'100vw'}}>
                          <CropVideoPage/>
                        </div>
                      }
                    />
                    <Route
                      path="/crop-video/download"
                      element={
                        <div style={{display:'flex', justifyContent:'center', width:'100vw'}}>
                          <DownloadPage steps = {steps} />
                        </div>
                      }
                    />
                    <Route
                      path="/share-file"
                      element={
                        <div className="App">
                          <ShareFilePage/>
                          
                        </div>
                        
                      }
                    />
                    <Route
                      path="/share-file/s/:linkID"
                      element={
                        <div style={{display:'flex', justifyContent:'center', width:'100vw'}}>
                          <FilesPage/>
                        </div>
                      }
                    />
                  </Routes>
                </Router>
              </itemPortalSetFiles.Provider>
            </itemPortalJob.Provider>
          </itemPortalFile.Provider>
        </itemPortalFileName.Provider>
      </createDownloadTable.Provider>
    </stepsPortal.Provider>
  );
}

export default App;
