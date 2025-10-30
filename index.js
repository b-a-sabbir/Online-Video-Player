

document.addEventListener('DOMContentLoaded', () => {
  // === DOM Element References ===
  const videoPlayerContainer = document.getElementById('video-player-container');
  const video = document.getElementById('video-element');
  const welcomeScreen = document.getElementById('welcome-screen');
  const selectFolderButton = document.getElementById('select-folder-button');
  const fileInput = document.getElementById('file-input');
  const playlistSidebar = document.getElementById('playlist-sidebar');
  const playlistList = document.getElementById('playlist-list');
  const controlsContainer = document.getElementById('controls-container');
  const clickOverlay = document.getElementById('click-overlay');
  
  // Controls
  const progressBar = document.getElementById('progress-bar');
  const prevButton = document.getElementById('prev-button');
  const playPauseButton = document.getElementById('play-pause-button');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const nextButton = document.getElementById('next-button');
  const muteButton = document.getElementById('mute-button');
  const volumeSlider = document.getElementById('volume-slider');
  const currentTimeDisplay = document.getElementById('current-time');
  const durationDisplay = document.getElementById('duration');
  const playbackRateDisplay = document.getElementById('playback-rate-display');
  const playbackRateSlider = document.getElementById('playback-rate-slider');
  const playlistToggleButton = document.getElementById('playlist-toggle-button');
  const fullscreenButton = document.getElementById('fullscreen-button');
  const fullscreenEnterIcon = document.getElementById('fullscreen-enter-icon');
  const fullscreenExitIcon = document.getElementById('fullscreen-exit-icon');

  // Indicators
  const playPauseIndicator = document.getElementById('play-pause-indicator');
  const seekIndicator = document.getElementById('seek-indicator');
  const volumeIndicator = document.getElementById('volume-indicator');
  const speedIndicator = document.getElementById('speed-indicator');

  // === SVG Icons ===
  const ICONS = {
    play: `<svg class="w-16 h-16 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
    pause: `<svg class="w-16 h-16 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
    volume: {
      high: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
      medium: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`,
      low: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>`,
      mute: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`,
    }
  };

  // === State Variables ===
  let playlist = [];
  let currentVideoIndex = 0;
  let controlsTimeout = null;
  let indicatorTimeouts = { volume: null, seek: null, playPause: null };
  
  // State for keyboard shortcuts
  let spacebarTimeout = null;
  let isHoldAction = false;
  let preHoldState = { isPlaying: false, playbackRate: 1 };

  // === Functions ===

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const totalSeconds = Math.floor(timeInSeconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return hours > 0 ? `${hours}:${formattedMinutes}:${formattedSeconds}` : `${formattedMinutes}:${formattedSeconds}`;
  };
  
  const showIndicator = (element, duration, content) => {
    const key = Object.keys(indicatorTimeouts).find(k => element.id.includes(k));
    if (key && indicatorTimeouts[key]) clearTimeout(indicatorTimeouts[key]);
    if (content) element.innerHTML = content;
    element.classList.remove('opacity-0');
    indicatorTimeouts[key] = setTimeout(() => element.classList.add('opacity-0'), duration);
  };
  
  const resetControlsTimeout = () => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    controlsContainer.classList.remove('opacity-0', 'pointer-events-none');
    videoPlayerContainer.style.cursor = 'default';

    controlsTimeout = setTimeout(() => {
      if (!video.paused) {
        controlsContainer.classList.add('opacity-0', 'pointer-events-none');
        videoPlayerContainer.style.cursor = 'none';
      }
    }, 3000);
  };

  const updatePlayPauseIcon = (playing) => {
    if (playing) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
    }
  };

  const updateVolumeIcon = () => {
      const { volume, muted } = video;
      let icon;
      if (muted || volume === 0) icon = ICONS.volume.mute;
      else if (volume < 0.33) icon = ICONS.volume.low;
      else if (volume < 0.66) icon = ICONS.volume.medium;
      else icon = ICONS.volume.high;
      muteButton.innerHTML = icon;
      volumeIndicator.innerHTML = `${icon} <span class="text-xl font-bold">${Math.round(muted ? 0 : volume * 100)}%</span>`;
  };

  const togglePlay = (suppressIndicator = false) => {
    if (video.paused) {
      video.play();
      if (!suppressIndicator) showIndicator(playPauseIndicator, 500, ICONS.play);
    } else {
      video.pause();
      if (!suppressIndicator) showIndicator(playPauseIndicator, 500, ICONS.pause);
    }
  };

  const seek = (amount) => {
    video.currentTime += amount;
    seekIndicator.innerHTML = amount > 0 ? `<span>+10 &gt;</span>` : `<span>&lt; -10</span>`;
    if (amount > 0) {
        seekIndicator.classList.remove('left-16');
        seekIndicator.classList.add('right-16');
    } else {
        seekIndicator.classList.remove('right-16');
        seekIndicator.classList.add('left-16');
    }
    showIndicator(seekIndicator, 800);
  };

  const adjustVolume = (amount) => {
    const newVolume = Math.max(0, Math.min(1, video.volume + amount));
    video.volume = newVolume;
    if (newVolume > 0 && video.muted) video.muted = false;
    showIndicator(volumeIndicator, 1200);
  };
  
  const toggleMute = () => video.muted = !video.muted;
  
  const setPlaybackRate = (rate) => video.playbackRate = rate;

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      videoPlayerContainer.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  const renderPlaylist = () => {
    playlistList.innerHTML = '';
    playlist.forEach((file, index) => {
      const li = document.createElement('li');
      li.className = `flex items-center gap-3 p-3 cursor-pointer border-b border-gray-800 transition-colors ${
        currentVideoIndex === index ? 'bg-indigo-600' : 'hover:bg-gray-700'
      }`;
      li.onclick = () => loadVideo(index);
      
      const icon = currentVideoIndex === index
        ? `<svg class="w-5 h-5 text-white flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z" clip-rule="evenodd" /></svg>`
        : `<span class="text-gray-500 font-mono w-5 text-center flex-shrink-0">${index + 1}</span>`;
      
      li.innerHTML = `${icon}<span class="truncate text-sm">${file.name}</span>`;
      playlistList.appendChild(li);
    });
  };

  const loadVideo = (index) => {
    if (index < 0 || index >= playlist.length) return;
    currentVideoIndex = index;
    const file = playlist[index];
    const url = URL.createObjectURL(file);
    video.src = url;
    video.play();
    renderPlaylist();
  };
  
  const playNext = () => loadVideo((currentVideoIndex + 1) % playlist.length);
  const playPrev = () => loadVideo((currentVideoIndex - 1 + playlist.length) % playlist.length);

  const processFiles = (files) => {
    if (files.length > 0) {
      playlist = files;
      welcomeScreen.classList.add('hidden');
      videoPlayerContainer.classList.remove('hidden');
      playlistSidebar.classList.remove('hidden');
      loadVideo(0);
    } else {
      alert('No compatible video files found in the selected directory.');
    }
  };
  
  const handleDirectoryPicker = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const filePromises = [];
      for await (const entry of dirHandle.values()) {
        if (entry.kind === 'file') {
          filePromises.push(entry.getFile());
        }
      }
      
      const allFiles = await Promise.all(filePromises);
      
      const videoFiles = allFiles
        .filter(file => ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      processFiles(videoFiles);

    } catch (err) {
      // Handle security errors in sandboxed environments (like iframes)
      if (err.name === 'SecurityError') {
        console.warn('showDirectoryPicker failed due to security restrictions. Falling back to legacy input.');
        fileInput.click();
      } else if (err.name !== 'AbortError') { // AbortError means the user cancelled the picker
        console.error('Error selecting directory:', err);
        alert('Could not access the directory. Please ensure you grant permission.');
      }
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
        .filter(file => ['video/mp4', 'video/webm', 'video/ogg'].includes(file.type))
        .sort((a, b) => a.name.localeCompare(b.name));
      processFiles(files);
    }
  };
  
  // === Event Listeners ===
  selectFolderButton.addEventListener('click', () => {
    if ('showDirectoryPicker' in window) {
      handleDirectoryPicker();
    } else {
      console.log('showDirectoryPicker not supported, using legacy file input.');
      fileInput.click();
    }
  });
  fileInput.addEventListener('change', handleFileInputChange);

  // Video Events
  video.addEventListener('play', () => updatePlayPauseIcon(true));
  video.addEventListener('pause', () => {
    updatePlayPauseIcon(false);
    resetControlsTimeout(); // Show controls when paused
  });
  video.addEventListener('ended', playNext);
  video.addEventListener('timeupdate', () => {
    progressBar.value = video.currentTime;
    currentTimeDisplay.textContent = formatTime(video.currentTime);
  });
  video.addEventListener('loadedmetadata', () => {
    progressBar.max = video.duration;
    durationDisplay.textContent = formatTime(video.duration);
  });
  video.addEventListener('volumechange', updateVolumeIcon);
  video.addEventListener('ratechange', () => {
    playbackRateSlider.value = video.playbackRate;
    playbackRateDisplay.textContent = `${video.playbackRate.toFixed(2)}x`;
  });

  // Controls Events
  clickOverlay.addEventListener('click', () => togglePlay());
  playPauseButton.addEventListener('click', () => togglePlay());
  prevButton.addEventListener('click', playPrev);
  nextButton.addEventListener('click', playNext);
  progressBar.addEventListener('input', (e) => video.currentTime = e.target.value);
  muteButton.addEventListener('click', toggleMute);
  volumeSlider.addEventListener('input', (e) => {
    video.muted = false;
    video.volume = e.target.value;
  });
  playbackRateSlider.addEventListener('input', (e) => video.playbackRate = e.target.value);
  fullscreenButton.addEventListener('click', toggleFullScreen);
  playlistToggleButton.addEventListener('click', () => {
    playlistSidebar.classList.toggle('hidden');
  });

  // Controls Visibility
  videoPlayerContainer.addEventListener('mousemove', resetControlsTimeout);
  videoPlayerContainer.addEventListener('mouseleave', () => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (!video.paused) {
        controlsContainer.classList.add('opacity-0', 'pointer-events-none');
        videoPlayerContainer.style.cursor = 'none';
    }
  });

  // Fullscreen change
  document.addEventListener('fullscreenchange', () => {
    const isFullScreen = !!document.fullscreenElement;
    fullscreenEnterIcon.classList.toggle('hidden', isFullScreen);
    fullscreenExitIcon.classList.toggle('hidden', !isFullScreen);
    playlistToggleButton.classList.toggle('hidden', isFullScreen);
  });
  
  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Ignore keyboard shortcuts if focus is on an input element
    if (e.target.tagName === 'INPUT') return;

    switch (e.key.toLowerCase()) {
      case 'k': e.preventDefault(); togglePlay(); break;
      case ' ':
        e.preventDefault();
        if (spacebarTimeout || isHoldAction) return; // Prevent multiple triggers
        // Set a timeout to check for a "hold" action
        spacebarTimeout = setTimeout(() => {
          isHoldAction = true;
          preHoldState = { isPlaying: !video.paused, playbackRate: video.playbackRate };
          if (preHoldState.playbackRate < 2) setPlaybackRate(2);
          showIndicator(speedIndicator, 999999);
          video.play();
          spacebarTimeout = null; // Clear the timeout
        }, 250);
        break;
      case 'j': case 'arrowleft': e.preventDefault(); seek(-10); break;
      case 'l': case 'arrowright': e.preventDefault(); seek(10); break;
      case 'arrowup': e.preventDefault(); adjustVolume(0.1); break;
      case 'arrowdown': e.preventDefault(); adjustVolume(-0.1); break;
      case 'm': e.preventDefault(); toggleMute(); break;
      case 'f': e.preventDefault(); toggleFullScreen(); break;
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.key === ' ') {
      e.preventDefault();
      if (spacebarTimeout) { // This means it was a quick "tap"
        clearTimeout(spacebarTimeout);
        spacebarTimeout = null;
        togglePlay();
      } else if (isHoldAction) { // This means it was a "hold" that is now released
        speedIndicator.classList.add('opacity-0');
        setPlaybackRate(preHoldState.playbackRate);
        if (!preHoldState.isPlaying) video.pause(); // Revert to original playing state
        isHoldAction = false;
      }
    }
  });
  
  // Initial setup
  updateVolumeIcon();
  resetControlsTimeout();
});