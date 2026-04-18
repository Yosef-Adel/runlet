import prettier from 'prettier';

export interface FormatOptions {
  tabWidth?: number;
  useTabs?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  trailingComma?: 'all' | 'es5' | 'none';
  parser?: string;
}

export async function formatCode(
  code: string,
  language: 'javascript' | 'typescript',
  options: FormatOptions = {}
): Promise<string> {
  const result = await prettier.format(code, {
    parser: language === 'typescript' ? 'typescript' : 'babel',
    tabWidth: options.tabWidth ?? 2,
    useTabs: options.useTabs ?? false,
    semi: options.semi ?? true,
    singleQuote: options.singleQuote ?? false,
    trailingComma: options.trailingComma ?? 'es5',
  });
  return result;
}
