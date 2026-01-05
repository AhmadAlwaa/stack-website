import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import { red } from '@mui/material/colors';
interface deleteFiles{
    files:File[]
    index: number
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    setConvert: React.Dispatch<React.SetStateAction<boolean>>
    setFormats: React.Dispatch<React.SetStateAction<string[]>>
    
}

export default function DeleteFileButton({index,setFiles,setConvert,files, setFormats}:deleteFiles){
    const handleFileDelete=()=>{
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
        setFormats((prevFormats) => prevFormats.filter((_, i) => i !== index))
        if (files.length==1){
            setConvert(false)
        }
    }
    return(
        <IconButton onClick={handleFileDelete}
        aria-label="delete" size="medium" sx={{"&:focus": {outline:'none'}}} >
            <DeleteIcon fontSize="inherit" sx={{ color: red[500]  }}  />
        </IconButton>
    )
}