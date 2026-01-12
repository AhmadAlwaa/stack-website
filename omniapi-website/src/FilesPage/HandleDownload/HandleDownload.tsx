import { ConvertBlob } from "../../DownloadPage/DownloadTable/DownloadProgressBar/blob/convertBlob"
import { GetFileFromServer } from "../../ServerLink/getFileFromServer"

const HandleDownload = async(file_id:string, file_name:string,location:string)=>{
    const response = await GetFileFromServer(file_id,location)
    if (!response) {
        return false
    }
    const blob = await response.blob()
    ConvertBlob(blob, file_name)
}
export default HandleDownload