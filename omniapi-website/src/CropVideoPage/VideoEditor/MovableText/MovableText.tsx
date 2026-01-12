"use client"
import { useState, useEffect, useRef } from "react";
import Draggable from 'react-draggable';
import { getLineHeight } from "./LineHeight";

// Keep your exact Types
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
  
  // React-Draggable requires a ref for the element it drags
  const nodeRef = useRef<HTMLDivElement>(null);

  // ------------------------------------------------------------------
  // 1. EXACT FONT SIZE CALCULATION (Preserved from your code)
  // ------------------------------------------------------------------
  const calculateFontSize = () => {
     const ratioX = dimensions.width / videoRatio.width;
     const ratioY = dimensions.height / videoRatio.height;
     // This math matches your original Konva logic exactly
     return Math.round(textProp.fontSize * Math.min(ratioX, ratioY));
  };
  const currentFontSize = calculateFontSize();

  // ------------------------------------------------------------------
  // 2. MEASURE TEXT SIZE (Replaces Konva's auto-measurement)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (nodeRef.current) {
      const width = nodeRef.current.offsetWidth;
      const height = nodeRef.current.offsetHeight;

      // Only update if dimensions differ to prevent infinite loops
      if (width !== textProp.textWidth || height !== textProp.textHeight) {
        setTextProp((prev) => ({
          ...prev,
          textWidth: width,
          textHeight: height,
        }));
      }
    }
  }, [
    textProp.text, 
    currentFontSize, 
    textProp.fontFamily,
    // Add these dependencies to ensure we remeasure if the window resizes
    dimensions.width, 
    dimensions.height 
  ]);

  // ------------------------------------------------------------------
  // 3. HANDLERS
  // ------------------------------------------------------------------
  const handleStop = (_e: any, data: { x: number; y: number }) => {
    setTextProp((prev) => ({ ...prev, x: data.x, y: data.y }));
  };

  const finishEditing = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent) => {
    // If triggered by Enter key or Blur, save and close
    const target = e.target as HTMLInputElement;
    setTextProp((prev) => ({ ...prev, text: target.value }));
    setIsEditing(false);
  };

  return (
    <div
      style={{
        position: "absolute",
        width: dimensions.width,
        height: dimensions.height,
        top: 0,
        left: 0,
        zIndex: 20, // High z-index to sit on top
        pointerEvents: "none", // <--- KEY: Allows clicks to pass through empty space
        overflow: "hidden", // Clips text if it goes outside the video area
      }}
    >
      <Draggable
        nodeRef={nodeRef}
        position={{ x: textProp.x, y: textProp.y }}
        onStop={handleStop}
        disabled={isEditing}
        // "bounds='parent'" automatically handles the clamping logic 
        // that you were doing manually with Math.min/Math.max
        bounds="parent" 
      >
        <div
          ref={nodeRef}
          onDoubleClick={() => setIsEditing(true)}
          style={{
            position: "absolute",
            display: "inline-block", // Wraps tightly around the text
            cursor: isEditing ? "text" : "move",
            pointerEvents: "auto", // <--- KEY: Re-enables clicking JUST for the text
            
            // Apply your styles
            fontSize: currentFontSize,
            fontFamily: textProp.fontFamily,
            color: textProp.fill,
            lineHeight: getLineHeight(textProp.fontFamily) || 1, 
            whiteSpace: "nowrap", // Prevents text from wrapping to next line
            userSelect: "none",
            
            // Visual helper: dashed box when editing
            border: isEditing ? "1px dashed rgba(255,255,255,0.5)" : "1px solid transparent",
            padding: "2px", // Slight padding for easier grabbing
          }}
        >
          {isEditing ? (
            <input
              autoFocus
              defaultValue={textProp.text}
              onBlur={finishEditing}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishEditing(e);
                e.stopPropagation(); // Stop event bubbling
              }}
              style={{
                // Styles to make the input look exactly like the text
                background: "transparent",
                color: "inherit",
                border: "none",
                outline: "none",
                font: "inherit",
                padding: 0,
                margin: 0,
                // Simple hack to make input width grow with text
                minWidth: `${Math.max(textProp.text.length, 1)}ch` 
              }}
            />
          ) : (
            textProp.text
          )}
        </div>
      </Draggable>
    </div>
  );
};

export default EditableText;