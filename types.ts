export interface TempMailApi {
  name: string;
  website: string;
  baseUrl: string;
  description: string;
  authType: 'No Auth' | 'API Key' | 'OAuth';
  supportsAttachments: boolean;
  rateLimit: string;
  hasInboxAccess: boolean;
}

export interface ChartDataPoint {
  time: string;
  latency: number;
  requests: number;
}

export interface GeneratedCode {
  language: string;
  code: string;
  explanation: string;
}
