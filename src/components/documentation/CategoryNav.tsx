// src/components/documentation/CategoryNav.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useDocumentation } from '@/context/DocumentationContext';
import { ChevronDown, ChevronUp, Menu, X, BookOpen, Video, FileText, HelpCircle } from 'lucide-react';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorMessage from '@/components/common/ErrorMessage';

const CategoryNav: React.FC = () => {
  const { categories, loading, error, fetchCategories } = useDocumentation();
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        // Keep menu open on md breakpoint and above
        setIsMobileMenuOpen(window.innerWidth >= 768);
      }
    };

    // Set initial state
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle category expansion
  const toggleCategory = useCallback((id: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);

  // Generate the nav items JSX
  const navItems = categories.map(category => {
    const isActive = categoryId === category.id;
    const isExpanded = expandedCategories[category.id];

    return (
      <li key={category.id} className="mb-1">
        <div className="flex items-center">
          <Link
            to={`/documentation/category/${category.id}`}
            className={`flex-grow px-4 py-2 rounded-lg transition-colors ${
              isActive 
                ? 'bg-amber-100 text-amber-800' 
                : 'hover:bg-stone-100 text-stone-700'
            }`}
          >
            {category.icon ? (
              <span className="mr-2" dangerouslySetInnerHTML={{ __html: category.icon }} />
            ) : (
              <FileText size={16} className="mr-2 inline" />
            )}
            {category.name}
          </Link>
          
          {category.resources?.length > 0 && (
            <button
              onClick={() => toggleCategory(category.id)}
              className="p-2 text-stone-500 hover:text-stone-800"
              aria-label={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
        
        {isExpanded && category.resources?.length > 0 && (
          <ul className="pl-6 mt-1 border-l border-stone-200 space-y-1">
            {category.resources.map(resourceId => (
              <li key={resourceId}>
                <Link 
                  to={`/documentation/article/${resourceId}`}
                  className={`block py-1 px-3 text-sm hover:text-amber-700 ${
                    location.pathname === `/documentation/article/${resourceId}`
                      ? 'text-amber-600 font-medium'
                      : 'text-stone-600'
                  }`}
                >
                  {/* Ideally we'd display the resource title here, but we need to fetch it */}
                  {/* For now, we'll just use a placeholder */}
                  Article {resourceId.substring(0, 6)}...
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  });

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="md:hidden p-4 border-b border-stone-200">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center text-stone-700"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="ml-2">Documentation Menu</span>
        </button>
      </div>

      {/* Navigation sidebar - responsive */}
      <nav className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block
        w-full md:w-64 
        bg-white md:bg-stone-50 
        border-b md:border-b-0 md:border-r border-stone-200
        md:min-h-screen
        z-20 md:z-0
        fixed md:sticky top-0 md:top-16
        h-screen md:h-auto
        overflow-y-auto
        transition-all duration-200
      `}>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Documentation</h2>
          
          {/* Resource type links */}
          <div className="mb-6">
            <ul className="space-y-1">
              <li className="mb-1">
                <Link
                  to="/documentation"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    location.pathname === '/documentation' && !categoryId
                      ? 'bg-amber-100 text-amber-800'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <BookOpen size={16} className="mr-2" />
                  All Resources
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  to="/documentation/videos"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    location.pathname === '/documentation/videos'
                      ? 'bg-amber-100 text-amber-800'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <Video size={16} className="mr-2" />
                  Videos
                </Link>
              </li>
              <li className="mb-1">
                <Link
                  to="/documentation/help"
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    location.pathname === '/documentation/help'
                      ? 'bg-amber-100 text-amber-800'
                      : 'hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <HelpCircle size={16} className="mr-2" />
                  Help Guides
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories section */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 px-4">
              Categories
            </h3>
            
            {loading && categories.length === 0 ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="small" message="Loading categories..." />
              </div>
            ) : error ? (
              <div className="px-4 py-2">
                <ErrorMessage
                  message="Failed to load categories"
                  onRetry={fetchCategories}
                />
              </div>
            ) : categories.length === 0 ? (
              <p className="px-4 py-2 text-sm text-stone-500">No categories available.</p>
            ) : (
              <ul className="space-y-1">
                {navItems}
              </ul>
            )}
          </div>
          
          {/* Additional actions */}
          <div className="mt-6 px-4">
            <Link
              to="/documentation/new"
              className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
            >
              Create Documentation
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Mobile overlay backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-10 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default CategoryNav;