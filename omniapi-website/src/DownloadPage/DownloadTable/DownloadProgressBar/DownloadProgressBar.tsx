import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import React, { useState, useEffect, useRef } from "react";
import { checkJobStatus } from '../../../ServerLink/checkJobStatus';
import {GetFileFromServer} from '../../../ServerLink/getFileFromServer';
interface DownloadProgressBarProps {
  ids: string[]
  steps: string[]
  setShowDownloadButton: React.Dispatch<React.SetStateAction<boolean[]>>
  setBlob: React.Dispatch<React.SetStateAction<Blob[]>>
  file_id: string
  setError: React.Dispatch<React.SetStateAction<boolean>>
}

export default function DownloadProgressBar({ ids, setShowDownloadButton, setBlob, steps, file_id, setError}: DownloadProgressBarProps) {
  const [step, setStep] = useState("uploading");
  const [color,setColor] = useState('aliceblue');
  const [nextStep, setNextStep] = useState()
  const [linearProgresState, setLinearProgressState] = useState<'determinate' | 'indeterminate'>("indeterminate")
  const getJobStatus = async (job_id: string) => {
    while(true){
      const result = await checkJobStatus(job_id)
      if (result.status==='finished'){
        return true
      }
      else if (result.status ==='failed'){
        setStep('error')
        setColor('red')
        return false
      }
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };
  const handleConvert = async () => {
    if(ids){
        // --- Wait for all jobs to complete ---
        console.log(steps.indexOf(step), steps, step)
        for (let i = steps.indexOf(step); i < steps.length; i++) {
          console.log(steps[i], ids[i] )
          if (!ids[i]) return
            const done = await getJobStatus(ids[i]);
            if (!done) {
                setStep("error");
                setError(true)
                setColor("red");
                return; // stop if any job failed
            }
            if (i<steps.length-1) setStep(steps[i+1])
        }
        console.log(ids, ids.length, steps.length)
    }
};
  useEffect(() => {
    handleConvert()
  }, [ids])

  useEffect(()=>{
    const downloadFile=async() =>{
        if(file_id){
        // --- All jobs succeeded, determine location for download ---
        const lastStepIndex = ids.length - 1;
        let location = steps[lastStepIndex] === "converting" ? "convert" : "";
        if(!location){
          location = "editor"
        }
        try {
            const response = await GetFileFromServer(file_id, location);
            if (!response) {
              setStep("error");
              setColor("red");
              return
            }

            const blob = await response.blob();
            setBlob(prev => [...prev, blob]);
            setShowDownloadButton(prev => [...prev, true]);
            setStep("done");
            setLinearProgressState('determinate')
        } catch (error) {
            console.error("Getting file download:", error);
            setStep("error");
            setColor("red");
        }
      }
    }
    downloadFile()
    },[file_id])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <Box>
        <Typography variant="overline" sx={{ color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} >
          {step}
        </Typography>
      </Box>
      <Box sx={{ width: '100%' }}>
        <LinearProgress variant={linearProgresState} value={100} color={linearProgresState==='determinate' ? 'success':'primary'}/>
      </Box>
    </Box>
  );
}