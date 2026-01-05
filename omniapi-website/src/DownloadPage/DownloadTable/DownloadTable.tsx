import {Table,TableRow,TableCell,TableBody, TableContainer, Box, Typography, Button} from "@mui/material"
import DownloadProgressBar from "./DownloadProgressBar/DownloadProgressBar"
import IconButton from '@mui/material/IconButton';
import { itemPortalJob, itemPortalFile, itemPortalFileName, createDownloadTable } from '../../App'
import DeleteIcon from '@mui/icons-material/Delete';
import { red, blue } from '@mui/material/colors';
import { GetFileFromServer } from "../../ServerLink/getFileFromServer";
import { useNavigate} from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import DownloadIcon from '@mui/icons-material/Download';
import { ConvertBlob } from "./DownloadProgressBar/blob/convertBlob";
import ShareButton from "../../ShareFile/ShareButton";
import ShareLinkMenu from "../../ShareFile/FileTable/ShareLinkMenu/ShareLinkMenu";
type Table = {
  id: string;
  name: string;
  size: number;
  content_type: string
  created_on: string
}
type Props = {
    steps: string[]
}

export default function DownloadTable({steps}:Props){
    const {fileNames,setFileNames} = useContext(itemPortalFileName)
    const {showTable, setShowTable} = useContext(createDownloadTable)
    const navigate = useNavigate()
    const [error,setError] = useState(false)
    const [showDownloadButton, setShowDownloadButton] = useState<boolean[]>([])
    const [open, setOpen] = useState(false)
    const [blob, setBlob] = useState<Blob[]>([])
    const [files, setFiles] = useState<File[]>([])
    const { taskIDs, setTaskIDs }= useContext(itemPortalJob)
    const {fileIDs, setFileIDs} = useContext(itemPortalFile)
    const [jobIDs, setJobIDs] = useState<string[][]>([])
    useEffect(()=>{
        if(showTable === false){
            navigate("/")
        }
    },[showTable])
    const getFile=async(query:string)=>{
        try{
        const response = await fetch(`http://127.0.0.1:8000/job/item/file/?${query}`, {
        method: "GET"
        });
        if (!response.ok){
            const text = await response.text();
            console.error("get file info failed:", text);
            return null;
        }
        return await response.json()
        }catch(error){
            console.error("get file info failed:", error);
            return null;        
        }  
    }
   useEffect(() => {
    const fetchTaskJobs = async (taskId: string) => {
        console.log(taskIDs)
        console.log(steps)
        console.log(error)
        while (true) {
            const result = await getFile(`ids=${taskId}`);
            if (result && Array.isArray(result)) {
                const jobIdsForTask = result.map((row: any) => row.id);
                console.log(jobIdsForTask)
                // Only update if new jobs have appeared
                setJobIDs(prev => {
                    const newArr = [...prev];
                    const idx = taskIDs.indexOf(taskId); // find task’s index
                    if (idx !== -1) {
                        newArr[idx] = jobIdsForTask; // replace only this task’s jobs
                    } else {
                        newArr.push(jobIdsForTask); // first time for this task
                    }
                    return newArr;
                    });
                if (jobIdsForTask.length == steps.length) return
                if (error) return
            }
            await new Promise(resolve => setTimeout(resolve, 500)); // poll
        }
    };
    if(taskIDs.length==0) return
    taskIDs.forEach(id => fetchTaskJobs(id));
}, [taskIDs]);
    const changeRowCount=(i:number)=>{
        const count = taskIDs.length
        setTaskIDs((prev) => prev.filter((_,index) => index !== i))
        if (count==1){
            close()
        }
    }
    const close = ()=>{
        setFileIDs([])
        setTaskIDs([])
        setFileNames([])
        setJobIDs([])
        setBlob([])
        navigate('/')
        setShowDownloadButton([])
    }
    return(
    <>  
        <ShareLinkMenu setFiles = {setFiles} file_ids = {fileIDs} open={open} setOpen={setOpen}/>
        <Box sx={{display:'flex', flexDirection:'row', justifyContent:'space-between'}}>
             <Button variant="contained" onClick={close}
            sx={{color:'#f2f2f2ff', background:'#ff0000ff', 
                borderBottomLeftRadius:'0',
                borderBottomRightRadius:'0',
                boxShadow:'none',
                "&:hover": {
                boxShadow: "none",
                },
                "&:focus": {outline:'none'}
                }}>Close
            </Button>
            <ShareButton setOpen={setOpen}/>
        </Box>
        { showTable && (
        <TableContainer sx={{
            border: '3px solid #7fe5ff',
            borderRadius: '0px',
            borderTopRightRadius: '5px'}}>
            <Table>
                <TableBody>
                    {taskIDs?.map((_,i) =>(
                    <TableRow key={i}>
                        <TableCell>
                            <Typography sx={{color:'aliceblue'}}>
                                {fileNames[i]
                                }
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Box sx={{width:115}}>
                                <DownloadProgressBar 
                                ids = {jobIDs[i]}
                                setShowDownloadButton={setShowDownloadButton}
                                file_id = {fileIDs[i]}
                                setBlob = {setBlob}
                                steps = {steps}
                                setError = {setError}
                                />
                            </Box>
                        </TableCell>
                        { showDownloadButton[i] && (
                        <TableCell sx={{padding:0}}>
                            <IconButton
                            aria-label="download" onClick={() => ConvertBlob(blob[i],fileNames[i])} sx={{"&:focus": {outline:'none'}}}>
                                <DownloadIcon sx={{color: blue[200]}}>
                                </DownloadIcon>
                            </IconButton>
                        </TableCell>
                        )}
                        <TableCell>
                            <IconButton onClick={() =>changeRowCount(i)}
                            aria-label="delete" size="medium" sx={{"&:focus": {outline:'none'}}}>
                                <DeleteIcon sx={{ color: red[500] }}>
                                </DeleteIcon>
                            </IconButton>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        )}
        </>
    )
}