// src/components/documentation/videos/VideoCollection.tsx

import { Clock, Filter, Grid, Info, List, Play, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SkillLevel, VideoResource } from '../../../types/documentationTypes';

export interface VideoItem extends VideoResource {
  resourceId?: string;
  category?: string;
  tags?: string[];
  skillLevel?: SkillLevel;
  popularity?: number; // 1-100 rating
}

export interface VideoCategory {
  id: string;
  name: string;
  description?: string;
  videos: VideoItem[];
}

interface VideoCollectionProps {
  title: string;
  description?: string;
  categories: VideoCategory[];
  onVideoSelect?: (video: VideoItem) => void;
  featuredVideos?: VideoItem[];
}

const VideoCollection: React.FC<VideoCollectionProps> = ({
  title,
  description,
  categories,
  onVideoSelect,
  featuredVideos = [],
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [skillFilter, setSkillFilter] = useState<SkillLevel | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get all unique videos across categories
  const allVideos = useMemo(() => {
    const videos: VideoItem[] = [];

    categories.forEach((category) => {
      category.videos.forEach((video) => {
        if (!videos.some((v) => v.videoId === video.videoId)) {
          videos.push({
            ...video,
            category: category.id,
          });
        }
      });
    });

    return videos;
  }, [categories]);

  // Filter videos based on active filters
  const filteredVideos = useMemo(() => {
    let videos = allVideos;

    // Apply category filter
    if (activeCategory !== 'all') {
      videos = videos.filter((video) => video.category === activeCategory);
    }

    // Apply skill level filter
    if (skillFilter !== 'all') {
      videos = videos.filter((video) => video.skillLevel === skillFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      videos = videos.filter(
        (video) =>
          video.title.toLowerCase().includes(searchLower) ||
          video.description?.toLowerCase().includes(searchLower) ||
          video.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return videos;
  }, [allVideos, activeCategory, skillFilter, searchTerm]);

  // Format duration string (e.g., "5:20" -> "5 mins 20 secs")
  const formatDuration = (duration?: string): string => {
    if (!duration) return '';

    const [minutes, seconds] = duration.split(':').map((num) => parseInt(num));

    if (minutes === 0) {
      return `${seconds} secs`;
    } else if (seconds === 0) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    } else {
      return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${
        seconds !== 1 ? 's' : ''
      }`;
    }
  };

  // Handle video selection
  const handleVideoClick = (video: VideoItem) => {
    if (onVideoSelect) {
      onVideoSelect(video);
    } else if (video.resourceId) {
      navigate(`/documentation/${video.resourceId}`);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('all');
    setSkillFilter('all');
  };

  return (
    <div className='video-collection'>
      <div className='bg-white rounded-lg shadow-sm border overflow-hidden mb-6'>
        <div className='p-4 border-b'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-xl font-medium'>{title}</h2>
              {description && (
                <p className='text-gray-600 text-sm mt-1'>{description}</p>
              )}
            </div>

            <div className='flex space-x-2'>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title='Grid view'
              >
                <Grid size={18} />
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title='List view'
              >
                <List size={18} />
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded ${
                  showFilters
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                title='Show filters'
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className='mt-4'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <Search size={16} className='text-gray-400' />
              </div>
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search videos...'
                className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm'
              />
            </div>
          </div>
        </div>

        {showFilters && (
          <div className='p-4 bg-gray-50 border-b'>
            <div className='flex flex-wrap gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Category
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) =>
                    setActiveCategory(e.target.value as string | 'all')
                  }
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
                >
                  <option value='all'>All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Skill Level
                </label>
                <select
                  value={skillFilter}
                  onChange={(e) =>
                    setSkillFilter(e.target.value as SkillLevel | 'all')
                  }
                  className='block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm'
                >
                  <option value='all'>All Levels</option>
                  <option value={SkillLevel.BEGINNER}>Beginner</option>
                  <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                  <option value={SkillLevel.ADVANCED}>Advanced</option>
                </select>
              </div>

              <div className='flex items-end'>
                <button
                  onClick={resetFilters}
                  className='px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Featured videos section */}
        {featuredVideos.length > 0 &&
          !searchTerm &&
          activeCategory === 'all' &&
          skillFilter === 'all' && (
            <div className='p-4 border-b'>
              <h3 className='font-medium mb-3'>Featured Videos</h3>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                }
              >
                {featuredVideos.map((video) => (
                  <div
                    key={video.videoId}
                    className={`border rounded-lg overflow-hidden hover:shadow-md cursor-pointer ${
                      viewMode === 'list' ? 'flex items-start' : ''
                    }`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div
                      className={`relative ${
                        viewMode === 'list' ? 'w-40 flex-shrink-0' : ''
                      }`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/${
                          video.thumbnailQuality || 'hqdefault'
                        }.jpg`}
                        alt={video.title}
                        className='w-full aspect-video object-cover'
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
                        <div className='bg-black bg-opacity-60 rounded-full p-3'>
                          <Play className='w-8 h-8 text-white' />
                        </div>
                      </div>
                      {video.duration && (
                        <div className='absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center'>
                          <Clock size={12} className='mr-1' />
                          {video.duration}
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}
                    >
                      <h4 className='font-medium text-gray-900'>
                        {video.title}
                      </h4>
                      {video.description && (
                        <p
                          className={`text-gray-600 mt-1 ${
                            viewMode === 'list' ? '' : 'line-clamp-2'
                          }`}
                        >
                          {video.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Main video listing */}
        <div className='p-4'>
          {filteredVideos.length > 0 ? (
            <>
              <div className='flex justify-between mb-3'>
                <h3 className='font-medium'>
                  {searchTerm ? 'Search Results' : 'All Videos'}
                </h3>
                <span className='text-sm text-gray-500'>
                  {filteredVideos.length} video
                  {filteredVideos.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                    : 'space-y-2'
                }
              >
                {filteredVideos.map((video) => (
                  <div
                    key={video.videoId}
                    className={`border rounded-lg overflow-hidden hover:shadow-md cursor-pointer ${
                      viewMode === 'list' ? 'flex items-start' : ''
                    }`}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div
                      className={`relative ${
                        viewMode === 'list' ? 'w-40 flex-shrink-0' : ''
                      }`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/${
                          video.thumbnailQuality || 'hqdefault'
                        }.jpg`}
                        alt={video.title}
                        className='w-full aspect-video object-cover'
                      />
                      <div className='absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity'>
                        <div className='bg-black bg-opacity-60 rounded-full p-3'>
                          <Play className='w-6 h-6 text-white' />
                        </div>
                      </div>
                      {video.duration && (
                        <div className='absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center'>
                          <Clock size={12} className='mr-1' />
                          {video.duration}
                        </div>
                      )}
                    </div>

                    <div
                      className={`p-3 ${viewMode === 'list' ? 'flex-1' : ''}`}
                    >
                      <div className='flex items-start justify-between'>
                        <h4 className='font-medium text-gray-900'>
                          {video.title}
                        </h4>
                        {viewMode === 'list' && video.skillLevel && (
                          <span
                            className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                              video.skillLevel === SkillLevel.BEGINNER
                                ? 'bg-green-100 text-green-800'
                                : video.skillLevel === SkillLevel.INTERMEDIATE
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {video.skillLevel}
                          </span>
                        )}
                      </div>

                      {video.description && (
                        <p
                          className={`text-gray-600 mt-1 ${
                            viewMode === 'list' ? '' : 'line-clamp-2'
                          }`}
                        >
                          {video.description}
                        </p>
                      )}

                      {viewMode === 'list' && (
                        <div className='mt-2 flex items-center text-xs text-gray-500'>
                          {video.duration && (
                            <span className='mr-3 flex items-center'>
                              <Clock size={12} className='mr-1' />
                              {formatDuration(video.duration)}
                            </span>
                          )}

                          {video.category &&
                            categories.find((c) => c.id === video.category) && (
                              <span className='mr-3'>
                                {
                                  categories.find(
                                    (c) => c.id === video.category
                                  )?.name
                                }
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className='text-center py-8'>
              <div className='inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 mb-4'>
                <Info size={24} />
              </div>
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                No videos found
              </h3>
              <p className='text-gray-500'>
                {searchTerm
                  ? `No videos match "${searchTerm}" with the current filters.`
                  : 'No videos match the current filters.'}
              </p>
              <button
                onClick={resetFilters}
                className='mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500'
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCollection;
