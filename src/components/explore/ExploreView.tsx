import React from 'react';
import { useRepoStore } from '../../store/useRepoStore';
import { FileTree } from './FileTree';
import { CodeViewer } from './CodeViewer';

export const ExploreView: React.FC = () => {
  const { repo, activeFile, activeLine } = useRepoStore();

  return (
    <div className="flex-1 flex h-full overflow-hidden bg-[#0d1117]">
      <FileTree nodes={repo.rootFiles} />
      <CodeViewer file={activeFile} targetLine={activeLine} />
    </div>
  );
};
