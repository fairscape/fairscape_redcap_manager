const downloadFile = (data, filename, onDownloadComplete) => {
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode.removeChild(link);

  // Store the downloaded file in the filesystem
  const fileData = new Uint8Array(
    data.split("").map((char) => char.charCodeAt(0))
  );
  window.fs
    .writeFile(filename, fileData)
    .then(() => {
      onDownloadComplete(filename);
    })
    .catch((error) => {
      console.error("Error saving file:", error);
    });
};
