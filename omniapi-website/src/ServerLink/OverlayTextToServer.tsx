export const OverlayTextToServer = async(file_id:string,text:string, x_pos, y_pos, font_size:string,font:string,color:string,location:string,task_id:string)=>{
    try{
        const formData = new FormData()
        formData.append("file_id", file_id)
        formData.append("text", text)
        formData.append("x_pos", x_pos)
        formData.append("y_pos", y_pos)
        formData.append("font_size", font_size)
        formData.append("font", font)
        formData.append("color", color)
        formData.append("location",location)
        formData.append("task_id",task_id)
        const response = await fetch("http://127.0.0.1:8000/job/overlay/text", {
            method: "POST",
            body: formData,
            });
        if (!response.ok) {
        const text = await response.text();
        console.error("textOverlay failed:", text);
        return null;
        }
        return await response.json();
    }catch(error){
        console.error("Error overlaying text:", error);
        return null;
    }
}