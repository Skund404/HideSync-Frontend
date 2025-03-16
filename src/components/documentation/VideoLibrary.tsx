// Re-export VideoLibrary from videos directory
import VideoLibrary from './videos/VideoLibrary';

// Export default
export default VideoLibrary;

// Also export the props interface
export type { VideoLibraryProps } from './videos/VideoLibrary';
// Export an empty object to make this a proper module
export {};
