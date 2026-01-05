import AttachFileIcon from '@mui/icons-material/AttachFile';
import './UploadButton.css'
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
type Props = {
    setConvert: React.Dispatch<React.SetStateAction<boolean>>;
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  };

export default function UploadButton ({ setConvert, setFiles }: Props) {
  const location = useLocation();
  const handleUpload = (UploadedFiles: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = UploadedFiles.target.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    const filesArray = Array.from(selectedFiles);
    setConvert(prev => !prev)
    setFiles(filesArray)
  }
  return (
    <>
      <input
        type="file"
        id="fileUpload"
        onChange={handleUpload}
        multiple ={location.pathname =='/'||  location.pathname === '/share-file'}
        accept={
          location.pathname === '/'
            ? 'image/*,video/*,application/pdf'
            : location.pathname === '/share-file'
            ? '*/*'
            : location.pathname === '/crop-video'
            ? 'video/*'
            : undefined
        }
        style={{display:'none'}}
      />
      <label htmlFor="fileUpload" className='Button'>
        <AttachFileIcon fontSize="medium" sx={{color:'aliceblue'}}/>
        <p style={{color:'aliceblue'}}>Choose Files</p>
      </label>
    </>
  )
}