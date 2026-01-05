import TextField , { TextFieldProps } from "@mui/material/TextField";
const StyledTextField = (props: TextFieldProps) => {
    return (
        <TextField
            {...props}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
                width: {md:100, xs:70, sm:70},
                height:{sm:20, md:55, xs:20},
                input: { color: 'aliceblue', fontSize:{xs:10, md:15, sm:9}},
                '& .MuiInputLabel-root': { color: 'rgba(136, 196, 255, 1)' },
                '& .MuiInputLabel-root.Mui-focused': { color: 'rgba(161, 255, 214, 1)' },
                '& .MuiOutlinedInput-root': {
                    height:{sm:30, xs:30, md:65},
                '& fieldset': {
                    borderColor: 'aliceblue',
                },
                '&:hover fieldset': {
                    borderColor: 'rgba(183, 255, 245, 1)',
                },
                '&.Mui-focused fieldset': {
                    borderColor: 'rgba(124, 244, 214, 1)',
                },
                },
            }}
            />
    )
}
export default StyledTextField