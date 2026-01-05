import { ImagesearchRoller } from "@mui/icons-material";
import { Box, Button, Grid } from "@mui/material";
import {useState} from 'react'

interface DropDrownProps{
  handleFormat: (format: string)=>void
  file: File
}

const DropDown = ({handleFormat, file}:DropDrownProps) => {
  const image_types = ["BMP", "GIF", "ICO", "JPEG", "JPG", "PNG", "TGA", "TIFF", "WEBP", "PDF"]
  const video_types = ["3GP", "AVI", "FLV", "MKV", "MOV","MP4","OGV", "WEBM", "WMV"]
  const file_type = file.name.split('.').pop()?.toUpperCase();
  let rows:string[] = []
  if (file_type && image_types.includes(file_type)){
    rows = image_types
  }
  else if (file_type && video_types.includes(file_type)){
    rows = video_types
  }
  return (
    <Box sx={{flexGrow: 1, background:'#00090fff', padding:2 }} width={200}>
      <Grid container spacing={2} columns={6}>
        {rows.map((format,index) =>(
          <Grid key={index} size={{ xs: 4, md: 2 }} width={55}>
            <Button onClick={()=>handleFormat(format)} sx={{background: '#4c4c4cff', color:'#FFFFFF'}}>
              {format}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
export default DropDown;
