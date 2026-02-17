import { useQuery } from '@tanstack/react-query';

import { authenticationSession } from '../../../lib/authentication-session';

type ProjectMemberWithUser = {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  projectRole: {
    name: string;
  };
};

import { projectMembersApi } from './project-members-api';

export const projectMembersHooks = {
  useProjectMembers: () => {
    const query = useQuery<ProjectMemberWithUser[]>({
      queryKey: ['project-members'],
      queryFn: async () => {
        const projectId = authenticationSession.getProjectId();
        if (projectId === null) {
          throw new Error('Project ID is null');
        }
        const res = await projectMembersApi.list({
          projectId: projectId,
          projectRoleId: undefined,
          cursor: undefined,
          limit: 100,
        });
        return res.data;
      },
      staleTime: Infinity,
    });
    return {
      projectMembers: query.data,
      isLoading: query.isLoading,
      refetch: query.refetch,
    };
  },
};
