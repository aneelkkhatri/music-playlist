let allVideos = [];
let filteredVideos = [];
let currentIndex = 0;
const batchSize = 10;
const container = document.getElementById('playlist');
const filterBar = document.getElementById('filter-bar');

// Get query parameter from URL
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}
const showEmbed = getQueryParam('embed') === 'true'; // default is false
const playlistFile = getQueryParam('file');

function renderNextBatch() {
  const nextVideos = filteredVideos.slice(currentIndex, currentIndex + batchSize);
  nextVideos.forEach(video => {
    const div = document.createElement('div');
    div.className = 'video';
    if (showEmbed) {
      div.innerHTML = `
        <div class="video-info">
          <span class="video-title">${video.title}</span>
          <span class="video-channel">${video.channel || ''}</span>
          <a class="video-url" href="https://www.youtube.com/watch?v=${video.id}" target="_blank">Watch on YouTube</a>
        </div>
        <iframe width="160" height="90" src="https://www.youtube.com/embed/${video.id}?autoplay=1" frameborder="0" allowfullscreen allow="autoplay"></iframe>
      `;
    } else {
      div.innerHTML = '';
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.flexDirection = 'row';
      row.style.alignItems = 'center';
      row.style.gap = '1.5em';
      // Image
      const img = document.createElement('img');
      img.className = 'thumb-non-square';
      img.src = video.thumbnails[0].url;
      img.alt = video.title;
      // Info
      const info = document.createElement('div');
      info.className = 'video-info';
      info.innerHTML = `
        <span class="video-title">${video.title}</span>
        <a class="channel-url" href="https://www.youtube.com/channel/${video.channel_id}" target="_blank"><span class="video-channel">${video.channel || ''}</span></a>
        <a class="video-url" href="https://www.youtube.com/watch?v=${video.id}" target="_blank">Watch on YouTube</a>
      `;
      row.appendChild(img);
      row.appendChild(info);
      div.appendChild(row);
      // Add click event to thumbnail to embed video below row
      img.addEventListener('click', function() {
        const existing = div.querySelector('iframe');
        if (existing) {
          existing.remove();
        } else {
          const iframe = document.createElement('iframe');
          iframe.height = 300;
          iframe.src = `https://www.youtube.com/embed/${video.id}?autoplay=1`;
          iframe.frameBorder = '0';
          iframe.allowFullscreen = true;
          iframe.allow = 'autoplay';
          iframe.style.display = 'block';
          iframe.style.marginTop = '1em';
          iframe.style.borderRadius = '14px';
          iframe.style.boxShadow = '0 2px 12px #00bfae44, 0 1px 4px #0006';
          div.appendChild(iframe);
        }
      });
    }
    container.appendChild(div);
  });
  currentIndex += batchSize;
}

function resetAndRender() {
  container.innerHTML = '';
  currentIndex = 0;
  renderNextBatch();
  fillViewportIfNeeded();
}

function fillViewportIfNeeded() {
  // Load more batches if not enough content to fill viewport
  setTimeout(() => {
    while (currentIndex < filteredVideos.length && document.body.offsetHeight < window.innerHeight) {
      renderNextBatch();
    }
  }, 0);
}

function handleScroll() {
  if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
    if (currentIndex < filteredVideos.length) {
      renderNextBatch();
    }
  }
}

fetch(playlistFile)
  .then(response => response.json())
  .then(data => {
    allVideos = data.entries;
    filteredVideos = allVideos;
    renderNextBatch();
    fillViewportIfNeeded();
    window.addEventListener('scroll', handleScroll);
    if (filterBar) {
      filterBar.addEventListener('input', function() {
        const query = filterBar.value.trim().toLowerCase();
        filteredVideos = allVideos.filter(v => v.title && v.title.toLowerCase().includes(query));
        resetAndRender();
      });
    }
  });
