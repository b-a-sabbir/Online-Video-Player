# Video Player Online

A modern, YouTube-style video player for your local video files. Built with vanilla JavaScript, HTML, and Tailwind CSS, this player provides a seamless and feature-rich viewing experience directly in your browser, with a strong focus on privacy.

## Features

-   **Local Folder Loading**: Easily select and load a folder of videos from your computer. The player automatically creates a playlist.
-   **Full-Featured Controls**: A complete set of controls including play/pause, volume adjustment, seeking via a progress bar, and current/total time display.
-   **Dynamic Playlist**: A sidebar displays all the videos in your selected folder. Click any video to play it instantly. The currently playing video is always highlighted.
-   **Playback Speed Control**: Adjust the playback speed from 0.5x to 2.5x to watch at your own pace.
-   **Fullscreen Mode**: Immerse yourself in the video with a dedicated fullscreen mode.
-   **Responsive Design**: The player and playlist look great on both desktop and mobile devices.
-   **Visual Feedback Indicators**: On-screen indicators for play/pause, seeking, volume changes, and speed adjustments.
-   **Privacy First**: All video files are processed locally in your browser. Nothing is ever uploaded to a server.
-   **Powerful Keyboard Shortcuts**: Control playback without ever touching your mouse.

## How to Use

1.  Open the `index.html` file in your web browser.
2.  Click the **"Select Folder"** button on the welcome screen.
3.  Choose a local directory that contains your video files (e.g., MP4, WebM, Ogg).
4.  The application will load the videos, create a playlist, and start playing the first video automatically.
5.  Use the on-screen controls or keyboard shortcuts to manage playback.

## Keyboard Shortcuts

| Key                    | Action                                                     |
| ---------------------- | ---------------------------------------------------------- |
| `k` or `Space` (tap)   | Toggle Play/Pause                                          |
| `Space` (hold)         | Temporarily play at 2x speed (restores on release)         |
| `j` or `←` (Left Arrow)  | Seek backward 10 seconds                                   |
| `l` or `→` (Right Arrow) | Seek forward 10 seconds                                    |
| `↑` (Up Arrow)         | Increase volume                                            |
| `↓` (Down Arrow)       | Decrease volume                                            |
| `m`                    | Toggle Mute/Unmute                                         |
| `f`                    | Toggle Fullscreen mode                                     |

## Technology Stack

-   **HTML5**: For the core structure and the `<video>` element.
-   **CSS3 / Tailwind CSS**: For modern, responsive styling.
-   **Vanilla JavaScript (ES6+)**: For all player logic, DOM manipulation, and event handling.
-   **File System Access API**: For a modern directory selection experience (with a fallback for older browsers).
