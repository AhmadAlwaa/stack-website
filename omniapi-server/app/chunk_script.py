import os
import sys
import requests

SERVER_URL = "http://127.0.0.1:8000/job"

def upload_chunked(file_path, chunk_size=5 * 1024 * 1024):  # 5MB
    if not os.path.isfile(file_path):
        print("Invalid file path.")
        return

    filename = os.path.basename(file_path)
    file_type = "application/octet-stream"
    file_size = os.path.getsize(file_path)
    num_chunks = (file_size + chunk_size - 1) // chunk_size

    # Step 1: Initialize upload
    init_resp = requests.get(
        f"{SERVER_URL}/upload/chunk",
        json={"filename": filename, "type": file_type, "num_chunks": num_chunks}
    )
    if init_resp.status_code != 200:
        print("Failed to initialize chunked upload:", init_resp.text)
        return

    file_id = init_resp.json()["id"]
    print(f"Upload ID: {file_id}")

    # Step 2: Upload chunks
    with open(file_path, "rb") as f:
        for i in range(1, num_chunks + 1):
            chunk_data = f.read(chunk_size)
            resp = requests.post(
                f"{SERVER_URL}/upload/chunk/{file_id}/{i}",
                files={"chunk": ("chunk", chunk_data)}
            )
            if resp.status_code != 200:
                print(f"Failed to upload chunk {i}:", resp.text)
                return
            print(f"Uploaded chunk {i}/{num_chunks}")

    print("File uploaded in chunks successfully")
    resp = requests.post(
            f"{SERVER_URL}/stitch/{file_id}",
        )
    if resp.status_code != 200:
        print(f"Failed to stitch", resp.text)
        return
    else:
        print("Successfully stitched file.")

# Run from command line
if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python upload_chunked.py <file_path>")
    else:
        upload_chunked(sys.argv[1])
        