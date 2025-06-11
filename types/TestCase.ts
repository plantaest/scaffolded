export interface TestCase {
  type: 'web';
  url: string;
  items: Array<Record<string, any>>;
}
