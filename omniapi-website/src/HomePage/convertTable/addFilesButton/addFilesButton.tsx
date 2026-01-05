import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import Divider from '@mui/material/Divider';
type Props = {
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
  };
export default function AddFilesButton({setFiles}:Props){
    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });
    const handleUpload = (UploadedFiles: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = UploadedFiles.target.files;
        if (!selectedFiles || selectedFiles.length === 0) {
          return;
        }
    
        const filesArray = Array.from(selectedFiles);
        setFiles((prevFiles) => [...prevFiles, ...filesArray]);
      }
    return(
        <Button variant="contained" 
        component="label"
        endIcon={<FileUploadIcon/>}
        
        tabIndex={-1}
        role={undefined}
        sx={{color:'#020007ff', background:'#7fe5ff', 
        borderBottomLeftRadius:'0',
        borderBottomRightRadius:'0',
        boxShadow:'none',
        "&:hover": {
        boxShadow: "none",
        },
        
        }}>
            Add More Files
            <Divider orientation="vertical" flexItem sx={{paddingRight:1}} />
            <VisuallyHiddenInput
        type="file"
        onChange={handleUpload}
        multiple
        />
        </Button>
    )
}