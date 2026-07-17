import ollama from 'ollama';

// 1. Refine messy topic using Local Ollama
async function refineTopicWithOllama(topic) {
  const prompt = `
You are an expert software engineering editor.

I will give you a messy developer confusion note from a learning vault.

Your job:
1. Convert it into a clean professional technical title.
2. Explain the underlying engineering concept in one sentence.
3. Create a YouTube search query optimized for finding tutorials.

Return ONLY valid JSON.

Format:
{
  "cleanTitle": "",
  "coreConcept": "",
  "searchQuery": ""
}

Raw Topic:
"${topic}"
`;

  try {
    const response = await ollama.generate({
      model: 'qwen2.5-coder:7b',
      prompt,
      format: 'json',
      options: {
        temperature: 0.2
      }
    });

    return JSON.parse(response.response.trim());

  } catch (error) {
    console.error(
      `Ollama refinement failed for "${topic}":`,
      error.message
    );

    return {
      cleanTitle: topic,
      coreConcept: 'Technical software development concept.',
      searchQuery: `${topic} tutorial`
    };
  }
}


// 2. Search YouTube without API key / billing
async function searchYouTubeVideo(query, limit = 3) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) {
      throw new Error(`YouTube responded ${res.status}`);
    }

    const html = await res.text();

    // 1. Find all occurrences of videoId blocks in the HTML data array
    // This regex looks for the videoId and non-greedily finds its surrounding metadata
    const videoBlockRegex = /"videoId":"([^"]+)"[\s\S]{1,1000}?"title":\{"runs":\[\{"text":"([^"]+)"/g;
    
    const matches = [...html.matchAll(videoBlockRegex)];
    const videos = [];
    const seenIds = new Set(); // To prevent duplicate links from different UI components

    for (const match of matches) {
      if (videos.length >= limit) break;

      const videoId = match[1];
      const title = match[2];

      // Skip channels, playlists, or duplicates that accidentally match the pattern
      if (seenIds.has(videoId) || videoId.length !== 11) continue;
      
      seenIds.add(videoId);

      videos.push({
        title: title,
        url: `https://www.youtube.com/watch?v=${videoId}`
      });
    }

    // Fallback if the combined block regex misses due to UI changes
    if (videos.length === 0) {
      const singleIdMatch = html.match(/"videoId":"([^"]+)"/);
      if (singleIdMatch) {
        videos.push({
          title: "YouTube Tutorial",
          url: `https://www.youtube.com/watch?v=${singleIdMatch[1]}`
        });
      }
    }

    return videos.length > 0 ? videos : null;

  } catch (error) {
    console.error(`Youtube failed for "${query}":`, error.message);
    return null;
  }
}

// 3. Main Pipeline
async function processConfuseVault(vaultItem) {

  const results = [];

  console.log(
    `🚀 Starting YouTube pipeline for ${vaultItem} vault topic...\n`
  );


  console.log(
      `Parsing raw text: "${vaultItem}"...`
    );


    // AI cleanup
    const refined =
      await refineTopicWithOllama(vaultItem);


    console.log(
      `   ✨ Ollama Refined -> "${refined.cleanTitle}"`
    );


    console.log(
      `   🔍 Searching YouTube for "${refined.searchQuery}"`
    );


    const videoResource =
      await searchYouTubeVideo(
        refined.searchQuery
      );


    results.push({

      originalTitle: vaultItem,

      cleanTitle:
        refined.cleanTitle,

      coreConcept:
        refined.coreConcept,

      bestYouTubeVideos:
        videoResource

    });


    console.log(
      `   ✅ Successfully resolved video link.\n`
    );
    return results[0]['bestYouTubeVideos'];
  }





// --- Test ---
// const topic = 'Binary Search'


// const result = await processConfuseVault(topic)
// console.log(`RESULTS:-`,result)
// console.log(result[0])
export default processConfuseVault;