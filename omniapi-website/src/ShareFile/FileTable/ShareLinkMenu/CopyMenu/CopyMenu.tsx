import {Dialog, DialogContent, DialogTitle, 
    TableContainer, TableRow, Table, TableCell,Button, TextField, Paper, Box,
    IconButton, OutlinedInput, FormControl, InputAdornment,Popover,
    Typography, Alert,
    Snackbar} from '@mui/material';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate } from "react-router-dom";
type Props ={
    setOpen:React.Dispatch<React.SetStateAction<boolean>>
    open: boolean
    link:string
    date:string
    setFiles: React.Dispatch<React.SetStateAction<File[]>>
    setShowTable?:React.Dispatch<React.SetStateAction<boolean>>
}
const CopyMenu = ({setOpen, open,link,date, setFiles, setShowTable}:Props)=>{
    const [popOverText,setPopOverText] = useState('')
    const [copyNoti, setCopyNoti] = useState(false)
    const nagivate = useNavigate()
    const handleClose = () => {
        setFiles([])
        setOpen(false);
        setShowTable?.(false)
    };
    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>, text:string) => {
        setAnchorEl(event.currentTarget);
        setPopOverText(text)
    };
    const handlePopoverClose = () => {
        setAnchorEl(null);
    };
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const popover = Boolean(anchorEl);
    const handleCloseNoti=()=>{
        setCopyNoti(false)
    }

    return(
        <>
            <Snackbar open={copyNoti} onClose={handleCloseNoti} 
            message="copied to clipboard" autoHideDuration={1200}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            ContentProps={{sx:{justifyContent:'center', "& .MuiSnackbarContent-message":{
                textAlign:"center", width:"100%"
            }}}}
            />
            <Dialog open={open} PaperProps={{sx: {backgroundColor: "#262626ff"}}}>
                <DialogTitle color='white'>
                    {"Link Ready"}
                </DialogTitle>
                <DialogContent>
                    <TableContainer>
                        <Table>
                            <TableRow>
                                <TableCell sx={{borderBottom: "none" ,padding:'0px'}}>
                                    <Popover 
                                        open={popover}
                                        anchorEl={anchorEl}
                                        onClose={handlePopoverClose}
                                        anchorOrigin={{
                                            vertical:'top',
                                            horizontal:'center'
                                        }}
                                        transformOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'center',
                                        }}
                                        sx={{pointerEvents:'none'}}>
                                            <Typography fontSize={12} sx={{ p: .5 }}>{popOverText}</Typography>
                                    </Popover>
                                    <FormControl>
                                        <OutlinedInput
                                            size='small'
                                            value={link}
                                            // Fix: Pass the buttons to the endAdornment prop
                                            endAdornment={
                                                <InputAdornment position='end'>
                                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0}}>
                                                        {/* Added generic color sx so icons are visible on dark bg */}
                                                        <IconButton href={link} target="_blank" rel="noopener noreferrer" 
                                                        onMouseEnter={(e)=>handlePopoverOpen(e,'open link')} 
                                                        onMouseLeave={handlePopoverClose}  
                                                        sx={{ color: "rgba(222, 222, 222, 1)", 
                                                            "&:focus": {outline:'none'} }}>
                                                            <OpenInNewIcon  fontSize='small'/>
                                                        </IconButton>
                                                        <IconButton onClick={() => {navigator.clipboard.writeText(link)
                                                            setCopyNoti(true)}}
                                                            onMouseEnter={(e)=>handlePopoverOpen(e,'copy link')} 
                                                            onMouseLeave={handlePopoverClose}
                                                            sx={{ color: "rgba(222, 222, 222, 1)", 
                                                            "&:focus": {outline:'none'} }}>
                                                            <ContentCopyIcon fontSize='small' />
                                                        </IconButton>
                                                    </Box>
                                                </InputAdornment>
                                            }
                                            sx={{
                                                width: { sm: 300, md: 500, xs: 120 },
                                                // Base Background & Text
                                                backgroundColor: "#373737ff",
                                                color: "rgba(222, 222, 222, 1)",
                                                
                                                // Input Text Styling
                                                "& .MuiInputBase-input": {
                                                    fontSize: 13.5,
                                                    color: "rgba(222, 222, 222, 1)"
                                                },

                                                // Border Styling
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#1f1f1fff",
                                                },
                                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#7969baff",
                                                },
                                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#7969baff",
                                                }
                                            }}
                                        />
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{borderBottom: "none" ,paddingLeft:'3px'}}>
                                    <Typography fontSize={13} color='white'>
                                        {"This share will expire on " + date}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell sx={{borderBottom: "none" ,padding:0}}>
                                    <Button onClick={handleClose} sx={{width:'100%',
                                        backgroundColor:'rgba(59, 35, 84, 1)',
                                        borderColor:'rgba(47, 50, 247, 1)',
                                        borderWidth:'1px',
                                        color:'rgba(255, 255, 255, 1)',
                                        fontFamily:'monospace',
                                        "&:focus": {outline:'none'}
                                    }} variant='contained'>
                                            Done
                                        </Button>
                                </TableCell>
                            </TableRow>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default CopyMenu