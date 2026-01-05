import {CardMedia,Card, Box, CardActionArea} from '@mui/material';
import { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react';
type Props={
    file:File
    overlayImage: File | null
    setDimensions: React.Dispatch<React.SetStateAction<{width: number, height:number}>>;
    muted: boolean;
    setVideoRatio: React.Dispatch<React.SetStateAction<{width: number, height:number}>>;

}

export type VideoHandle = {
    setTime: (time:number) => void;
    play:() => void;
    pause:() => void;
    getDuration:() => number;
    getCurrentTime:() => number;

}
const Video=forwardRef<VideoHandle,Props>(({file,overlayImage, setDimensions, muted, setVideoRatio},ref)=>{
    const [videoURL, setVideoURL] = useState<string>("")
    const videoRef = useRef<HTMLVideoElement>(null);
    const [imageURL, setImageURL] = useState<string>("")
    const divRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref,() => ({
        setTime(time:number) {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
            }
        },
        play() {
            if (videoRef.current) {
                videoRef.current.play();
                
            }
        },
        pause() {
            if (videoRef.current) {
                videoRef.current.pause();
            }
        },
        getDuration:()=> videoRef.current?.duration ||0,
        getCurrentTime:()=> videoRef.current?.currentTime ||0,
        videoRef,

    }))
    useEffect(() => {
      if (!file || !videoRef.current) return;

      const url = URL.createObjectURL(file);
      setVideoURL(url);

      const video = videoRef.current

      const handleLoadedMetadata = () => {
          const videoWidth = video.videoWidth;
          const videoHeight = video.videoHeight;
          if (divRef.current) {
              const { width, height } = divRef.current.getBoundingClientRect();
              setDimensions({ width, height });
          }

          setVideoRatio({ width: Math.round(videoWidth), height: Math.round(videoHeight) });
      };

      video.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        URL.revokeObjectURL(url);
      };
    }, [file]);
    useEffect(() => {
      if (!overlayImage) {
        const video = videoRef.current;
        if (!video) return;
        setDimensions({width: video.width , height: video.height})
        return
      }
      const url = URL.createObjectURL(overlayImage)
      setImageURL(url);
      const img = new Image()
      img.onload = () => {
          setDimensions({width: img.width,  height: img.height})
          console.log("Image size:", img.width, img.height)
          URL.revokeObjectURL(url)
      }
      img.src = url; 
      return () => {
          URL.revokeObjectURL(url);
      };
      }, [overlayImage])


    useEffect(() => {
      const updateSize = () => {
          changeSize()
      };

      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
      }, []);

    const changeSize = () =>{
      if (divRef.current) {
      const { width, height } = divRef.current.getBoundingClientRect();
      setDimensions({width:width, height:height})
      }
    }
    return (
    <Card
      ref={divRef}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        maxWidth: {md:"50vw", sm:'40vw', xs:'95vw'},
        maxHeight: "65vh", // never taller than 80% of viewport
        overflow: "hidden",
        backgroundColor: 'rgba(17, 34, 51, 0)'
      }}
    >
  {overlayImage ? (
    <CardActionArea >
      <CardMedia
        component="img"
        image={imageURL}
        sx={{
          maxWidth: "100%",   // scale down if too wide
          maxHeight: "80vh",  // scale down if too tall
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",   // center horizontally
        }}
      />
    </CardActionArea>
  ) : (
    <CardActionArea disableRipple disableTouchRipple  sx={{'&:focus': { outline: 'none' },
      '&.Mui-focusVisible': { outline: 'none' },
      cursor:'default'
      }}>
      <CardMedia
        component="video"
        src={videoURL}
        ref={videoRef}
        disablePictureInPicture
        muted = {muted}
        sx={{
          maxWidth: "100%",
          maxHeight: "80vh",
          width: "auto",
          height: "auto",
          objectFit: "contain",
          display: "block",
          margin: "0 auto",
        }}
      />
    </CardActionArea>
  )}
</Card>
    )
})

export default Video