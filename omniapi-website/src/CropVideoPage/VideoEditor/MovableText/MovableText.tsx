"use client"
import { Stage, Layer, Text, Rect } from "react-konva";
import { useState, useEffect, useRef } from "react";
import {Box, Typography} from '@mui/material'
// Import Konva types for the ref
import { Text as KonvaText } from "konva/lib/shapes/Text";
import { X } from "@mui/icons-material";
import { getLineHeight } from "./LineHeight";
type Props = {
  dimensions: { width: number; height: number };
  videoRatio: { width: number; height: number };
  textProp: {
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    x: number;
    y: number;
    textWidth: number;
    textHeight: number;
  };
  setTextProp: React.Dispatch<
    React.SetStateAction<{
      text: string;
      fontSize: number;
      fontFamily: string;
      fill: string;
      x: number;
      y: number;
      textWidth: number;
      textHeight: number;
    }>
  >;
};

const EditableText = ({ dimensions, textProp, setTextProp, videoRatio }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [prevDimension, setPrevDimension] = useState(dimensions)
  // Use the specific KonvaText type for the ref
  const textRef = useRef<KonvaText>(null);
  const [localText, setLocalText] = useState({
    x: textProp.x,
    y: textProp.y,
    text: 'text',
    fontSize:
      textProp.fontSize *
      Math.min(dimensions.width / videoRatio.width, dimensions.height / videoRatio.height),
    fontFamily: textProp.fontFamily,
    fill: textProp.fill,
  });

  // Sync props into local state
  useEffect(() => {
    const ratioX = dimensions.width / videoRatio.width
    const ratioY =  dimensions.height / videoRatio.height
    const node = textRef.current;
    const textWidth = node?.width()
    const textHeight = node?.height()
    const newX = Math.min(
        Math.max(localText.x, - textWidth/2),            // left bound
        dimensions.width - textWidth/2        // right bound
      );

    const newY = Math.min(
      Math.max(localText.y, -textHeight/2),            // top bound
      dimensions.height - textHeight/2        // bottom bound
    );
    console.log(textProp.fontSize,Math.round(textProp.fontSize  *
        Math.min(ratioX, ratioY)))
    setLocalText((prev)=>({...prev,
      x:newX,
      y:newY,
      fontSize:
        Math.round(textProp.fontSize *
        Math.min(ratioX, ratioY)),
      fontFamily: textProp.fontFamily,
      fill: textProp.fill,
    }));
    if (prevDimension.width !== dimensions.width || prevDimension.height !== dimensions.height) {
    setPrevDimension({ width: dimensions.width, height: dimensions.height });
  }
  }, [textProp, dimensions, videoRatio]); 
  useEffect(()=>{
    setLocalText((prev)=>({...prev, x: textProp.x, y:textProp.y}))
  },[textProp.x || textProp.y])
  useEffect(() => { 
    if (textRef.current) {
      const box = textRef.current
       setTextProp((prev) => 
        ({ ...prev, 
          textWidth: box.width(),
           textHeight: box.height()
          })) } },
            [localText.fontSize, localText.text, localText.fontFamily]);
  const handleDbl = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const finishEditing = () => {
    setLocalText((prev) => ({ ...prev, text: inputRef.current?.value || prev.text }));
    setTextProp((prev)=>({...prev, text: inputRef.current?.value || prev.text}))
    setIsEditing(false);
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "auto" }}
      >
        

        
        <Layer>
          {!isEditing && (
            
            <Text
              lineHeight={getLineHeight(localText.fontFamily)}
              ref={textRef}
              {...localText}
              draggable
              dragBoundFunc={(pos) => {
                const node = textRef.current;
                if (!node) {
                  return pos;
                }

                const stageWidth = dimensions.width;
                const stageHeight = dimensions.height;

                // Get the actual rendered width and height of the text
                const textWidth = node.width();
                const textHeight = node.height();

                // Clamp the X position
                const newX = Math.max(
                  0 - textWidth/2, // Minimum X (left bound)
                  Math.min(pos.x, stageWidth - textWidth + textWidth/2) // Maximum X (right bound)
                );

                // Clamp the Y position
                const newY = Math.max(
                  0 - textHeight/2, // Minimum Y (top bound)
                  Math.min(pos.y, stageHeight - textHeight + textHeight /2) // Maximum Y (bottom bound)
                );

                // Return the clamped position
                return {
                  x: newX,
                  y: newY,
                };
              }}
              onDblClick={handleDbl}
              onDblTap={handleDbl}
              onDragEnd={(e) => {
                const x = e.target.x();
                const y = e.target.y();
                setLocalText((p) => ({ ...p, x, y }));
                setTextProp((p) => ({ ...p, x, y }));
              }}
            />
            
          )}
        </Layer>
      </Stage>
      <Box sx={{position:'absolute' ,border:'solid 2px red', zIndex:100, left:localText.x, top:localText.y, width:textRef.current?.width(), height: textRef.current?.height()}}/>
      {isEditing && (
        <input
          ref={inputRef}
          defaultValue={localText.text}
          style={{
            position: "absolute",
            top: localText.y,
            left: localText.x,
            fontSize: localText.fontSize,
            fontFamily: localText.fontFamily,
            color: localText.fill,
            background: "transparent",
            border: "none",
            outline: "none",
            zIndex: 10,
            // Ensure the input has pointer events
            pointerEvents: "auto",
          }}
          onBlur={finishEditing}
          onKeyDown={(e) => {
            if (e.key === "Enter") finishEditing();
            if (e.key === "Backspace") {
                e.stopPropagation();
              }
          }}
        />
      )}
    </div>
  );
};

export default EditableText;