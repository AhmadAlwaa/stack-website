import { Box,FormControl,InputLabel,OutlinedInput,InputAdornment, IconButton,  } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { useState } from "react";
type Props={
    setPassword: React.Dispatch<React.SetStateAction<string>>
}
const PasswordField = ({setPassword}:Props)=>{
    const [showPassword, setShowPassword] = useState(false);
    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    return(
        <>
        <Box sx={{display:'flex', justifyContent: 'center', width: '100%' }}>
            <FormControl size='small' sx={{width: '100%'}} variant="outlined">
                <InputLabel sx={{color: "#ffffffff", // Default Grey
                    "&.Mui-focused": {
                    color: "#7969ba", // Purple when typing
                    }
                }} >Password</InputLabel>
                <OutlinedInput 
                    id="outlined-adornment-password"
                    type={showPassword ? 'text' : 'password'}
                    onChange={(event)=>setPassword(event.target.value)}
                    sx={{
                        // Text Color & Background
                        color: "white",
                        backgroundColor: "#373737",
                        "& input::-ms-reveal": {
                            display: "none",
                        },
                        "& input::-ms-clear": {
                            display: "none",
                        },
                        // Border Colors
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1f1f1f", // Default Border
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#7969ba", // Hover Border
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#7969ba", // Focused Border
                        }
                    }}
                    endAdornment={
                    <InputAdornment position="end">
                        <IconButton sx={{ color: "rgba(219, 220, 221, 1)" }}
                        aria-label={
                            showPassword ? 'hide the password' : 'display the password'
                        }
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                    </InputAdornment>
                    }
                    label="Password"
                />
                </FormControl>
            </Box>
        </>
    )
}
export default PasswordField