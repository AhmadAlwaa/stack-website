import LinearProgress from '@mui/material/LinearProgress';
import {Box, Typography} from '@mui/material'
import { useState, useEffect, useRef } from 'react';
import { UploadToServer } from '../../../ServerLink/uploadToServer';
import { checkJobStatus } from '../../../ServerLink/checkJobStatus';
type Props={
    file:File
    setUploadDone: React.Dispatch<React.SetStateAction<boolean>>
    setFileID: React.Dispatch<React.SetStateAction<string[]>>
}
const UploadProgressBar = ({file,setUploadDone, setFileID}:Props) =>{
    const [linearProgresState, setLinearProgressState] = useState<'determinate' | 'indeterminate'>("indeterminate")
    const [color, setColor] = useState<'aliceblue' | 'red'>('aliceblue')
    const [text,setText] = useState<'uploading'|'done' | 'failed'>('uploading')
    const [barcolor,setbarcolor] = useState<'success' | 'error'>('success')
    const dataFetchedRef = useRef(false);
    const getJobStatus = async (job_id: string) => {
        while(true){
          const result = await checkJobStatus(job_id)
          if (result.status==='finished'){
            return true
          }
          else if (result.status ==='failed'){
            setLinearProgressState('determinate')
            setColor('red')
            return false
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      };
    const handleUpload = async()=>{
        const result = await UploadToServer(file,'share')
        if (result){
            const job_id = result.job_id
            const file_id = result.file_id
            const job_status = await getJobStatus(job_id)
            if (job_status){
                setUploadDone(true)
                setLinearProgressState("determinate")
                setbarcolor('success')
                setText('done')
                console.log(file_id)
                setFileID((prev)=>[...prev, file_id])
            }else{
            setUploadDone(false)
            setLinearProgressState("determinate")
            setbarcolor('error')
            setText('failed')
            }
        }

    }
    useEffect(()=>{
      if (dataFetchedRef.current) return;
      dataFetchedRef.current = true;
      handleUpload()
    },[])
    return(
        <>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <Box>
        <Typography variant="overline" sx={{ color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} >
            {text}
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <LinearProgress variant={linearProgresState} value={100} color={linearProgresState==='determinate' ? barcolor:'primary'}/>
      </Box>
    </Box>
    </>
    )
}
export default UploadProgressBar