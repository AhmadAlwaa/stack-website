import ConvertButton from '../convetButton/convertButton'
import DropDown from '../convertGrid/DropDown'
import {Popover,Typography} from '@mui/material'
import React, {useState, useEffect} from 'react';

interface DropDownValues{
    index: number
    setFormats: React.Dispatch<React.SetStateAction<string[]>>
    formats:string[]
    file: File
}

export default function DropDownConvert({file,index,setFormats,formats}:DropDownValues){
    const image_types = ["BMP", "GIF", "ICO", "JPEG", "JPG", "PNG", "TGA", "TIFF", "WEBP"]
    const video_types = ["3GP", "AVI", "FLV", "MKV", "MOV","MP4","OGV", "WEBM", "WMV"]
    let file_type = file.name.split(".").pop()?.toUpperCase();
    useEffect(() => {
  if (!formats[index]) {
    if (file_type && image_types.includes(file_type)) {
      setFormats(prev => {
        const updated = [...prev];
        updated[index] = 'JPG';
        console.log("Updated inside setFormats:", updated);
        return updated;
      });
    } else if (file_type && video_types.includes(file_type)) {
      setFormats(prev => {
        const updated = [...prev];
        updated[index] = 'MP4';
        console.log("Updated inside setFormats:", updated);
        return updated;
      });
    }
  }
}, [file_type, index, formats, setFormats]);
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null)
    const [openRow, setOpenRow] = useState<number | null>(null)
    const open = Boolean(anchorEl)
    const id = open ? 'simple-popover' : undefined;
    const handleClose = () => {
        setAnchorEl(null)
    }
    const handleFormat = (format:string, index:number|null) =>{
        const newFormats = [...formats]
        if (index || index===0){
            newFormats[index] = format
    }
        setFormats(newFormats)
        setAnchorEl(null)
    }
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>,index:number) => {
            setAnchorEl(event.currentTarget)
            setOpenRow(index)
        };
    return(
        <div style={{width:'80px'}}>
            <ConvertButton format={formats[index]} onChildClick={(e)=>handleClick(e,index)}/>
                <Popover
                id={id}
                PaperProps={{sx:{bgcolor:'#00090fff'}}}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
                }}
                >
                <DropDown file={file} handleFormat={(format)=>handleFormat(format,openRow)} />
            </Popover>
        </div>
    )
}
