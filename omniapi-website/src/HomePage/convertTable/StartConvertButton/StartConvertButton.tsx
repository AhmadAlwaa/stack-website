import Button from '@mui/material/Button'
import { useNavigate } from "react-router-dom";
import React, { useContext } from 'react'
import { itemPortalJob, itemPortalFile, itemPortalFileName, createDownloadTable } from '../../../App'
import { UploadToFunction } from './UploadFunctions/UploadToFunction';
import { ConvertToFunction } from './UploadFunctions/ConvertToFunction';
import {JobStatusFunction} from './UploadFunctions/JobStatusFunction'
type Props = {
    formats: string[]
    files: File[];
}
export default function StartConvertButton({formats, files}: Props){
    const navigate = useNavigate()
    const { taskIDs, setTaskIDs }= useContext(itemPortalJob)
    const {showTable, setShowTable} = useContext(createDownloadTable)
    const {fileNames,setFileNames} = useContext(itemPortalFileName)
    const {fileIDs, setFileIDs} = useContext(itemPortalFile)
    const handleUpload = async () => {
        setShowTable(true)
        navigate("/download");

        // Run each file in its own async pipeline
        const pipelines = files.map((file, index) =>
            handleFilePipeline(file, formats[index])
        );

        await Promise.all(pipelines); // run in parallel but you don’t wait for each file’s completion
    };
    const handleFilePipeline = async (file: File, format: string) => {
    // --- UPLOAD ---
        const uploadResult = await UploadToFunction(file);
        if (!uploadResult) return;

        const { job_id:uploadJob, file_id: uploadFile, file_type, task_id } = uploadResult;
        const file_name = file.name.split(".")[0] + "."+format.toLowerCase()
        // Push upload job & file immediately with placeholder for convert
        setTaskIDs(prev => [...prev, task_id]);
        setFileNames(prev => [...prev, file_name ])
        // --- Wait for upload completion ---
        const uploadDone = await JobStatusFunction(uploadJob);
        if (!uploadDone) return;

        // --- CONVERT ---
        const convertResult = await ConvertToFunction(uploadFile, format, file_type, task_id);
        if (!convertResult) return;

        const { job_id: convertJob, file_id: convertFileID } = convertResult;

        const convertDone = await JobStatusFunction(convertJob)
        if (!convertDone) return;

        setFileIDs(prev => [...prev, convertFileID]);
        
};
    return(
        <div style={{width:'100.5%'}}>
            <Button fullWidth 
                onClick={handleUpload}
                sx={{color:'#000000ff', 
                background:'#b160c8ff', 
                borderTopLeftRadius:0, 
                borderTopRightRadius:0,
                }} >
                Convert
            </Button>
            
        </div>
    )
}