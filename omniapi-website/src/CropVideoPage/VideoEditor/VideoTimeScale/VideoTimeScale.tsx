import {Box,Slider, Typography, IconButton} from '@mui/material';
import React, { useState, useEffect, useRef} from 'react';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { FlashOnTwoTone } from '@mui/icons-material';
const minDistance=.1
type Props={
    videoRef: React.RefObject<{setTime:(time:number)=>void, play:()=>void, pause:()=>void, getDuration:()=>number, getCurrentTime:()=>number}|null>
    value: number[]
    setValue: React.Dispatch<React.SetStateAction<number[]>>
}
const VideoTimeScale = ({videoRef, value, setValue}:Props) => {
    const step = Number(((videoRef.current?.getDuration()??202)/202).toFixed(1)) || 1
    const videoTimeRef = useRef(0);
    const [error,setError] = useState<boolean>(false)
    const [videoTime, setVideoTime] = useState(0)
    const [play,setPlay]= useState(true)
    const pressStartRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [keyPressed, setKeyPressed] = useState(false)
   const handleChange = (event: Event,newValue: number | number[],activeThumb: number) => {
        if (!Array.isArray(newValue)) return;

        if (!keyPressed) {
            const updated = [...newValue];
            if (activeThumb > 0 && updated[activeThumb] < updated[activeThumb - 1] + minDistance) {
            updated[activeThumb] = updated[activeThumb - 1] + minDistance;
            }
            if (
            activeThumb < updated.length - 1 &&
            updated[activeThumb] > updated[activeThumb + 1] - minDistance
            ) {
            updated[activeThumb] = updated[activeThumb + 1] - minDistance;
            }
            setValue(updated);
            return;
        }
        const pairLow = activeThumb % 2 === 0 ? activeThumb : activeThumb - 1;
        const pairHigh = pairLow + 1;

        setValue((prev) => {
            // bounds check - if pairHigh doesn't exist, do nothing
            if (pairLow < 0 || pairHigh >= prev.length) return prev;
            const next = prev.filter((_, i) => i !== pairLow && i !== pairHigh);
            return next;
        });

        // stop repeated deletions while user still holding the key
        setKeyPressed(false);
    };

    const addMarker = () => {
        const duration = videoRef.current?.getDuration() ?? 1;
        const stepSize = step * (duration/10);
        for (let start = 0; start + stepSize <= duration; start += stepSize) {
            const end = start + stepSize;
            let overlaps = false;
            for (let j = 0; j < value.length; j += 2) {
                const existingStart = value[j];
                const existingEnd = value[j + 1];
                if (!(end < existingStart || start > existingEnd)) {
                    overlaps = true;
                    setError(true)
                    break;
                }
            }

            if (!overlaps) {
                setValue((prev) => [...prev, start, end]);
                setError(false)
                break; 
                }
            }
        };
  
    useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = performance.now();
    const updateTime = () => {
        if (videoRef.current && !play) {
            const currentTime = videoRef.current.getCurrentTime();
            videoTimeRef.current = currentTime;

            const now = performance.now();
            if (now - lastUpdate > 100) { 
                setVideoTime(currentTime);
                lastUpdate = now;
                if (currentTime >= videoRef.current.getDuration()) {
                    setPlay(true)
                }
            }
        }
        animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
}, [videoRef, play]);

    useEffect(()=>{
        const keyDownHandler = (event: KeyboardEvent) =>{
            if (event.key === 'Delete' || event.key === 'Backspace'){
                event.preventDefault()
                setKeyPressed(true)
            }
        }
        const keyUpHandler = (event: KeyboardEvent) =>{
            if (event.key === 'Delete' || event.key === 'Backspace'){
                setKeyPressed(false)

            }
        }
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        return () =>{
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
        }
    }, [])


    const handleSliderChange = (event:Event, newValue:number) => {
        setVideoTime(newValue)
        videoRef.current?.setTime(newValue)
    }
    const handleClick=() => {
        if (play) {
            videoRef.current?.play();
        } else {
            videoRef.current?.pause();
        }
        setPlay((prev) => !prev);;
    }
 const handlePointerDown = () => {
    pressStartRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setKeyPressed(true); // long press triggered
    }, 500);
  };

  const handlePointerUpOrLeave = () => {
  const pressDuration = pressStartRef.current ? Date.now() - pressStartRef.current : 0;

  if (timerRef.current) {
    // timer still exists → short press
    clearTimeout(timerRef.current);
    timerRef.current = null;
    if (pressDuration < 500) addMarker(); // only add once
  }

  setKeyPressed(false);
  pressStartRef.current = null;
};

    return(
        <Box sx={{Width:{md:'40vw', xs:'90vw', sm:'60vw'}}}>
            <Box sx={{display:'flex', alignItems: "center", gap: 1}}>
                <IconButton sx={{"&:focus": {outline: "none",boxShadow: "none"}}} 
                
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUpOrLeave}
                onPointerLeave={handlePointerUpOrLeave}

                color={error?'error':'primary'} >
                    <AddBoxIcon/>
                </IconButton>
                <Box sx={{position: "relative", width: "100%", height: 40 }}>
                    
                    {value.map((v, i) => {
                        if (i % 2 === 1) return null; 
                        const start = value[i];
                        const end = value[i + 1];
                        const duration = videoRef.current?.getDuration() ?? 1;

                        return (
                        <div
                            key={i}
                            style={{
                            top:"25%",
                            position: "absolute",
                            left: `${(start / duration) * 100}%`,
                            width: `${((end - start) / duration) * 100}%`,
                            height: "50%",
                            backgroundColor: (keyPressed)?'rgba(228, 24, 24, 0.63)':'rgba(33, 150, 243, 0.3)',
                            pointerEvents: "none", // allow slider interaction
                            borderRadius: 4,
                            }}
                        />
                        );
                    })}

                    <Slider
                        
                        size="small"
                        track={false}
                        value={value}
                        color= {(keyPressed)? 'error':'primary'}
                        max={videoRef.current?.getDuration() ?? 1}
                        valueLabelDisplay="auto"
                        onChange={handleChange}
                        step={step}
                        disableSwap
                        sx={{ position: "relative", zIndex: 1, p:0 }}
                    />
                    
                </Box>
            </Box>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                {play?(
                <PlayArrowIcon
                    style={{fontSize:'35', cursor:'pointer'}}
                    onClick={handleClick}
                />):(
                    <PauseIcon
                    style={{fontSize:'35', cursor:'pointer'}}
                    onClick={handleClick}
                    />
                )}
                <Slider 
                    
                    value={videoTime}
                    onChange={handleSliderChange}
                    max={videoRef.current?.getDuration() ?? 1}
                    step={.1}
                    sx={(t) => ({
                        color: 'rgba(38, 153, 241, 0.87)',
                        height: 4,
                        '& .MuiSlider-thumb': {
                        width: 15,
                        height: 15,
                        transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                        '&::before': {
                            boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                        },
                        '&:hover, &.Mui-focusVisible': {
                            boxShadow: `0px 0px 0px 8px ${'rgb(0 0 0 / 16%)'}`,
                            ...t.applyStyles('dark', {
                            boxShadow: `0px 0px 0px 8px ${'rgb(255 255 255 / 16%)'}`,
                            }),
                        },
                        '&.Mui-active': {
                            width: 20,
                            height: 20,
                        },
                        },
                        '& .MuiSlider-rail': {
                        opacity: 0.28,
                        },
                        ...t.applyStyles('dark', {
                        color: '#fff',
                        }),
                    })}
                />
                
            </div>
            <Box sx={{display:'flex', justifyContent:'flex-end'}}>
                <Typography >
                    {videoTime.toFixed(1)} sec
                </Typography>
            </Box>
        </Box>
    )
}
export default VideoTimeScale;