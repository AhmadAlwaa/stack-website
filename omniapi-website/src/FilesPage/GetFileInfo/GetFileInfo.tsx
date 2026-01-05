const GetFileInfo=async(link:string)=>{
    try{
        const response = await fetch(`http://127.0.0.1:8000/job/fileInfo/${link}`,{
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
export default GetFileInfo