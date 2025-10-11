// This script loads all playlist JSON files in the 'playlists' folder and displays them as clickable links
// Assumes playlist files are named as playlists/<id>.json

const listContainer = document.getElementById('playlist-list');

// Helper to fetch all playlist files
async function fetchPlaylistFiles() {
  // Try to get the list of files from a manifest, or fallback to a hardcoded list
  // If you want to automate, generate a playlists.json manifest in your sync script
  const manifestUrl = 'playlists.json';
  try {
    const resp = await fetch(manifestUrl);
    if (!resp.ok) throw new Error('No manifest');
    return await resp.json(); // [{id, title, ...}]
  } catch {
    // Fallback: hardcoded list (update as needed)
    return [
      // Example:
      // { id: 'PLsb3AAnDkrPCSfigMKaIAVnb6wzl56l8c', title: 'masti-songs' }
    ];
  }
}

function renderPlaylists(playlists) {
  listContainer.innerHTML = '';
  if (!playlists.length) {
    listContainer.innerHTML = '<div style="text-align:center; color:#b3b3b3;">No playlists found.</div>';
    return;
  }
  playlists.forEach(pl => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    // Thumbnail
    const thumb = document.createElement('img');
    thumb.onclick = () => {
      window.location.href = `index.html?file=playlists/${pl.id}.json`;
    };
    thumb.className = 'playlist-thumb';
    thumb.src = pl.thumbnails && pl.thumbnails[0] ? pl.thumbnails[0].url : '';
    thumb.alt = pl.title;
    // Info
    const info = document.createElement('div');
    info.className = 'playlist-info';
    info.innerHTML = `<div class="playlist-title">${pl.title}</div>
      <a class="channel-url" href="https://www.youtube.com/channel/${pl.channel_id}" target="_blank"><span class="video-channel">${pl.channel}</span></a>
      <a class="playlist-url" href="https://www.youtube.com/playlist?list=${pl.id}" target="_blank">${pl.id}</a>
      `;
    item.appendChild(thumb);
    item.appendChild(info);
    listContainer.appendChild(item);
  });
}

fetchPlaylistFiles()
  .then(async files => {
    // If manifest only has ids, fetch each playlist file for details
    if (files.length && !files[0].title) {
      const details = await Promise.all(files.map(async f => {
        try {
          const resp = await fetch(`playlists/${f.id}.json`);
          if (!resp.ok) return null;
          const data = await resp.json();
          return { id: f.id, title: data.title, thumbnails: data.thumbnails, channel: data.channel, channel_id: data.channel_id  };
        } catch {
          return null;
        }
      }));
      renderPlaylists(details.filter(Boolean));
    } else {
      renderPlaylists(files);
    }
  });
