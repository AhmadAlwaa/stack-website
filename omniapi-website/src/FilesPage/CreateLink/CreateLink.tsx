const CreateLink=async(file_id:string, fileName:string)=>{
    try{
        const response = await fetch(`http://127.0.0.1:8000/job/generate-link/${file_id}`,{
            method: "GET"
        })
        if (!response.ok) {
            const text = await response.text();
        console.error("failed getting files:", text);
        return null;
        }
        return await response.json();
    }catch (error) {
    console.error("failed connecting to backend when getting files info:", error);
    return null;
  } 
}
export default CreateLink