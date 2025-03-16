// src/pages/ArticlePage.tsx

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ArticleView from '../components/documentation/ArticleView';
import Layout from '../components/layout/Layout';
import {
  DocumentationProvider,
  useDocumentation,
} from '../context/DocumentationContext';

interface ArticlePageParams {
  resourceId: string;
}

const ArticlePageContent: React.FC = () => {
  const { resourceId } = useParams<
    keyof ArticlePageParams
  >() as ArticlePageParams;
  const navigate = useNavigate();
  const { loadResource } = useDocumentation();

  useEffect(() => {
    const fetchResource = async () => {
      const resource = await loadResource(resourceId);
      if (!resource) {
        // Resource not found, redirect to main documentation page
        navigate('/documentation');
      }
    };

    fetchResource();
  }, [resourceId, loadResource, navigate]);

  const handleBack = () => {
    navigate('/documentation');
  };

  return <ArticleView resourceId={resourceId} onBack={handleBack} />;
};

const ArticlePage: React.FC = () => {
  return (
    <Layout>
      <DocumentationProvider>
        <div className='p-6'>
          <ArticlePageContent />
        </div>
      </DocumentationProvider>
    </Layout>
  );
};

export default ArticlePage;
