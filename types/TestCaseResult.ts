export interface TestCaseResult {
  url: string;
  status: 'success' | 'error';
  error?: string;
}
