import Dialog from '@mui/material/Dialog';
import { useState, useEffect, ChangeEvent } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { nanoid } from 'nanoid';
import CheckboxCS from './CheckBoxCS';
import { TableContainer, TableRow, Table, TableCell,Button, TextField, Typography, InputAdornment, 
    IconButton, Select, MenuItem, SelectChangeEvent, Box,FormControl,InputLabel, OutlinedInput} from '@mui/material'
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CopyMenu from './CopyMenu/CopyMenu';
import PasswordField from './PasswordField/PasswordField';
import CheckLink from '../../../FilesPage/CheckLink/CheckLink';
type Props = {
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
    open: boolean
    file_ids:string[]
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    setShowTable?:React.Dispatch<React.SetStateAction<boolean>>
}
const ShareLinkMenu = ({setOpen, open,file_ids, setFiles,setShowTable}:Props) =>{
    const [ID, setID] = useState(nanoid(8))
    const [clipOpen, setClipOpen] = useState(false);
    const [password, setPassword] = useState('')
    const handleShare = async()=>{
        const check = await CheckLink(ID)
        console.log(check)
        if (check==false){
            setError(false)
            try{
                const formData = new FormData();
                file_ids.forEach((id) => {
                    formData.append("fileID", id); 
                });
                formData.append("link", ID)
                formData.append("password",password)
                formData.append("hours_valid",date )
                const response = await fetch(`http://127.0.0.1:8000/job/generate-link`,{
                    method: "POST",
                    body: formData,
                })
                const data = await response.json()
                if (data.share_url){
                    setOpen(false)
                    setClipOpen(true)
                }
            } catch(error){
                
            }
        }
        else{
            setError(true)
        }
    }
    const [value, setValue] = useState(0)
    const [time,setTime] = useState('minutes')
    const [date, setDate] = useState("")
    const [permanent, setPermanent]=useState(false)
    const [error, setError] = useState(false)
    useEffect(()=>{
        const calculateExpiryDate = () => {
        const date = new Date(); // Get current time
        const val = parseInt(value.toString()); // Ensure text input is a number

        if (isNaN(val)) return "Invalid Date";

        switch (time) {
            case "minutes":
                date.setMinutes(date.getMinutes() + val);
                break;
            case "hours":
                date.setHours(date.getHours() + val);
                break;
            case "days":
                date.setDate(date.getDate() + val);
                break;
            default:
                return "Invalid Unit";
        }

        // Format it nicely (e.g., "Dec 28, 2025 at 2:30 PM")
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            })
        }
        setDate(calculateExpiryDate())
    },[value,time])
    const handleClose = () => {
        setOpen(false);
    };
    const handleID = async () => {
    setError(false);
    const newID = nanoid(8); 
    const exists = await CheckLink(newID); 
    if (exists === false) {
        setID(newID); 
        return;
    } else {
        handleID(); 
    }
}
    const handleIncrement = () => setValue(prev => prev + 1);
    const handleDecrement = () => setValue(prev => prev - 1);
    const handleChange=(e:ChangeEvent<HTMLInputElement>)=>{
        if (!e.target) return
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) setValue(val);
        else if (e.target.value === '') setValue(0); 
    }
     const handleTimeChange = (event: SelectChangeEvent) => {
        setTime(event.target.value as string);
    };
    return (
        <>
            <CopyMenu setShowTable={setShowTable} setFiles={setFiles} date={date} setOpen={setClipOpen} open = {clipOpen} link={"http://localhost:5173/share-file/s/"+ID} />
            <Dialog open={open} onClose={handleClose} 
            PaperProps={{
                    sx: {
                        backgroundColor: "#262626ff", // Change this to your desired color

                    }
                }}
                >
                <DialogTitle color='white'>
                    {"Share Options"}
                </DialogTitle>
                <DialogContent sx={{minWidth:'100px'}}>
                    <TableContainer>
                        <Table>
                            <TableRow>
                                <TableCell sx={{borderBottom: "none" ,padding:'0px'}}>
                                    <TextField variant="outlined" size='small' value={ID} onChange={(event) => setID(event.target.value)}
                                    sx={{
                                        width:{sm:300, md:300, xs:120},
                                        "& .MuiOutlinedInput-root": {
                                        backgroundColor: "#373737ff", 
                                        "& fieldset": {
                                            borderColor: "#1f1f1fff", 
                                        },
                                        "&:hover": {
                                            backgroundColor: "#373737ff", 
                                            "& fieldset": { borderColor: "#7969baff" } 
                                        },
                                        "&.Mui-focused": {
                                            backgroundColor: "#373737ff", 
                                            "& fieldset": { borderColor: "#7969baff" } 
                                        },
                                        input: { color: "rgba(222, 222, 222, 1)" }
                                    },
                                    }}>
                                       
                                    </TextField>
                                    { error &&
                                    <Typography color="red" fontSize={10}>
                                        link already in use
                                    </Typography>
                                    }
                                </TableCell>
                                <TableCell sx={{borderBottom: "none", paddingRight:'0px'}}>
                                    <Button onClick={handleID} variant='outlined' sx={{
                                        backgroundColor:'rgba(33, 33, 33, 0)',
                                        borderColor:'rgba(100, 102, 195, 1)',
                                        borderWidth:'1px',
                                        color:'rgba(214, 235, 255, 1)',
                                        fontFamily:'monospace',
                                        "&:focus": {outline:'none'}
                                    }}>
                                        Generate
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none" , padding:'0px'}}>
                                    <Typography fontSize={{md:12, xs:10, sm:10}} color='rgba(223, 223, 223, 1)'>
                                        {"http://localhost:5173/share-file/s/"+ID}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none", paddingLeft:0, paddingRight:0}}>
                                    <Box sx={{flexDirection:'row', display:'flex', gap:2}}>
                                    <TextField
                                        value={value}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small" // Important for compact look
                                        sx={{
                                            width:{sm:200, md:200, xs:100},
                                            // Your Dark Mode Styles
                                            "& .MuiOutlinedInput-root": {
                                                backgroundColor: "#373737",
                                                color: "white",
                                                "& fieldset": { borderColor: "#1f1f1f" },
                                                "&:hover fieldset": { borderColor: "#7969ba" },
                                                "&.Mui-focused fieldset": { borderColor: "#7969ba" }
                                            },
                                            "& .MuiInputLabel-root": { color: "#bdbdbd" },
                                            "& .MuiInputLabel-root.Mui-focused": { color: "#7969ba" }
                                        }}
                                        InputProps={{
                                            // This puts the buttons inside the text field
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        
                                                        {/* UP BUTTON */}
                                                        <IconButton 
                                                            onClick={handleIncrement}
                                                            sx={{ "&:focus": {outline:'none'}, p: 0, color: "white", width: '20px', height: '14px' }}
                                                        >
                                                            <ArrowDropUpIcon />
                                                        </IconButton>

                                                        {/* DOWN BUTTON */}
                                                        <IconButton 
                                                            onClick={handleDecrement}
                                                            sx={{ "&:focus": {outline:'none'}, p: 0, color: "white", width: '20px', height: '14px' }}
                                                        >
                                                            <ArrowDropDownIcon />
                                                        </IconButton>

                                                    </div>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Select
                                        value={time}
                                        onClose={() => {
                                            setTimeout(() => {
                                                (document.activeElement as HTMLElement)?.blur();
                                            }, 0);
                                        }}
                                        onChange={(e) => {
                                            handleTimeChange(e); // Your original logic
                                            setTimeout(() => {
                                                (document.activeElement as HTMLElement)?.blur();
                                            }, 0);
                                        }}
                                        sx={{width:{sm:200, md:200, xs:100}, color:'white', height:40,
                                            "& .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(194, 194, 194, 1)",
                                        },
                                        "&:hover .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(100, 102, 195, 1)", 
                                        },
                                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                            borderColor: "rgba(100, 102, 195, 1)", // Cyan when Active
                                        },
                                        "& .MuiSvgIcon-root": {
                                            color: "white",
                                        },
                                        }}
                                        MenuProps={{
                                            PaperProps:{
                                                sx:{
                                                    backgroundColor: "rgba(47, 22, 65, 0.54) !important",
                                                    "& .MuiMenuItem-root": {
                                                        "&:hover": {
                                                            backgroundColor: "rgba(205, 170, 240, 0.2) !important", 
                                                        },
                                                    }
                                                }
                                            }
                                        }}
                                        >
                                            <MenuItem value={"minutes"}>Minutes</MenuItem>
                                            <MenuItem value={"hours"}>Hours</MenuItem>
                                            <MenuItem value={"days"}>Day</MenuItem>
                                        </Select>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none" , padding:'0px'}}>       
                                    <CheckboxCS setPermanent={setPermanent}/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none" , paddingLeft:'0px'}}>
                                    {!permanent ?( <Typography color='white' fontSize={{md:15, xs:11, sm:13}}>
                                        The link will expire on {date} 
                                    </Typography>):(
                                    <Typography color='white' fontSize={{md:15, xs:11, sm:13}}>
                                        Link is permanent 
                                    </Typography>)
                                    }
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none" , padding:'0px'}}>
                                    <PasswordField setPassword={setPassword}/>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={2} sx={{borderBottom: "none" , paddingLeft:'0px', paddingRight:0}}> 
                                    <Box sx={{display:'flex', justifyContent: 'center', width: '100%' }}>
                                        <Button onClick={handleShare} sx={{width:'100%',
                                            backgroundColor:'rgba(59, 35, 84, 1)',
                                            borderColor:'rgba(47, 50, 247, 1)',
                                            borderWidth:'1px',
                                            color:'rgba(255, 255, 255, 1)',
                                            fontFamily:'monospace',
                                            "&:focus": {outline:'none'}
                                            }} variant='contained'>
                                            Share
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default ShareLinkMenu