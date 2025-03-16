import { Edit, Plus, Trash } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentation } from '../../context/DocumentationContext';
import { DocumentationCategory } from '../../types/documentationTypes';
import ArticleView from './ArticleView';
import CategoryNav from './CategoryNav';
import ResourceCard from './ResourceCard';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import VideoLibrary from './VideoLibrary';

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();
  const {
    resources,
    categories,
    loading,
    error,
    searchResults,
    searchDocumentation,
    deleteResource,
  } = useDocumentation();
  const [activeCategory, setActiveCategory] =
    useState<DocumentationCategory | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<'articles' | 'videos'>('articles');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      await searchDocumentation({ term: query });
    } else {
      setIsSearching(false);
    }
  };

  const handleCategorySelect = (categoryId: DocumentationCategory) => {
    setActiveCategory(categoryId);
    setIsSearching(false);
    setSelectedResourceId(null);
  };

  const handleResourceSelect = (resourceId: string) => {
    setSelectedResourceId(resourceId);
  };

  // Add new documentation
  const handleAddNew = () => {
    navigate('/documentation/edit/new');
  };

  // Edit existing documentation
  const handleEdit = (e: React.MouseEvent, resourceId: string) => {
    e.stopPropagation();
    navigate(`/documentation/edit/${resourceId}`);
  };

  // Delete documentation
  const handleDelete = async (e: React.MouseEvent, resourceId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this documentation?')) {
      try {
        await deleteResource(resourceId);
      } catch (error) {
        console.error('Error deleting documentation:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-full p-8'>
        <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600'></div>
        <span className='ml-3 text-gray-600'>Loading documentation...</span>
      </div>
    );
  }

  if (error) {
    return <div className='text-red-600 p-4'>Error: {error}</div>;
  }

  // Filter resources by active category if one is selected
  const filteredResources = activeCategory
    ? resources.filter((r) => r.category === activeCategory)
    : resources;

  // Display content based on current state
  const renderContent = () => {
    if (selectedResourceId) {
      return (
        <ArticleView
          resourceId={selectedResourceId}
          onBack={() => setSelectedResourceId(null)}
        />
      );
    }

    if (isSearching) {
      return (
        <SearchResults
          results={searchResults}
          query={searchQuery}
          onResourceSelect={handleResourceSelect}
        />
      );
    }

    switch (viewMode) {
      case 'videos':
        return <VideoLibrary onVideoSelect={handleResourceSelect} />;
      case 'articles':
      default:
        return (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredResources.map((resource) => (
              <div key={resource.id} className='relative group'>
                <ResourceCard
                  resource={resource}
                  onClick={() => handleResourceSelect(resource.id)}
                />
                <div className='absolute top-2 right-2 invisible group-hover:visible'>
                  <div className='bg-white rounded-full shadow flex space-x-1'>
                    <button
                      onClick={(e) => handleEdit(e, resource.id)}
                      className='p-1 text-gray-500 hover:text-amber-600'
                      title='Edit'
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, resource.id)}
                      className='p-1 text-gray-500 hover:text-red-600'
                      title='Delete'
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className='flex flex-col h-full'>
      <header className='bg-white shadow-sm p-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <h1 className='text-xl font-semibold'>HideSync Knowledge Base</h1>
          <button
            onClick={handleAddNew}
            className='ml-4 flex items-center text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700'
          >
            <Plus size={16} className='mr-1' />
            Add New
          </button>
        </div>
        <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
      </header>

      <div className='bg-white border-b'>
        <div className='mx-auto px-4'>
          <div className='flex -mb-px'>
            <button
              onClick={() => setViewMode('articles')}
              className={`mr-1 py-4 px-6 font-medium ${
                viewMode === 'articles'
                  ? 'border-b-2 border-amber-600 text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Articles
            </button>
            <button
              onClick={() => setViewMode('videos')}
              className={`mr-1 py-4 px-6 font-medium ${
                viewMode === 'videos'
                  ? 'border-b-2 border-amber-600 text-amber-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        <aside className='w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto'>
          <CategoryNav
            categories={categories}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
          />
        </aside>

        <main className='flex-1 p-6 overflow-y-auto bg-gray-50'>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default KnowledgeBase;
