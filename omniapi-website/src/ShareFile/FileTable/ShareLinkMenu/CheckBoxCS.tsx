import { styled } from '@mui/material/styles';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { Typography } from '@mui/material';
import { useState } from 'react';

type Props = {
    setPermanent: React.Dispatch<React.SetStateAction<boolean>>
}

// 1. STYLED COMPONENTS (Keep these outside to prevent re-creation on every render)
const BpIcon = styled('span')(({ theme }) => ({
    borderRadius: 3,
    width: 16,
    height: 16,
    padding: 0,
    boxShadow: 'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',

    'input:hover ~ &': {
        backgroundColor: '#ffffffff',
        ...theme.applyStyles('dark', {
            backgroundColor: '#30404d',
        }),
    },
}));

const BpCheckedIcon = styled(BpIcon)({
    backgroundColor: '#4f3e76ff',
    backgroundImage: 'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&::before': {
        display: 'block',
        width: 16,
        height: 16,
        backgroundImage:
            "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
            " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
            "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
        content: '""',
    },
    'input:hover ~ &': {
        backgroundColor: '#4f3e76ff',
    },
});

// 2. CHILD COMPONENT (Remove hardcoded logic, just accept props)
function BpCheckbox(props: CheckboxProps) {
    return (
        <Checkbox
            sx={{ '&:hover': { bgcolor: 'transparent' }, padding: .25 }}
            disableRipple
            color="default"
            checkedIcon={<BpCheckedIcon />}
            icon={<BpIcon />}
            slotProps={{ input: { 'aria-label': 'Checkbox demo' } }}
            {...props} // This allows it to receive checked/onChange from the parent
        />
    );
}

// 3. MAIN COMPONENT
export default function CheckboxCS({ setPermanent }: Props) {
    // Move State inside the component
    const [check, setCheck] = useState(false);

    // Define Change Handler inside the component
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        
        // Update local state
        setCheck(newValue);
        
        // Update parent state directly (No useEffect needed)
        setPermanent(newValue);
        
        console.log('ACT1', newValue);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Pass state and handler down to the styled checkbox */}
            <BpCheckbox checked={check} onChange={handleChange} />
            
            <Typography fontSize={{md:15, xs:15, sm:15}} color='white'>
                Permanent Link
            </Typography>
        </div>
    );
}