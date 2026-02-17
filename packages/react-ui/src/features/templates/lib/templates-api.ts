import { api } from '@/lib/api';
import {
  FlowTemplate,
  FlowVersionTemplate,
  ListFlowTemplatesRequest,
  SeekPage,
  TemplateType,
} from '@activepieces/shared';

type CreateFlowTemplateRequest = {
  template: FlowVersionTemplate;
  type: TemplateType;
  blogUrl: string;
  description: string;
  id?: string;
  tags?: string[];
  metadata?: Record<string, string>;
};

export const templatesApi = {
  getTemplate(templateId: string) {
    return api.get<FlowTemplate>(`/v1/flow-templates/${templateId}`);
  },
  create(request: CreateFlowTemplateRequest) {
    return api.post<FlowTemplate>(`/v1/flow-templates`, request);
  },
  list(request?: ListFlowTemplatesRequest) {
    return api.get<SeekPage<FlowTemplate>>(`/v1/flow-templates`, request ?? {});
  },
  delete(templateId: string) {
    return api.delete<void>(`/v1/flow-templates/${templateId}`);
  },
};
