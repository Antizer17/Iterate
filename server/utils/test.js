async function getCompanyInterviewData() {
  try {
    const rawUrl = "https://api.github.com/repos/TamimEhsan/interview-questions-bangladesh/contents/docs/companies";
    const response = await fetch(rawUrl);
    
    if (!response.ok) throw new Error("Failed to fetch markdown file");
    
    const markdownText = await response.text();
    console.log(markdownText); // This will be clean, raw Markdown string
    return markdownText;
  } catch (error) {
    console.error("Error loading markdown:", error);
  }
}
getCompanyInterviewData()